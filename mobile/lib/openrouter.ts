import axios from 'axios';

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
// Free models on OpenRouter — tried in order until one succeeds
const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',   // 70B, 65K ctx — best quality free
  'openai/gpt-oss-120b:free',                 // 120B, 131K ctx — fallback
  'nvidia/nemotron-3-super-120b-a12b:free',   // 120B, 262K ctx — last resort
];

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
  timeout: 60000, // Increased to 60s as free models sometimes take longer to respond
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
      model: FREE_MODELS[0],
      models: FREE_MODELS,       // OpenRouter will auto-fallback down the list
      messages: fullMessages,
      max_tokens: 1024,
      temperature: 0.7,
      route: 'fallback',          // Enable OpenRouter fallback routing
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

export async function generateCareerGuidance(answers: Record<string, string>): Promise<any> {
  const CAREER_SYSTEM_PROMPT = `You are a professional career guidance counselor AI.
Analyze the user's answers to an aptitude test and return a JSON object with this exact structure:
{
  "matches": [
    { "id": "1", "title": "Data Scientist", "match": 95, "icon": "analytics", "color": "#3b82f6", "skills": ["Python", "Math"] }
  ],
  "roadmap": [
    { "step": 1, "title": "Learn Python", "desc": "Start with basics", "done": false }
  ]
}

The 'icon' must be a valid Ionicons name (e.g. 'code-slash', 'analytics', 'color-palette', 'medkit', 'trending-up', 'construct', 'business', 'people', 'earth'). Provide exactly 5 matches and a 5-step roadmap.
Return ONLY valid JSON without any markdown formatting, backticks, or extra text.`;

  const userPrompt = `Here are the user's answers to the aptitude test:\n${Object.entries(answers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n')}\n\nGenerate the career matches and roadmap based on these answers.`;

  try {
    const response = await openrouterClient.post('/chat/completions', {
      model: FREE_MODELS[0],
      models: FREE_MODELS,
      messages: [
        { role: 'system', content: CAREER_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      route: 'fallback'
    });

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from AI');
    }
    
    // Clean up any markdown code blocks if the AI ignored instructions
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    return JSON.parse(cleanContent);
  } catch (error: any) {
    console.error('Career generation error:', error);
    throw error;
  }
}
