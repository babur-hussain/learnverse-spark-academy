
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// TEMPORARILY COMMENTED OUT: const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')!;
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable not configured');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['https://localhost:3000', 'https://localhost:8080'],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface GradeRequest {
  studentAnswer: string;
  correctAnswer: string;
  strictnessLevel: number; // 1 = lenient, 2 = normal, 3 = strict
  maxScore: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentAnswer, correctAnswer, strictnessLevel, maxScore }: GradeRequest = await req.json();

    console.log('Grading answer with parameters:', {
      studentAnswer,
      correctAnswer,
      strictnessLevel,
      maxScore
    });

    const prompt = `You are an expert exam grader. Grade the following answer based on the reference answer.
    
Reference answer: "${correctAnswer}"
Student's answer: "${studentAnswer}"

Grading criteria:
- Strictness level: ${strictnessLevel} (1=lenient, 2=normal, 3=strict)
  * Level 1 (Lenient): Award points generously, focus on key concepts even if imperfectly expressed
  * Level 2 (Normal): Standard grading, require accurate information with some flexibility
  * Level 3 (Strict): Require precise information, complete coverage of points, with minimal errors
- Maximum score: ${maxScore}

Provide your response in this exact JSON format:
{
  "score": <number between 0 and ${maxScore}>,
  "feedback": "<brief explanation of the grade>",
  "keyPointsCovered": [<list of key points covered>],
  "missingPoints": [<list of key points missed>]
}`;

    // TEMPORARILY COMMENTED OUT: DeepSeek API call
    /*
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert exam grader. Provide detailed feedback and fair scoring.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent grading
        max_tokens: 1000
      }),
    });
    */

    // NEW: Gemini API call
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'You are an expert exam grader. Provide detailed feedback and fair scoring.' }]
          },
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent grading
          maxOutputTokens: 1000
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // TEMPORARILY COMMENTED OUT: DeepSeek response processing
    /*
    const aiResponse = data.choices[0].message.content;
    */
    
    // NEW: Gemini response processing
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error("Invalid response format from Gemini API");
    }
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Failed to parse AI grading response');
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in grade-answer function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
