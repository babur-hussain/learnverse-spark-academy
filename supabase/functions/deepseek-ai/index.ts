
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = "AIzaSyBFBBJQd-L8X9sgD2xgCY1ePxqOrTRWqQA";

serve(async (req) => {
  console.log("Function started");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Parsing request body");
    const { query, fileData, mode, followUp, language, stream = false } = await req.json();
    
    console.log("Processing query:", query);
    console.log("Mode:", mode);
    console.log("Stream mode:", stream);
    console.log("API Key available:", !!GEMINI_API_KEY);

    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured.");
    }

    // For now, let's return a simple response to test if the function works at all
    if (query === 'hello') {
      console.log("Returning test response for 'hello'");
      return new Response(
        JSON.stringify({
          answer: "Hello! I'm your AI learning assistant. How can I help you today?",
          categories: ["General"],
          followUpSuggestions: ["What would you like to learn?", "Can you explain a concept?"]
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // For other queries, try to use Gemini API
    console.log("Attempting Gemini API call");
    
    const systemMessage = "You are an educational AI assistant designed to help students learn effectively. ";
    const messages = [
      { role: "system", content: systemMessage },
      { role: "user", content: query }
    ];

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
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      })
    });

    console.log("Gemini API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini response received successfully");

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error("Invalid response format from Gemini API");
    }
    
    const answer = data.candidates[0].content.parts[0].text;
    
    // Simple categorization
    const categories = ["General"];
    if (answer.toLowerCase().includes("math") || answer.toLowerCase().includes("formula")) {
      categories.push("Mathematics");
    }
    if (answer.toLowerCase().includes("science")) {
      categories.push("Science");
    }

    // Simple follow-up suggestions
    const followUpSuggestions = [
      "Can you explain this further?",
      "What are practical applications?",
      "Can you provide an example?"
    ];

    console.log("Returning final response");
    return new Response(
      JSON.stringify({
        answer,
        categories,
        followUpSuggestions
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in gemini-ai function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred while processing your request.",
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
