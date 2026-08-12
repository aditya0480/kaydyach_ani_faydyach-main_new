import { prisma_db } from "./prisma";
import { getCloudFrontSignedUrl } from "./s3";

const INTERAKT_API_KEY = process.env.INTERAKT_API_KEY;

// Configuration for books with direct PDF WhatsApp templates (Template mapping only)
const BOOK_PDF_CONFIGS: Record<string, { templateName: string }> = {
    // RTI Book
    "cmkp0bdsj0004xlrz5iyaqbk7": {
        templateName: "payment_sucess_pdf_v2",
    },
    // Property Law Book (Malmatta)
    "cmk163mbe000004kyhqrih4e5": {
        templateName: "payment_sucess_pdf_v2",
    },
    // Marriage & Divorce Law Book (Vivah)
    "cmkdvuui9000004l170b2db2g": {
        templateName: "payment_sucess_pdf_v2",
    },
    // Home Buying (Ghar Ghenyadhi)
    "cmki9y4mk000f04jowhl6babh": {
        templateName: "payment_sucess_pdf_v2",
    },
    // Ultrosity Kayda Hakk Aani Sanrakshan Combo
    "cmlt3nxe200rbsurzz34xa8lz": {
        templateName: "payment_sucess_pdf_v2",
    },
    // Hunda Kayda (Dowry Law)
    "cmlt81qx40000ljrzizcl4nza": {
        templateName: "payment_sucess_pdf_v2",
    }
};

interface SendWhatsappTemplateParams {
    phone: string;
    templateName: string;
    languageCode?: string;
    headerValues?: string[];
    bodyValues: string[];
    buttonValues?: Record<string, string[]>;
}
export const sendWhatsappMessage = async ({
    phone,
    templateName,
    languageCode = "mr",
    headerValues = [],
    bodyValues,
    buttonValues
}: SendWhatsappTemplateParams) => {
    if (!INTERAKT_API_KEY) {
        console.warn("[WHATSAPP] INTERAKT_API_KEY is not set. Skipping message.");
        return;
    }

    // Dev override: route all WhatsApp messages to a single test number
    const devOverride = process.env.DEV_WHATSAPP_OVERRIDE;
    const targetPhone = devOverride ? devOverride : phone;
    if (devOverride) {
        console.info(`[WHATSAPP] Dev override: routing message from ${phone} → ${devOverride}`);
    }

    // Sanitize Phone Number
    // Remove all non-numeric characters
    let cleanPhone = targetPhone.replace(/[^0-9]/g, "");

    // If 10 digits, assume India (+91)
    if (cleanPhone.length === 10) {
        cleanPhone = "91" + cleanPhone;
    }

    // Interakt expects:
    // countryCode: "+91"
    // phoneNumber: "9876543210"

    // We can extract country code. Assuming first 2 digits are country code if length > 10.
    // This is a simplification but works for 91.
    const countryCode = "+" + cleanPhone.substring(0, 2);
    const phoneNumber = cleanPhone.substring(2);

    const payload = {
        countryCode,
        phoneNumber,
        callbackData: "payment_success_msg",
        type: "Template",
        template: {
            name: templateName,
            languageCode,
            headerValues,
            bodyValues,
            buttonValues
        }
    };

    // Determine Authorization Header
    // The user's .env might contain the RAW key OR the Base64 Encoded key
    let authHeader = "";

    // Check if it looks like it's already properly encoded (Base64)
    // The value in .env 'Y0Rj...' decodes to '..._0:' which ends in a colon, 
    // signifying it is already 'Base64(Key + ":")'.
    try {
        const decoded = Buffer.from(INTERAKT_API_KEY, "base64").toString("utf-8");
        if (decoded.endsWith(":")) {
            // It is already encoded correctly!
            authHeader = `Basic ${INTERAKT_API_KEY}`;
        }
    } catch {
        // Ignore error
    }

    // Default fallback: If not already encoded, encode it now.
    if (!authHeader) {
        // If the raw key was just "Key" without colon, we add colon and encode.
        // If the raw key was "Key:", we just encode.
        const toEncode = INTERAKT_API_KEY.endsWith(":") ? INTERAKT_API_KEY : INTERAKT_API_KEY + ":";
        authHeader = `Basic ${Buffer.from(toEncode).toString("base64")}`;
    }

    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.info(`[WHATSAPP] Sending template "${templateName}" to ${cleanPhone} (attempt ${attempt}/${MAX_RETRIES})`, {
                template: payload.template
            });

            const response = await fetch("https://api.interakt.ai/v1/public/message/", {
                method: "POST",
                headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[WHATSAPP] Error sending message: ${response.status} ${errorText}`);
                // Retry on server errors (5xx), not client errors (4xx)
                if (response.status >= 500 && attempt < MAX_RETRIES) {
                    await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
                    continue;
                }
            } else {
                const responseData = await response.json();
                console.info(`[WHATSAPP] Message sent to ${cleanPhone}`, responseData);
            }
            return; // Success or non-retryable error
        } catch (error) {
            console.error(`[WHATSAPP] Exception sending message (attempt ${attempt}/${MAX_RETRIES}):`, error);
            if (attempt < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
            }
        }
    }
    console.error(`[WHATSAPP] All ${MAX_RETRIES} attempts failed for ${cleanPhone}`);
};

export const sendPaymentSuccessWhatsapp = async (
    phone: string,
    customerName: string,
    bookTitle: string,
    downloadLink: string,
    pdfUrl?: string // Optional PDF URL for document header
) => {
    // Variable mapping for 'payment_sucess_pdf_v2' (Approved Template)
    // Header: Document (Requires public URL)
    // Body: {{1}} -> Book Title (Now includes pages)

    await sendWhatsappMessage({
        phone,
        templateName: "payment_sucess_pdf_v2",
        languageCode: "mr", // Marathi
        headerValues: [pdfUrl || downloadLink], // Fallback to link if no direct PDF
        bodyValues: [
            bookTitle // {{1}} -> Book Title (now with page count)
        ]
    });
};

// Helper function to check if a book has PDF delivery configured
export const hasBookPdfConfig = (ebookId: string): boolean => {
    return ebookId in BOOK_PDF_CONFIGS;
};

// Generic function for sending books with PDF attachment
export const sendBookWithPdfWhatsapp = async (
    phone: string,
    customerName: string,
    ebookId: string,
    bookTitle: string // Added parameter
) => {
    const config = BOOK_PDF_CONFIGS[ebookId];

    if (!config) {
        console.error(`[WHATSAPP] No PDF config found for ebook ID: ${ebookId}`);
        return;
    }

    // Variable mapping for PDF templates
    // Header: Document (requires public PDF URL)

    // If template is "payment_sucess_pdf_v2" (New Standard Combo Template)
    // {{1}} -> Book Title

    // Legacy Templates (rti_book_v1, etc.)
    // {{1}} -> Customer Name

    const ebook = await prisma_db.ebook.findUnique({
        where: { id: ebookId },
        select: { fileUrl: true }
    });

    if (!ebook || !ebook.fileUrl) {
        console.error(`[WHATSAPP] No fileUrl found for ebook ID: ${ebookId}`);
        return;
    }

    // Generate a signed URL for WhatsApp (CloudFront)
    // We use a longer expiry for WhatsApp (e.g., 24 hours) to ensure reliability
    const pdfUrl = await getCloudFrontSignedUrl(ebook.fileUrl, 86400);

    const bodyValues = config.templateName === "payment_sucess_pdf_v2"
        ? [bookTitle]
        : [customerName];

    await sendWhatsappMessage({
        phone,
        templateName: config.templateName,
        languageCode: "mr", // Marathi
        headerValues: [pdfUrl], // Document URL must be passed here
        // Body differs based on template
        bodyValues: bodyValues
    });
};



// Function for Pending Payment Follow-up (Manual Trigger)
export const sendPaymentReminder = async (
    phone: string,
    customerName: string,
    bookTitle: string,
    paymentResumeLink: string
) => {
    // Template: pending_payment_followup_v1
    // {{1}} -> Name
    // {{2}} -> Book Title
    // {{3}} -> Payment Link

    await sendWhatsappMessage({
        phone,
        templateName: "pending_followup_v2",
        languageCode: "mr",
        bodyValues: [
            customerName,
            bookTitle,
            paymentResumeLink
        ]
    });
};

// Function for Combo Book PDF sending
export const sendComboPdfWhatsapp = async (
    phone: string,
    bookTitle: string,
    pdfUrl: string
) => {
    // Template: payment_sucess_pdf_v2
    // Header: Document (PDF URL)
    // Body: {{1}} -> Book Title

    await sendWhatsappMessage({
        phone,
        templateName: "payment_sucess_pdf_v2",
        languageCode: "mr",
        headerValues: [pdfUrl],
        bodyValues: [
            bookTitle
        ]
    });
};
