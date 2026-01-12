import { prisma } from './db';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'; // Standard OpenAI-compatible endpoint for DeepSeek

interface AIAnalysisResult {
  category: string;
  keyword: string;
  summary: string;
}

export async function analyzeContent(title: string, content: string): Promise<AIAnalysisResult | null> {
  if (!DEEPSEEK_API_KEY) return null;

  try {
    const prompt = `
    Analyze the following news article. 
    1. Categorize it into one of these exact categories: 'world', 'business', 'tech', 'opinion', 'general'.
    2. Extract a single short keyword (max 2 words) that represents the main subject (e.g., 'Apple', 'Climate', 'Stock Market', 'Election'). This will be used for an image placeholder.
    3. Write a very short 1-sentence summary (max 30 words).

    Title: ${title}
    Content Snippet: ${content.substring(0, 500)}

    Respond in JSON format only:
    {
      "category": "...",
      "keyword": "...",
      "summary": "..."
    }
    `;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful news editor assistant. You output strict JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
        console.error('DeepSeek API error:', response.statusText);
        return null;
    }

    const data = await response.json();
    const contentText = data.choices[0].message.content;
    
    // Clean up markdown code blocks if present
    const jsonStr = contentText.replace(/```json\n|\n```/g, '').trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('AI Analysis failed:', error);
    return null;
  }
}
