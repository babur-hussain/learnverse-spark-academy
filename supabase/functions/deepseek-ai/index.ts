
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

<<<<<<< HEAD
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

=======
>>>>>>> main
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, fileData, mode, followUp, language } = await req.json();
    
    console.log("Processing query:", query);
    console.log("Mode:", mode);
<<<<<<< HEAD

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
=======
    console.log("API Key available:", !!DEEPSEEK_API_KEY);

    if (!DEEPSEEK_API_KEY) {
      throw new Error("DeepSeek API key is not configured. Please add DEEPSEEK_API_KEY to your environment variables.");
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
>>>>>>> main
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
<<<<<<< HEAD
      // Add previous conversation history
=======
>>>>>>> main
      followUp.forEach(exchange => {
        messages.push(exchange);
      });
    }

    // Add the current query
    messages.push({ role: "user", content: query });

<<<<<<< HEAD
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
=======
    console.log("Sending request to DeepSeek API with", messages.length, "messages");
    
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
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      throw new Error(`DeepSeek API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("DeepSeek response received successfully");

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from DeepSeek API");
    }

    // Process the response
    const answer = data.choices[0].message.content;
    
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
    console.error("Error in deepseek-ai function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred while processing your request.",
        details: error.stack
      }),
>>>>>>> main
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
