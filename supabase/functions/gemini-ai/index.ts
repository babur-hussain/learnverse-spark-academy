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
  console.log("Gemini AI Function started");
  
  // Handle CORS preflight requests
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight");
    return new Response(null, { headers: buildCorsHeaders(origin) });
  }

  try {
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

    console.log("Parsing request body");
    
    // Parse and validate request
    const requestBody = await req.json();
    
    if (!requestBody.query || typeof requestBody.query !== 'string') {
      throw new Error('Query is required and must be a string');
    }
    
    if (requestBody.query.length > 1000) {
      throw new Error('Query too long (max 1000 characters)');
    }
    
    const { query, fileData, mode, followUp, language, stream = false } = requestBody;
    
    console.log("Processing query:", query);
    console.log("Mode:", mode);
    console.log("Stream mode:", stream);

    // Test response for simple queries
    if (query.toLowerCase() === 'hello' || query.toLowerCase() === 'hi') {
      console.log("Returning test response for greeting");
      return new Response(
        JSON.stringify({
          answer: "Hello! I'm your AI learning assistant. How can I help you today?",
          categories: ["General"],
          followUpSuggestions: ["What would you like to learn?", "Can you explain a concept?"]
        }),
        {
          headers: { ...buildCorsHeaders(origin), "Content-Type": "application/json" }
        }
      );
    }

    // Test response for longer queries to debug
    if (query.toLowerCase().includes('class 8 science ncert') || query.toLowerCase().includes('chapters')) {
      console.log("Returning test response for chapter query");
      return new Response(
        JSON.stringify({
          answer: "Here are the NCERT Class 8 Science chapters:\n\n1. Crop Production and Management\n2. Microorganisms: Friend and Foe\n3. Synthetic Fibres and Plastics\n4. Materials: Metals and Non-Metals\n5. Coal and Petroleum\n6. Combustion and Flame\n7. Conservation of Plants and Animals\n8. Cell Structure and Functions\n9. Reproduction in Animals\n10. Reaching the Age of Adolescence\n11. Force and Pressure\n12. Friction\n13. Sound\n14. Chemical Effects of Electric Current\n15. Some Natural Phenomena\n16. Light\n17. Stars and the Solar System\n18. Pollution of Air and Water\n\nThis is a test response to help debug the AI search functionality.",
          categories: ["Science", "Education"],
          followUpSuggestions: ["Which chapter would you like to learn more about?", "Can you explain any specific concept?", "What are the key topics in these chapters?"]
        }),
        {
          headers: { ...buildCorsHeaders(origin), "Content-Type": "application/json" }
        }
      );
    }

    // Basic rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    const windowMs = 60_000
    const maxReq = 20
    
    const store = (globalThis as unknown as { rates?: Map<string, { count: number; reset: number }> })
    if (!store.rates) store.rates = new Map()
    const rec = store.rates.get(ip) || { count: 0, reset: now + windowMs }
    if (now > rec.reset) { rec.count = 0; rec.reset = now + windowMs }
    rec.count += 1
    store.rates.set(ip, rec)
    if (rec.count > maxReq) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
        { 
          status: 429, 
          headers: buildCorsHeaders(origin) 
        }
      )
    }

    // Call Gemini API
    console.log("Calling Gemini API");
    console.log("Query length:", query.length);
    console.log("Query content:", query);
    
    const systemMessage = "You are an educational AI assistant designed to help students learn effectively. Provide clear, helpful explanations and examples when appropriate.";
    const messages = [
      { role: "system", content: systemMessage },
      { role: "user", content: query }
    ];

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
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        })
      });

      console.log("Gemini API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", response.status, errorText);
        throw new Error(`AI service error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Gemini response received successfully");
      console.log("Response data keys:", Object.keys(data));

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error("Invalid response structure:", JSON.stringify(data, null, 2));
        throw new Error("Invalid response format from AI service");
      }
      
      const answer = data.candidates[0].content.parts[0].text;
      console.log("Answer length:", answer.length);
      console.log("Answer preview:", answer.substring(0, 100) + "...");
      
    } catch (apiError) {
      console.error("Gemini API call failed:", apiError);
      throw new Error(`Gemini API call failed: ${apiError.message}`);
    }

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

    // Follow-up suggestions
    const followUpSuggestions = [
      "Can you explain this further?",
      "What are practical applications?",
      "Can you provide an example?",
      "How does this relate to other topics?"
    ];

    console.log("Returning final response");
    return new Response(
      JSON.stringify({
        answer,
        categories,
        followUpSuggestions
      }),
      {
        headers: { ...buildCorsHeaders(origin), "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in gemini-ai function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "An error occurred while processing your request. Please try again.",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...buildCorsHeaders(origin), "Content-Type": "application/json" }
      }
    );
  }
});
