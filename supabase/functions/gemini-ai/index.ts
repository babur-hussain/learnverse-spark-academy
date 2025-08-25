import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean)
const baseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
} as const

function buildCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = { ...baseHeaders }
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}

// Get Gemini API key from environment
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  console.log("=== GEMINI AI FUNCTION STARTED ===");
  
  // Handle CORS preflight requests
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight");
    return new Response(null, { headers: buildCorsHeaders(origin) });
  }

  try {
    console.log("1. Starting request processing...");
    
    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable not configured");
      return new Response(
        JSON.stringify({ 
          error: "AI service is not configured. Please contact support." 
        }),
        {
          status: 500,
          headers: { ...buildCorsHeaders(origin), "Content-Type": "application/json" }
        }
      );
    }

    console.log("2. API key found, length:", GEMINI_API_KEY.length);
    
    // Parse and validate request
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("3. Request body parsed successfully");
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400, 
          headers: { ...buildCorsHeaders(origin), "Content-Type": "application/json" }
        }
      );
    }
    
    if (!requestBody.query || typeof requestBody.query !== 'string') {
      console.error("Invalid query in request body");
      return new Response(
        JSON.stringify({ error: 'Query is required and must be a string' }),
        { 
          status: 400, 
          headers: { ...buildCorsHeaders(origin), "Content-Type": "application/json" }
        }
      );
    }
    
    const { query } = requestBody;
    console.log("4. Query validated:", query.substring(0, 50) + "...");

    // Call Gemini API
    console.log("5. Starting Gemini API call...");
    
    try {
      const systemMessage = "You are an educational AI assistant designed to help students learn effectively. Provide clear, helpful explanations and examples when appropriate.";
      
      const requestBody = {
        contents: [{
          parts: [{
            text: `${systemMessage}\n\nUser question: ${query}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
          topP: 0.8,
          topK: 40
        }
      };

      console.log("6. Gemini API request prepared");

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      });

      console.log("7. Gemini API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", response.status, errorText);
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log("8. Gemini response received successfully");

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error("Invalid response structure from Gemini");
        throw new Error("Invalid response format from Gemini API");
      }
      
      const answer = data.candidates[0].content.parts[0].text;
      console.log("9. Answer extracted, length:", answer.length);

      // Simple categorization
      const categories = ["General"];
      if (answer.toLowerCase().includes("math") || answer.toLowerCase().includes("formula") || answer.toLowerCase().includes("equation")) {
        categories.push("Mathematics");
      }
      if (answer.toLowerCase().includes("science") || answer.toLowerCase().includes("chemistry") || answer.toLowerCase().includes("physics") || answer.toLowerCase().includes("biology")) {
        categories.push("Science");
      }
      if (answer.toLowerCase().includes("history") || answer.toLowerCase().includes("geography")) {
        categories.push("Social Studies");
      }
      if (answer.toLowerCase().includes("english") || answer.toLowerCase().includes("grammar") || answer.toLowerCase().includes("literature")) {
        categories.push("Language Arts");
      }

      const followUpSuggestions = [
        "Can you explain this further?",
        "What are practical applications?",
        "Can you provide an example?",
        "How does this relate to other topics?"
      ];

      console.log("10. Returning real AI response");
      
      return new Response(
        JSON.stringify({
          answer,
          categories,
          followUpSuggestions
        }),
        {
          status: 200,
          headers: { ...buildCorsHeaders(origin), "Content-Type": "application/json" }
        }
      );
      
    } catch (apiError) {
      console.error("Gemini API call failed:", apiError);
      
      // Return a fallback response instead of throwing
      console.log("11. Returning fallback response due to API error");
      
      return new Response(
        JSON.stringify({
          answer: `I'm sorry, I'm having trouble connecting to my AI service right now. Your question "${query}" was received, but I can't provide a full response at the moment. Please try again in a few minutes.`,
          categories: ["General"],
          followUpSuggestions: ["Try again later", "Ask a simpler question", "Check your internet connection"]
        }),
        {
          status: 200,
          headers: { ...buildCorsHeaders(origin), "Content-Type": "application/json" }
        }
      );
    }

  } catch (error) {
    console.error("=== CRITICAL ERROR IN FUNCTION ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: "An error occurred while processing your request. Please try again.",
        details: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...buildCorsHeaders(origin), "Content-Type": "application/json" }
      }
    );
  }
});
