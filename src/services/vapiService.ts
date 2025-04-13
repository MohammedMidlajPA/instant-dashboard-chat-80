
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CallAnalysisFilters {
  assistantId: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  fetchAll?: boolean;
}

interface CallAnalysisResult {
  id: string;
  call_id: string;
  assistant_id: string;
  call_date: string;
  duration: number;
  sentiment: string;
  transcription: string;
  keywords: string[];
  [key: string]: any; // For any additional fields returned by the API
}

export class VapiService {
  private apiKey: string | null = null;
  private assistantId: string | null = null;
  private baseUrl = "https://api.vapi.ai";
  private isLoading = false;

  constructor(apiKey?: string) {
    // Initialize with provided key if available, but will attempt to fetch from Supabase
    this.apiKey = apiKey || null;
    
    // Automatically attempt to fetch credentials on initialization
    this.fetchCredentials();
  }

  async fetchCredentials(): Promise<boolean> {
    // Don't re-fetch if we're already loading
    if (this.isLoading) return false;
    
    // If we already have both credentials loaded, no need to fetch
    if (this.apiKey && this.assistantId) return true;
    
    this.isLoading = true;
    
    try {
      const { data, error } = await supabase.functions.invoke('get-vapi-keys', {
        method: 'GET',
      });
      
      if (error) {
        console.error('Error fetching VAPI credentials:', error);
        // Fallback to localStorage if Supabase fails
        const storedKey = localStorage.getItem('vapi_api_key');
        if (storedKey) {
          this.apiKey = storedKey;
          return !!this.apiKey;
        }
        return false;
      }
      
      if (data?.apiKey) {
        this.apiKey = data.apiKey;
      }
      
      if (data?.assistantId) {
        this.assistantId = data.assistantId;
      }
      
      return !!this.apiKey && !!this.assistantId;
    } catch (error) {
      console.error('Failed to fetch VAPI credentials:', error);
      // Fallback to localStorage if Supabase fails
      const storedKey = localStorage.getItem('vapi_api_key');
      if (storedKey) {
        this.apiKey = storedKey;
        return !!this.apiKey;
      }
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('vapi_api_key', apiKey);
    return this;
  }

  getApiKey(): string | null {
    if (this.apiKey) return this.apiKey;
    
    // Try to get from localStorage if not set directly
    const storedKey = localStorage.getItem('vapi_api_key');
    if (storedKey) {
      this.apiKey = storedKey;
      return storedKey;
    }
    
    return null;
  }

  getAssistantId(): string | null {
    return this.assistantId;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('vapi_api_key');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Ensure we have the credentials before making the request
    await this.fetchCredentials();
    
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error("VAPI API key is not set. Please set the API key before making requests.");
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`VAPI API error (${response.status}): ${errorText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('Error calling VAPI API:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to call VAPI API');
      throw error;
    }
  }

  async getCallAnalysis(filters?: CallAnalysisFilters): Promise<CallAnalysisResult[]> {
    // If no filters provided, use the stored assistant ID
    const assistantId = filters?.assistantId || this.assistantId;
    
    if (!assistantId) {
      throw new Error("Assistant ID is required");
    }

    const params = new URLSearchParams({
      assistant_id: assistantId,
      ...(filters?.startDate && { start_date: filters.startDate }),
      ...(filters?.endDate && { end_date: filters.endDate }),
      ...(filters?.limit && { limit: filters.limit.toString() })
    });

    // If fetchAll is true, use pagination to get all results
    if (filters?.fetchAll) {
      let allResults: CallAnalysisResult[] = [];
      let offset = 0;
      const pageLimit = 100; // Page size for pagination
      let hasMore = true;

      while (hasMore) {
        const paginationParams = new URLSearchParams(params);
        paginationParams.set('limit', pageLimit.toString());
        paginationParams.set('offset', offset.toString());

        const endpoint = `/assistants/call-analysis?${paginationParams.toString()}`;
        const response = await this.request<{ results: CallAnalysisResult[] }>(endpoint);
        
        const results = response.results || [];
        allResults = [...allResults, ...results];

        // If we got fewer records than the page limit, there are no more pages
        if (results.length < pageLimit) {
          hasMore = false;
        } else {
          offset += pageLimit;
        }
      }

      return allResults;
    } else {
      // Standard request with the provided filters
      const endpoint = `/assistants/call-analysis?${params.toString()}`;
      const response = await this.request<{ results: CallAnalysisResult[] }>(endpoint);
      return response.results || [];
    }
  }

  async createOutboundCall(payload: {
    recipient: {
      phone_number: string;
    };
    assistant_id?: string;
    [key: string]: any;
  }) {
    // Use stored assistant ID if none provided
    if (!payload.assistant_id && this.assistantId) {
      payload.assistant_id = this.assistantId;
    }
    
    if (!payload.assistant_id) {
      throw new Error("Assistant ID is required");
    }
    
    return this.request<any>('/outbound_call', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getCallRecordings(assistantId?: string, limit?: number) {
    // Use stored assistant ID if none provided
    const id = assistantId || this.assistantId;
    
    if (!id) {
      throw new Error("Assistant ID is required");
    }
    
    const params = new URLSearchParams({
      assistant_id: id,
      ...(limit && { limit: limit.toString() })
    });

    const endpoint = `/calls?${params.toString()}`;
    const response = await this.request<{ calls: any[] }>(endpoint);
    return response.calls || [];
  }

  // Add more VAPI API methods as needed...
}

// Create and export a singleton instance
export const vapiService = new VapiService();

export default vapiService;
