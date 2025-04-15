
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get credentials from environment variables
    const vapiApiKey = Deno.env.get("VAPI_API_KEY") || "10176cf2-5ee4-4ba2-b89a-4b3c18124215";
    const vapiAssistantId = Deno.env.get("VAPI_ASSISTANT_ID") || "b6860fc3-a9da-4741-83ce-cb07c5725486";

    if (!vapiApiKey || !vapiAssistantId) {
      return new Response(
        JSON.stringify({ 
          error: "VAPI credentials not configured" 
        }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    console.log("Providing VAPI credentials - AssistantID:", vapiAssistantId);

    // Return the VAPI credentials
    return new Response(
      JSON.stringify({
        apiKey: vapiApiKey,
        assistantId: vapiAssistantId,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in get-vapi-keys function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
