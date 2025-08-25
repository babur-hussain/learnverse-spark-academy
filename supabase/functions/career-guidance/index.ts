
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// TEMPORARILY COMMENTED OUT: const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
const GEMINI_API_KEY = "AIzaSyBFBBJQd-L8X9sgD2xgCY1ePxqOrTRWqQA";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();

    // Route the request based on the action
    switch (action) {
      case "analyze_aptitude":
        return await analyzeAptitude(data);
      case "generate_career_matches":
        return await generateCareerMatches(data);
      case "generate_roadmap":
        return await generateRoadmap(data);
      case "recommend_courses":
        return await recommendCourses(data);
      case "adapt_progress":
        return await adaptProgress(data);
      case "chat":
        return await handleChat(data);
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action specified" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// TEMPORARILY COMMENTED OUT: DeepSeek API function
/*
async function callDeepSeekAPI(messages: any[], temperature: number = 0.7) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }
  
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: temperature,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`DeepSeek API Error: ${result.error?.message || JSON.stringify(result)}`);
    }
    
    return result.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek API call failed:", error);
    throw new Error(`Failed to call DeepSeek API: ${error.message}`);
  }
}
*/

// NEW: Gemini API function
async function callGeminiAPI(messages: any[], temperature: number = 0.7) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: messages.map(msg => ({
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature: temperature,
        }
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Gemini API Error: ${result.error?.message || JSON.stringify(result)}`);
    }
    
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content || !result.candidates[0].content.parts || !result.candidates[0].content.parts[0]) {
      throw new Error("Invalid response format from Gemini API");
    }
    
    return result.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error(`Failed to call Gemini API: ${error.message}`);
  }
}

async function analyzeAptitude(data: any) {
  const { quizResults, userInfo } = data;
  
  const systemPrompt = `
    You are an expert career counselor with deep knowledge of various professions, 
    required skills, and education paths. Analyze the student's quiz results and 
    create a comprehensive career profile summary.
    
    Format your response as JSON with the following structure:
    {
      "personalityType": "string",
      "primaryStrengths": ["string"],
      "secondaryStrengths": ["string"],
      "areasForImprovement": ["string"],
      "learningStyle": "string",
      "workEnvironmentPreference": "string",
      "careerInterests": ["string"],
      "skillSummary": {
        "technical": {
          "skill": "string",
          "level": number (1-10)
        }[],
        "soft": {
          "skill": "string",
          "level": number (1-10)
        }[]
      }
    }
  `;

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Please analyze these quiz results and create a career profile summary:
      User Information: ${JSON.stringify(userInfo)}
      Quiz Results: ${JSON.stringify(quizResults)}`
    }
  ];

  try {
    // TEMPORARILY COMMENTED OUT: const analysisResult = await callDeepSeekAPI(messages, 0.3);
    const analysisResult = await callGeminiAPI(messages, 0.3);
    // Parse the result to ensure it's valid JSON
    const parsedResult = JSON.parse(analysisResult);
    
    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Failed to analyze aptitude: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

async function generateCareerMatches(data: any) {
  const { profileSummary, userInfo } = data;
  
  const systemPrompt = `
    As a career matching expert, analyze the student profile and generate suitable career matches.
    For each career match, provide a compatibility score (0-100%), reasoning, and key insights.
    
    Format your response as JSON with the following structure:
    {
      "careerMatches": [
        {
          "career": "string",
          "compatibilityScore": number,
          "reasoning": "string",
          "keySkillsAligned": ["string"],
          "potentialChallenges": ["string"],
          "educationRequirements": ["string"],
          "growthOpportunities": "string"
        }
      ]
    }
  `;

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Generate career matches based on this profile:
      User Information: ${JSON.stringify(userInfo)}
      Profile Summary: ${JSON.stringify(profileSummary)}`
    }
  ];

  try {
    // TEMPORARILY COMMENTED OUT: const matchesResult = await callDeepSeekAPI(messages, 0.3);
    const matchesResult = await callGeminiAPI(messages, 0.3);
    const parsedResult = JSON.parse(matchesResult);
    
    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Failed to generate career matches: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

async function generateRoadmap(data: any) {
  const { career, profileSummary, userInfo } = data;
  
  const systemPrompt = `
    As a career development expert, create a detailed roadmap for the specified career.
    The roadmap should be tailored to the user's profile and current skills.
    
    Format your response as JSON with the following structure:
    {
      "career": "string",
      "overview": "string",
      "timeframe": "string",
      "milestones": [
        {
          "title": "string",
          "description": "string",
          "timeline": "string",
          "requiredSkills": ["string"],
          "activities": ["string"],
          "resources": ["string"]
        }
      ],
      "skillsToAcquire": [
        {
          "skill": "string",
          "importance": "High/Medium/Low",
          "suggestedResources": ["string"]
        }
      ],
      "examsCertifications": [
        {
          "name": "string",
          "description": "string",
          "timeline": "string",
          "preparationTips": ["string"]
        }
      ],
      "projectIdeas": [
        {
          "title": "string",
          "description": "string",
          "skills": ["string"]
        }
      ],
      "weeklyPlan": {
        "focus": "string",
        "activities": ["string"]
      }
    }
  `;

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Create a detailed career roadmap for:
      Career: ${career}
      User Information: ${JSON.stringify(userInfo)}
      Profile Summary: ${JSON.stringify(profileSummary)}`
    }
  ];

  try {
    // TEMPORARILY COMMENTED OUT: const roadmapResult = await callDeepSeekAPI(messages, 0.5);
    const roadmapResult = await callGeminiAPI(messages, 0.5);
    const parsedResult = JSON.parse(roadmapResult);
    
    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Failed to generate roadmap: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

async function recommendCourses(data: any) {
  const { career, roadmap, profileSummary, platformCourses } = data;
  
  const systemPrompt = `
    As a learning advisor, recommend courses from the platform that align with the user's
    chosen career path and roadmap. Focus on courses that will help achieve the next 
    milestones in their career roadmap.
    
    Format your response as JSON with the following structure:
    {
      "recommendedCourses": [
        {
          "courseId": "string",
          "courseName": "string",
          "relevance": "string",
          "alignedMilestone": "string",
          "priority": "High/Medium/Low"
        }
      ],
      "recommendedTests": [
        {
          "testId": "string",
          "testName": "string",
          "relevance": "string"
        }
      ],
      "recommendedSessions": [
        {
          "sessionId": "string",
          "sessionName": "string",
          "relevance": "string"
        }
      ],
      "suggestedLearningPath": "string"
    }
  `;

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Recommend platform resources for:
      Career: ${career}
      Profile Summary: ${JSON.stringify(profileSummary)}
      Roadmap: ${JSON.stringify(roadmap)}
      Available Platform Courses: ${JSON.stringify(platformCourses)}`
    }
  ];

  try {
    // TEMPORARILY COMMENTED OUT: const recommendationsResult = await callDeepSeekAPI(messages, 0.3);
    const recommendationsResult = await callGeminiAPI(messages, 0.3);
    const parsedResult = JSON.parse(recommendationsResult);
    
    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Failed to recommend courses: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

async function adaptProgress(data: any) {
  const { roadmap, completedMilestones, testScores, participation, profileSummary } = data;
  
  const systemPrompt = `
    As a career progress advisor, analyze the user's advancement through their roadmap 
    and provide adaptive feedback. Suggest adjustments to the roadmap based on performance.
    
    Format your response as JSON with the following structure:
    {
      "progressSummary": "string",
      "achievementLevel": "string",
      "strengths": ["string"],
      "areasForImprovement": ["string"],
      "adjustedMilestones": [
        {
          "milestoneId": "string",
          "adjustedTimeline": "string",
          "adjustmentReason": "string"
        }
      ],
      "feedback": "string",
      "motivation": "string",
      "nextSteps": ["string"]
    }
  `;

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Analyze progress and provide adaptive feedback:
      Roadmap: ${JSON.stringify(roadmap)}
      Completed Milestones: ${JSON.stringify(completedMilestones)}
      Test Scores: ${JSON.stringify(testScores)}
      Participation Metrics: ${JSON.stringify(participation)}
      Profile Summary: ${JSON.stringify(profileSummary)}`
    }
  ];

  try {
    // TEMPORARILY COMMENTED OUT: const adaptationResult = await callDeepSeekAPI(messages, 0.4);
    const adaptationResult = await callGeminiAPI(messages, 0.4);
    const parsedResult = JSON.parse(adaptationResult);
    
    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Failed to adapt progress: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

async function handleChat(data: any) {
  const { message, chatHistory, profileSummary, roadmap } = data;
  
  const systemPrompt = `
    You are a career guidance AI assistant trained to help students navigate their career paths.
    You have access to the student's profile and roadmap. Answer questions, provide guidance,
    suggest next steps, and recommend mentors when appropriate. Your responses should be
    helpful, supportive, and tailored to the student's specific situation.
  `;

  // Format chat history for the API
  const formattedChatHistory = chatHistory.map((entry: any) => ({
    role: entry.isUser ? "user" : "assistant",
    content: entry.message
  }));

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Here is my profile and roadmap information:
      Profile Summary: ${JSON.stringify(profileSummary)}
      Roadmap: ${JSON.stringify(roadmap)}`
    },
    ...formattedChatHistory,
    { role: "user", content: message }
  ];

  try {
    // TEMPORARILY COMMENTED OUT: const chatResult = await callDeepSeekAPI(messages, 0.7);
    const chatResult = await callGeminiAPI(messages, 0.7);
    
    return new Response(JSON.stringify({ response: chatResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Chat error: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
