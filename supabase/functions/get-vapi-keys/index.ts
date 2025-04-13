
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Using the fixed API key
    const vapiApiKey = "10176cf2-5ee4-4ba2-b89a-4b3c18124215";
    const vapiAssistantId = Deno.env.get("VAPI_ASSISTANT_ID") || "380ff8dd-ca35-456e-9e9c-511bded18f09";

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
