
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

// Demo responses for when the API is unavailable
const demoResponses = {
  default: "This is a demonstration response. The actual DeepSeek AI service is currently unavailable. In a production environment, this would connect to the DeepSeek API to generate a personalized response to your query.",
  math: "Mathematics involves the study of numbers, quantities, shapes, and patterns. It includes fields like algebra, geometry, calculus, and statistics. Mathematics is fundamental to science, engineering, finance, and many other disciplines.",
  history: "History is the study of past events, particularly human affairs. Historians use documents, artifacts, and other sources to understand and interpret the past. Historical knowledge helps us understand the present and make informed decisions about the future.",
  science: "Science is a systematic approach to understanding the natural world through observation and experimentation. Scientific fields include physics, chemistry, biology, astronomy, and more. The scientific method involves making observations, forming hypotheses, conducting experiments, and drawing conclusions.",
  literature: "Literature encompasses written works, especially those considered to have artistic merit. It includes novels, poetry, drama, and non-fiction. Studying literature helps develop critical thinking, empathy, and communication skills while providing insights into different cultures and historical periods."
};

function getRelevantDemoResponse(query: string): string {
  query = query.toLowerCase();
  
  if (query.includes("math") || query.includes("equation") || query.includes("formula") || query.includes("calculate")) {
    return demoResponses.math;
  }
  if (query.includes("history") || query.includes("past") || query.includes("ancient") || query.includes("century")) {
    return demoResponses.history;
  }
  if (query.includes("science") || query.includes("physics") || query.includes("chemistry") || query.includes("biology")) {
    return demoResponses.science;
  }
  if (query.includes("literature") || query.includes("book") || query.includes("novel") || query.includes("poetry")) {
    return demoResponses.literature;
  }
  
  return demoResponses.default;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, fileData, mode, followUp, language } = await req.json();
    
    console.log("Processing query:", query);
    console.log("Mode:", mode);

    // Construct the system message based on the mode
    let systemMessage = "You are an educational AI assistant designed to help students learn. ";
    
    if (mode === "explain") {
      systemMessage += "Explain concepts in simple terms that a younger student could understand.";
    } else if (mode === "detailed") {
      systemMessage += "Provide detailed, academic explanations with proper citations where possible.";
    } else if (mode === "analyze") {
      systemMessage += "Analyze the provided content and extract key insights, formulas, and concepts.";
    } else {
      systemMessage += "Answer questions concisely and accurately, focusing on educational value.";
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
      // Add previous conversation history
      followUp.forEach(exchange => {
        messages.push(exchange);
      });
    }

    // Add the current query
    messages.push({ role: "user", content: query });

    console.log("Sending request to DeepSeek API");
    
    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API error:", errorText);
        throw new Error(`DeepSeek API responded with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("DeepSeek response received");

      // Process the response to add categories/tags
      const answer = data.choices[0].message.content;
      
      // Simple keyword-based categorization
      const categories = [];
      if (answer.includes("formula") || answer.includes("equation")) categories.push("Formula");
      if (answer.includes("concept") || answer.includes("theory")) categories.push("Concept");
      if (answer.includes("solution") || answer.includes("solve")) categories.push("Solution");
      if (answer.length > 500) categories.push("Detailed");
      if (answer.includes("research") || answer.includes("study")) categories.push("Research");
      if (categories.length === 0) categories.push("General");

      // Generate follow-up suggestions
      const followUpSuggestions = [
        `Can you explain more about ${query.split(" ").slice(0, 3).join(" ")}?`,
        `What are practical applications of this?`,
        `Can you provide an example?`
      ];

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
      console.error("DeepSeek API error:", error.message);
      
      // If API fails, use demo response
      const demoAnswer = getRelevantDemoResponse(query);
      
      // Generate relevant categories
      const categories = ["Demo"];
      if (query.toLowerCase().includes("math")) categories.push("Mathematics");
      if (query.toLowerCase().includes("history")) categories.push("History");
      if (query.toLowerCase().includes("science")) categories.push("Science");
      if (query.toLowerCase().includes("literature")) categories.push("Literature");
      
      // Generate follow-up suggestions
      const followUpSuggestions = [
        `Tell me more about this topic`,
        `How is this applied in real life?`,
        `What are the key concepts to understand?`
      ];

      return new Response(
        JSON.stringify({
          answer: demoAnswer,
          categories,
          followUpSuggestions
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    console.error("Error in deepseek-ai function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
