
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TEMPORARILY COMMENTED OUT: const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
const GEMINI_API_KEY = "AIzaSyBFBBJQd-L8X9sgD2xgCY1ePxqOrTRWqQA";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, fileData, mode, followUp, language, stream = false } = await req.json();
    
    console.log("Processing query:", query);
    console.log("Mode:", mode);
    console.log("Stream mode:", stream);
    console.log("API Key available:", !!GEMINI_API_KEY);

    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.");
    }

    // Construct the system message based on the mode
    let systemMessage = "You are an educational AI assistant designed to help students learn effectively. ";
    
    if (mode === "explain") {
      systemMessage += "Explain concepts in simple, easy-to-understand terms with examples and analogies where helpful.";
    } else if (mode === "detailed") {
      systemMessage += "Provide comprehensive, detailed explanations with proper context, examples, and references where applicable.";
    } else if (mode === "analyze") {
      systemMessage += "Analyze the provided content thoroughly and extract key insights, important concepts, formulas, and main ideas.";
    } else {
      systemMessage += "Answer questions concisely and accurately, focusing on educational value and clear explanations.";
    }

    const messages = [
      { role: "system", content: systemMessage }
    ];

    // Add context from file if provided
    if (fileData) {
      messages.push({ 
        role: "user", 
        content: `Here's the content I want you to analyze: ${fileData}` 
      });
      messages.push({ 
        role: "assistant", 
        content: "I've analyzed the document. What would you like to know about it?" 
      });
    }

    // Add follow-up context if this is part of a conversation
    if (followUp && followUp.length > 0) {
      followUp.forEach(exchange => {
        messages.push(exchange);
      });
    }

    // Add the current query
    messages.push({ role: "user", content: query });

    console.log("Sending request to Gemini API with", messages.length, "messages");
    
    // NEW: Gemini API call with streaming support
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini response received successfully");

    // NEW: Gemini response processing
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error("Invalid response format from Gemini API");
    }
    const answer = data.candidates[0].content.parts[0].text;
    
    // If streaming is requested, return a streaming response
    if (stream) {
      const stream = new ReadableStream({
        start(controller) {
          // Send the full answer in chunks to simulate streaming
          const words = answer.split(' ');
          let index = 0;
          
          const sendChunk = () => {
            if (index < words.length) {
              const chunk = words.slice(0, index + 1).join(' ');
              controller.enqueue(`data: ${JSON.stringify({ 
                chunk, 
                isComplete: false,
                progress: Math.round(((index + 1) / words.length) * 100)
              })}\n\n`);
              index++;
              setTimeout(sendChunk, 50 + Math.random() * 100); // Random delay for natural typing effect
            } else {
              // Send completion signal
              controller.enqueue(`data: ${JSON.stringify({ 
                chunk: answer, 
                isComplete: true,
                progress: 100
              })}\n\n`);
              controller.close();
            }
          };
          
          sendChunk();
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
    
    // Smart categorization based on content analysis
    const categories = [];
    const lowerAnswer = answer.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    // Categorize based on content
    if (lowerAnswer.includes("formula") || lowerAnswer.includes("equation") || lowerQuery.includes("math")) {
      categories.push("Mathematics");
    }
    if (lowerAnswer.includes("concept") || lowerAnswer.includes("theory") || lowerAnswer.includes("principle")) {
      categories.push("Concept");
    }
    if (lowerAnswer.includes("solution") || lowerAnswer.includes("solve") || lowerAnswer.includes("answer")) {
      categories.push("Solution");
    }
    if (lowerQuery.includes("history") || lowerAnswer.includes("historical")) {
      categories.push("History");
    }
    if (lowerQuery.includes("science") || lowerAnswer.includes("scientific")) {
      categories.push("Science");
    }
    if (lowerQuery.includes("literature") || lowerAnswer.includes("literary")) {
      categories.push("Literature");
    }
    if (answer.length > 500) {
      categories.push("Detailed");
    }
    if (lowerAnswer.includes("research") || lowerAnswer.includes("study")) {
      categories.push("Research");
    }
    if (categories.length === 0) {
      categories.push("General");
    }

    // Generate contextual follow-up suggestions
    const followUpSuggestions = [];
    
    if (mode === "explain") {
      followUpSuggestions.push("Can you provide a practical example?");
      followUpSuggestions.push("How does this relate to real-world applications?");
    } else if (mode === "detailed") {
      followUpSuggestions.push("What are the key takeaways from this?");
      followUpSuggestions.push("Can you summarize the main points?");
    } else if (mode === "analyze") {
      followUpSuggestions.push("What should I focus on studying first?");
      followUpSuggestions.push("Are there any related topics I should explore?");
    } else {
      followUpSuggestions.push(`Can you explain more about ${query.split(" ").slice(0, 3).join(" ")}?`);
      followUpSuggestions.push("What are practical applications of this?");
      followUpSuggestions.push("Can you provide an example?");
    }

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
