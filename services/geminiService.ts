import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  // Safety check for process.env in browser environments
  const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
  
  if (!apiKey) {
    console.warn("API Key not found - AI features disabled");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateGameCommentary = async (score: number, reason: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Good game!";

  try {
    const prompt = `
      The player just finished a game of Snake.
      Score: ${score}.
      Reason for death: ${reason}.
      
      Act as a witty, slightly sarcastic, or encouraging arcade machine spirit.
      Write a VERY short, one-sentence comment (max 15 words) in Chinese about their performance.
      If the score is low (<5), roast them gently. If high (>20), praise them.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Game Over!";
  }
};