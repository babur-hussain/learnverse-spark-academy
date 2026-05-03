import axios from 'axios';

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'google/gemini-2.5-flash-free';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

const SYSTEM_PROMPT = `You are Padhaai Wala, a friendly, knowledgeable, and encouraging AI study buddy. You help students of all ages with their studies — from school homework to advanced topics.

Your personality:
- Warm, supportive, and patient
- You explain concepts clearly with examples
- You use simple language but can go deeper when asked
- You encourage students and celebrate their progress
- You occasionally use relevant emojis to be friendly 📚✨
- You give step-by-step solutions for math and science problems
- You can help with any subject: Math, Science, English, Hindi, History, Geography, Coding, and more

Rules:
- Always be helpful and educational
- If you don't know something, say so honestly
- Keep responses concise but thorough
- Use bullet points and numbered lists for clarity
- For math, show your work step by step`;

const openrouterClient = axios.create({
  baseURL: OPENROUTER_BASE_URL,
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://padhaaiwala.app',
    'X-Title': 'Padhaai Wala',
  },
  timeout: 30000,
});

export async function sendChatMessage(
  messages: ChatMessage[]
): Promise<string> {
  try {
    const fullMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await openrouterClient.post('/chat/completions', {
      model: MODEL,
      messages: fullMessages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from AI');
    }
    return content.trim();
  } catch (error: any) {
    if (error.response) {
      console.error('OpenRouter API error:', error.response.status, error.response.data);
      const detail = error.response.data?.error?.message || JSON.stringify(error.response.data);
      if (error.response.status === 429) {
        throw new Error(`Too many requests. Real issue: ${detail}`);
      }
      if (error.response.status === 401) {
        throw new Error('AI service authentication failed.');
      }
      throw new Error(`API Error ${error.response.status}: ${detail}`);
    } else if (error.request) {
      console.error('Network error - no response received:', error.request);
      throw new Error('Network error: Unable to reach the AI service. Please check your internet connection.');
    }
    console.error('Chat error:', error.message);
    throw new Error(`Unexpected error: ${error.message}`);
  }
}
