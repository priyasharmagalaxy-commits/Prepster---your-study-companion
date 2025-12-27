
import { AnalysisResult } from "../types";

export const analyzeNotes = async (
  content: string,
  image?: string
): Promise<AnalysisResult> => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, image }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to analyze notes');
  }

  return response.json();
};

export const generateTopicImage = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      // Fallback or error handling
      return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/450`;
    }

    const data = await response.json();
    return data.imageData || `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/450`;
  } catch (error) {
    console.error("Image generation failed:", error);
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/450`;
  }
};
