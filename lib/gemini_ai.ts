import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini_ai = new GoogleGenerativeAI(process.env.NEXT_GEMINI_API_KEY || "");

export const gemini = gemini_ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });