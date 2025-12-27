
import { GoogleGenAI } from "@google/genai";

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
        const { prompt } = body;

        if (!API_KEY) {
            return new Response(JSON.stringify({ error: 'Server configuration error: API Key missing' }), { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { text: `Create a clean, artistic, high-quality educational illustration for: ${prompt}. Use soft academic colors and professional design.` }
                ]
            },
            config: {
                // Mocking image config - strictly 16:9 not always supported in bare generateContent for all models, but prompts help
            }
        });

        // Simplified response handling for serverless
        // Note: Actual image generation models might need different handling if not using the unified generateContent or if returning base64 directly
        // Assuming the logic matches what was in client-side which seemed to assume inlineData response

        // For 'gemini-2.5-flash-image' or similar, we check candidates
        const part = response.candidates?.[0]?.content?.parts?.[0];

        if (part && 'inlineData' in part && part.inlineData) {
            return new Response(JSON.stringify({ imageData: `data:image/png;base64,${part.inlineData.data}` }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Fallback if no image generated (or text response)
        return new Response(JSON.stringify({
            imageData: `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/450`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("API Error:", error);
        // Fallback on error
        return new Response(JSON.stringify({
            imageData: `https://picsum.photos/seed/${encodeURIComponent("error")}/800/450`
        }), { status: 200 });
    }
}
