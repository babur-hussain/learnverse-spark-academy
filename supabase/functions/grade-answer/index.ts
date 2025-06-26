
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
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
