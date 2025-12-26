
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const API_KEY = process.env.API_KEY || "";

export const analyzeNotes = async (
  content: string,
  image?: string
): Promise<AnalysisResult> => {
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
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema
    }
  });

  return JSON.parse(response.text || "{}") as AnalysisResult;
};

export const generateTopicImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Create a clean, artistic, high-quality educational illustration for: ${prompt}. Use soft academic colors and professional design.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/450`;
};
