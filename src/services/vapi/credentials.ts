
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Cache credentials after fetch to avoid redundant calls
let vapiApiKey: string | null = null;
let vapiAssistantId: string | null = null;
let isLoading: boolean = false;

/**
 * Fetches Vapi API credentials via Supabase Edge Function
 */
export async function fetchCredentials(): Promise<boolean> {
  if (isLoading) return false;
  if (vapiApiKey && vapiAssistantId) return true;
  
  isLoading = true;
  try {
    const { data, error } = await supabase.functions.invoke('get-vapi-keys', {
      method: 'GET',
    });
    
    if (error) {
      console.error('Error fetching VAPI credentials:', error);
      // Try to use cached credentials from localStorage as fallback
      const storedKey = localStorage.getItem('vapi_api_key');
      const storedAssistantId = localStorage.getItem('vapi_assistant_id');
      
      if (storedKey && storedAssistantId) {
        vapiApiKey = storedKey;
        vapiAssistantId = storedAssistantId;
        return true;
      }
      
      return false;
    }
    
    if (data?.apiKey) {
      vapiApiKey = data.apiKey;
      localStorage.setItem('vapi_api_key', data.apiKey);
    }
    
    if (data?.assistantId) {
      vapiAssistantId = data.assistantId;
      localStorage.setItem('vapi_assistant_id', data.assistantId);
    }
    
    console.log("Vapi credentials successfully fetched");
    return !!vapiApiKey && !!vapiAssistantId;
  } catch (error) {
    console.error('Failed to fetch VAPI credentials:', error);
    
    // Try to use cached credentials from localStorage as fallback
    const storedKey = localStorage.getItem('vapi_api_key');
    const storedAssistantId = localStorage.getItem('vapi_assistant_id');
    
    if (storedKey && storedAssistantId) {
      vapiApiKey = storedKey;
      vapiAssistantId = storedAssistantId;
      return true;
    }
    
    return false;
  } finally {
    isLoading = false;
  }
}

/**
 * Returns the authorization headers for Vapi API calls
 */
export function getAuthHeaders(): Record<string, string> {
  if (!vapiApiKey) {
    throw new Error("Vapi API key not available");
  }
  
  return { 
    "Authorization": `Bearer ${vapiApiKey}`,
    "Content-Type": "application/json" 
  };
}

/**
 * Gets the cached API key
 */
export function getApiKey(): string | null {
  if (vapiApiKey) return vapiApiKey;
  
  const storedKey = localStorage.getItem('vapi_api_key');
  if (storedKey) {
    vapiApiKey = storedKey;
    return storedKey;
  }
  
  return null;
}

/**
 * Gets the cached Assistant ID
 */
export function getAssistantId(): string | null {
  if (vapiAssistantId) return vapiAssistantId;
  
  const storedId = localStorage.getItem('vapi_assistant_id');
  if (storedId) {
    vapiAssistantId = storedId;
    return storedId;
  }
  
  return null;
}

/**
 * Sets the Vapi API key
 */
export function setApiKey(apiKey: string): void {
  vapiApiKey = apiKey;
  localStorage.setItem('vapi_api_key', apiKey);
}

/**
 * Sets the Vapi Assistant ID
 */
export function setAssistantId(assistantId: string): void {
  vapiAssistantId = assistantId;
  localStorage.setItem('vapi_assistant_id', assistantId);
}

/**
 * Clears stored credentials
 */
export function clearCredentials(): void {
  vapiApiKey = null;
  vapiAssistantId = null;
  localStorage.removeItem('vapi_api_key');
  localStorage.removeItem('vapi_assistant_id');
  toast.info("VAPI credentials have been cleared");
}
