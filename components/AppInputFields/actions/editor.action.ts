"use server";

import { gemini } from "@/lib/gemini_ai";
import markdown from "@wcj/markdown-to-html";

interface GenerateContentParams {
    currentContent: string;
    userPrompt: string;
    context?: string;
}

export async function generateEditorContent({
    currentContent,
    userPrompt,
    context,
}: GenerateContentParams) {
    try {
        // Clean the current content (remove HTML tags for better context)
        const cleanCurrentContent = currentContent
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        // Build the prompt for Gemini
        const systemPrompt = `You are an AI content generator helping users create and improve their content. 

IMPORTANT INSTRUCTIONS:
1. ALWAYS respond ONLY in Markdown format
2. Do NOT include any explanations, introductions, or meta-commentary
3. Generate content that seamlessly integrates with or replaces the existing content
4. Focus on the user's specific request
5. Response should be 100 to 200 words long
6. NEVER use placeholders like [Insert X Here] or [Your Y Here] - always use specific, real content
7. If you need specific information that wasn't provided, create realistic examples instead of placeholders

Current Content Context:
${cleanCurrentContent ? `"${cleanCurrentContent}"` : "(No existing content)"}

${context ? `Additional Context: ${context}` : ""}

User Request: ${userPrompt}

Please generate the requested content in Markdown format:`;

        // Call Gemini AI
        const result = await gemini.generateContent(systemPrompt);
        const response = result.response;

        console.info(`🚀 ~ editor.action.ts:46 ~ response:`, response)

        const generatedMarkdown = response.text();

        if (!generatedMarkdown || generatedMarkdown.trim() === "") {
            return {
                success: false,
                error: "No content generated. Please try again with a different prompt.",
            };
        }

        // Convert markdown to HTML
        const htmlContent = markdown(generatedMarkdown);

        if (typeof htmlContent !== "string") {
            return {
                success: false,
                error: "Failed to convert generated content to HTML format.",
            };
        }

        return {
            success: true,
            content: htmlContent,
            originalMarkdown: generatedMarkdown,
        };
    } catch (error) {
        console.error("Error generating content with Gemini:", error);

        // Handle specific error types
        if (error instanceof Error) {
            if (error.message.includes("API_KEY")) {
                return {
                    success: false,
                    error: "AI service configuration error. Please contact support.",
                };
            }
            if (error.message.includes("quota") || error.message.includes("limit")) {
                return {
                    success: false,
                    error: "AI service is temporarily unavailable. Please try again later.",
                };
            }
        }

        return {
            success: false,
            error: "Failed to generate content. Please try again.",
        };
    }
}