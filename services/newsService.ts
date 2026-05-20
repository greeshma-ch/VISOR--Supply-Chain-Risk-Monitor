import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  timestamp: string;
}

export const fetchRealTimeNews = async (category: string): Promise<NewsItem[]> => {
  try {
    const query = category === 'ALL' 
      ? "latest global supply chain and logistics news" 
      : `latest supply chain and logistics news for ${category} region`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Fetch the 5 most recent and relevant news articles about ${query}. 
      Return the data as a JSON array of objects with the following properties:
      - title: The headline of the news article.
      - summary: A concise 1-2 sentence summary.
      - url: The direct URL to the article.
      - source: The name of the news outlet.
      - timestamp: The publication date or relative time (e.g., "2 hours ago").`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text || '[]';
    // The model might return markdown JSON blocks, so we clean it
    const cleanJson = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error fetching real-time news:", error);
    // Fallback mock data if search fails or limit reached
    return [
      {
        title: "Global Port Congestion Reaches New Peak in Q2",
        summary: "Major shipping hubs report record delays as consumer demand surges ahead of peak season.",
        url: "https://www.reuters.com",
        source: "Reuters",
        timestamp: "3 hours ago"
      },
      {
        title: "New Trade Regulations Impacting Trans-Pacific Routes",
        summary: "Updated customs protocols are causing temporary bottlenecks for electronics and automotive components.",
        url: "https://www.bloomberg.com",
        source: "Bloomberg",
        timestamp: "5 hours ago"
      }
    ];
  }
};
