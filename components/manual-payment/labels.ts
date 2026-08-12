export type PayLang = "MARATHI" | "HINDI" | "ENGLISH";

export interface PayLabels {
    headerTitle: (amount: number) => string;
    scanToPay: string;
    amountLabel: string;
    openUpiApp: (amount: number) => string;
    upiId: string;
    payTo: string;
    orderId: string;
    qrHelp: (amount: number) => string;
    desktopWarning: string;
    mobileHint: string;
    proofTitle: string;
    proofSubtitle: string;
    screenshotLabel: string;
    uploadCta: string;
    utrLabel: string;
    utrPlaceholderReading: string;
    utrPlaceholder: string;
    utrHelp: string;
    utrAutoFilledHelp: string;
    aiReading: string;
    autoFilled: string;
    submit: string;
    verifying: string;
    approvedTitle: string;
    approvedMessage: string;
    approvedFooter: string;
    reviewTitle: string;
    reviewFooter: string;
    iHavePaid: string;
    step1: string;
    step2: string;
    stepBack: string;
}

const en: PayLabels = {
    headerTitle: (a) => `UPI Payment — ₹${a}`,
    scanToPay: "SCAN TO PAY",
    amountLabel: "Amount",
    openUpiApp: (a) => `Pay ₹${a} — Open UPI App`,
    upiId: "UPI ID",
    payTo: "PAY TO",
    orderId: "ORDER ID",
    qrHelp: (a) => `Scan QR with any UPI app (GPay, PhonePe, Paytm) and pay ₹${a}. Then upload the payment screenshot below.`,
    desktopWarning: "⚠️ UPI app links work only on mobile. On desktop, scan QR with your phone.",
    mobileHint: "Tap above to open UPI app · Desktop users: scan QR with phone",
    proofTitle: "Submit Payment Proof",
    proofSubtitle: "After paying via UPI, paste UTR + upload screenshot.",
    screenshotLabel: "Payment Screenshot",
    uploadCta: "Tap to upload (JPG/PNG, max 5MB)",
    utrLabel: "UTR / Transaction ID",
    utrPlaceholderReading: "Reading from screenshot…",
    utrPlaceholder: "e.g. 649771742994",
    utrHelp: "12-digit UPI Transaction ID from your payment app.",
    utrAutoFilledHelp: "Verify the UTR matches your screenshot before submitting.",
    aiReading: "AI reading…",
    autoFilled: "Auto-filled by AI",
    submit: "Submit for Verification",
    verifying: "Verifying with AI…",
    approvedTitle: "Payment Verified!",
    approvedMessage: "Payment verified",
    approvedFooter: "PDF being sent to your WhatsApp + Email.",
    reviewTitle: "Submitted for Review",
    reviewFooter: "We will verify within a few hours and send PDF to WhatsApp + Email.",
    iHavePaid: "I have paid — Next: Upload Screenshot",
    step1: "Step 1: Pay via UPI",
    step2: "Step 2: Upload Payment Proof",
    stepBack: "← Back",
};

const mr: PayLabels = {
    headerTitle: (a) => `UPI पेमेंट — ₹${a}`,
    scanToPay: "स्कॅन करून पेमेंट करा",
    amountLabel: "रक्कम",
    openUpiApp: (a) => `₹${a} पेमेंट करा — UPI ॲप उघडा`,
    upiId: "UPI आयडी",
    payTo: "यांना पैसे द्या",
    orderId: "ऑर्डर आयडी",
    qrHelp: (a) => `कोणत्याही UPI ॲपने (GPay, PhonePe, Paytm) QR स्कॅन करा आणि ₹${a} भरा. नंतर पेमेंटचा स्क्रीनशॉट खाली अपलोड करा.`,
    desktopWarning: "⚠️ UPI ॲप लिंक फक्त मोबाइलवर चालतात. डेस्कटॉपवर फोनने QR स्कॅन करा.",
    mobileHint: "वरील बटण दाबून UPI ॲप उघडा · डेस्कटॉप वापरकर्ते: फोनने QR स्कॅन करा",
    proofTitle: "पेमेंट पुरावा सबमिट करा",
    proofSubtitle: "UPI द्वारे पेमेंट केल्यावर, UTR टाका आणि स्क्रीनशॉट अपलोड करा.",
    screenshotLabel: "पेमेंट स्क्रीनशॉट",
    uploadCta: "अपलोड करण्यासाठी टॅप करा (JPG/PNG, कमाल 5MB)",
    utrLabel: "UTR / ट्रान्झॅक्शन आयडी",
    utrPlaceholderReading: "स्क्रीनशॉट वाचत आहे…",
    utrPlaceholder: "उदा. 649771742994",
    utrHelp: "पेमेंट ॲपमधील 12-अंकी UPI ट्रान्झॅक्शन आयडी.",
    utrAutoFilledHelp: "सबमिट करण्यापूर्वी UTR तुमच्या स्क्रीनशॉटशी जुळतो याची खात्री करा.",
    aiReading: "AI वाचत आहे…",
    autoFilled: "AI ने आपोआप भरले",
    submit: "व्हेरिफिकेशनसाठी सबमिट करा",
    verifying: "AI सह व्हेरिफाय करत आहे…",
    approvedTitle: "पेमेंट व्हेरिफाय झाले!",
    approvedMessage: "पेमेंट व्हेरिफाय झाले",
    approvedFooter: "PDF तुमच्या WhatsApp आणि ईमेलवर पाठवली जात आहे.",
    reviewTitle: "रिव्ह्यूसाठी सबमिट केले",
    reviewFooter: "आम्ही काही तासांत व्हेरिफाय करू आणि WhatsApp आणि ईमेलवर PDF पाठवू.",
    iHavePaid: "मी पेमेंट केले — पुढे: स्क्रीनशॉट अपलोड करा",
    step1: "पायरी 1: UPI द्वारे पेमेंट करा",
    step2: "पायरी 2: पेमेंट पुरावा अपलोड करा",
    stepBack: "← मागे",
};

const hi: PayLabels = {
    headerTitle: (a) => `UPI भुगतान — ₹${a}`,
    scanToPay: "स्कैन करके भुगतान करें",
    amountLabel: "राशि",
    openUpiApp: (a) => `₹${a} भुगतान करें — UPI ऐप खोलें`,
    upiId: "UPI आईडी",
    payTo: "इन्हें भुगतान करें",
    orderId: "ऑर्डर आईडी",
    qrHelp: (a) => `किसी भी UPI ऐप (GPay, PhonePe, Paytm) से QR स्कैन करें और ₹${a} का भुगतान करें। फिर नीचे स्क्रीनशॉट अपलोड करें।`,
    desktopWarning: "⚠️ UPI ऐप लिंक केवल मोबाइल पर काम करते हैं। डेस्कटॉप पर फोन से QR स्कैन करें।",
    mobileHint: "ऊपर टैप करके UPI ऐप खोलें · डेस्कटॉप उपयोगकर्ता: फोन से QR स्कैन करें",
    proofTitle: "भुगतान प्रमाण सबमिट करें",
    proofSubtitle: "UPI से भुगतान के बाद, UTR दर्ज करें और स्क्रीनशॉट अपलोड करें।",
    screenshotLabel: "भुगतान स्क्रीनशॉट",
    uploadCta: "अपलोड करने के लिए टैप करें (JPG/PNG, अधिकतम 5MB)",
    utrLabel: "UTR / ट्रांज़ैक्शन आईडी",
    utrPlaceholderReading: "स्क्रीनशॉट पढ़ रहा है…",
    utrPlaceholder: "उदा. 649771742994",
    utrHelp: "पेमेंट ऐप का 12-अंकीय UPI ट्रांज़ैक्शन आईडी।",
    utrAutoFilledHelp: "सबमिट करने से पहले सुनिश्चित करें कि UTR आपके स्क्रीनशॉट से मेल खाता है।",
    aiReading: "AI पढ़ रहा है…",
    autoFilled: "AI ने स्वतः भरा",
    submit: "वेरिफिकेशन के लिए सबमिट करें",
    verifying: "AI से वेरिफाई हो रहा है…",
    approvedTitle: "भुगतान सत्यापित!",
    approvedMessage: "भुगतान सत्यापित",
    approvedFooter: "PDF आपके WhatsApp और ईमेल पर भेजी जा रही है।",
    reviewTitle: "समीक्षा के लिए सबमिट किया",
    reviewFooter: "हम कुछ घंटों में वेरिफाई करेंगे और WhatsApp व ईमेल पर PDF भेजेंगे।",
    iHavePaid: "मैंने भुगतान कर दिया — अगला: स्क्रीनशॉट अपलोड करें",
    step1: "चरण 1: UPI द्वारा भुगतान करें",
    step2: "चरण 2: भुगतान प्रमाण अपलोड करें",
    stepBack: "← वापस",
};

export function getPayLabels(lang?: PayLang | string | null): PayLabels {
    if (lang === "MARATHI") return mr;
    if (lang === "HINDI") return hi;
    return en;
}
