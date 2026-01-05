import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BOLNA_API_KEY = Deno.env.get('BOLNA_API_KEY');
const BOLNA_BASE_URL = 'https://api.bolna.dev/v2';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    
    console.log(`Bolna API action: ${action}`, params);

    if (!BOLNA_API_KEY) {
      throw new Error('BOLNA_API_KEY not configured');
    }

    let response;
    
    switch (action) {
      case 'make_call': {
        // Create an outbound call using Bolna API
        // https://www.bolna.ai/docs/api-reference/calls/make-call
        const { agent_id, recipient_phone, from_phone, user_data } = params;
        
        response = await fetch(`${BOLNA_BASE_URL}/call`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${BOLNA_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agent_id,
            recipient_phone_number: recipient_phone,
            from_phone_number: from_phone,
            user_data: user_data || {},
          }),
        });
        break;
      }
      
      case 'get_call': {
        // Get call details
        // https://www.bolna.ai/docs/api-reference/calls/get-call
        const { call_id } = params;
        
        response = await fetch(`${BOLNA_BASE_URL}/call/${call_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${BOLNA_API_KEY}`,
          },
        });
        break;
      }
      
      case 'end_call': {
        // End an ongoing call
        // https://www.bolna.ai/docs/api-reference/calls/end-call
        const { call_id } = params;
        
        response = await fetch(`${BOLNA_BASE_URL}/call/${call_id}/end`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${BOLNA_API_KEY}`,
          },
        });
        break;
      }
      
      case 'get_transcript': {
        // Get call transcript
        const { call_id } = params;
        
        response = await fetch(`${BOLNA_BASE_URL}/call/${call_id}/transcript`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${BOLNA_API_KEY}`,
          },
        });
        break;
      }
      
      case 'list_agents': {
        // List available agents
        // https://www.bolna.ai/docs/api-reference/agents/list-agents
        response = await fetch(`${BOLNA_BASE_URL}/agents`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${BOLNA_API_KEY}`,
          },
        });
        break;
      }
      
      case 'get_agent': {
        // Get agent details
        const { agent_id } = params;
        
        response = await fetch(`${BOLNA_BASE_URL}/agents/${agent_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${BOLNA_API_KEY}`,
          },
        });
        break;
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const data = await response.json();
    
    console.log(`Bolna API response for ${action}:`, data);

    if (!response.ok) {
      throw new Error(data.message || data.error || `Bolna API error: ${response.status}`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Bolna API error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
