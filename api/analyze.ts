
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
    runtime: 'edge',
};

const API_KEY = process.env.GEMINI_API_KEY || "";

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const body = await request.json();
        const { content, image } = body;

        if (!API_KEY) {
            return new Response(JSON.stringify({ error: 'Server configuration error: API Key missing' }), { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                topicTitle: { type: Type.STRING, description: "A catchy title for the topic of the notes" },
                summary: { type: Type.STRING, description: "A detailed summary of the notes" },
                keyPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "5-7 key takeaways or highlights"
                },
                questions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.STRING, description: "The text of the correct option" },
                            explanation: { type: Type.STRING, description: "Detailed reasoning why this is correct" }
                        },
                        required: ["question", "options", "correctAnswer", "explanation"]
                    },
                    description: "5 framed multiple-choice questions based on the notes"
                },
                quotes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 inspiring or relevant quotes about this topic"
                },
                imagePrompt: { type: Type.STRING, description: "A visual prompt to generate an image representing the topic" }
            },
            required: ["topicTitle", "summary", "keyPoints", "questions", "quotes", "imagePrompt"]
        };

        const parts: any[] = [{ text: "Analyze these student notes and provide a structured learning experience including a summary, key highlights, 5 quiz questions, and quotes. Notes follow:\n" + content }];

        if (image) {
            parts.push({
                inlineData: {
                    data: image.split(',')[1],
                    mimeType: "image/jpeg"
                }
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite-preview-02-05", // Updated model for better stability
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        const result = JSON.parse(response.text || "{}");
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
    }
}
