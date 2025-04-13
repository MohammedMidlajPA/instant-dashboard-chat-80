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
  call_type?: string;
  contact_name?: string;
  company_name?: string;
  ended_reason?: string;
  success_evaluation?: number;
  assistant_phone?: string;
  customer_phone?: string;
  recording_url?: string;
  inquiry_type?: string;
  [key: string]: any; // For any additional fields returned by the API
}

export class VapiService {
  private apiKey: string | null = null;
  private assistantId: string | null = null;
  private baseUrl = "https://api.vapi.ai";
  private isLoading = false;
  private retryCount = 0;
  private maxRetries = 3;

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
        // Also store in localStorage as fallback
        localStorage.setItem('vapi_api_key', data.apiKey);
      }
      
      if (data?.assistantId) {
        this.assistantId = data.assistantId;
        // Also store in localStorage as fallback
        localStorage.setItem('vapi_assistant_id', data.assistantId);
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
    if (this.assistantId) return this.assistantId;
    
    // Try to get from localStorage if not set directly
    const storedId = localStorage.getItem('vapi_assistant_id');
    if (storedId) {
      this.assistantId = storedId;
      return storedId;
    }
    
    return null;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('vapi_api_key');
    localStorage.removeItem('vapi_assistant_id');
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
      console.log(`Making request to: ${url}`);
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Reset retry count on successful request
      this.retryCount = 0;

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`VAPI API error (${response.status}): ${errorText}`);
        
        // Check if we're being rate limited (429) or if server is having issues (5xx)
        if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
          // Throw a special error for these cases that might benefit from retries
          throw new Error(`VAPI API temporarily unavailable (${response.status}): ${errorText}`);
        }
        
        throw new Error(`VAPI API error (${response.status}): ${errorText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('Error calling VAPI API:', error);
      
      // Implement simple retry logic for network errors or server errors
      if (this.retryCount < this.maxRetries && 
          (error instanceof TypeError || // Network errors
           (error instanceof Error && error.message.includes('temporarily unavailable')))) {
        
        this.retryCount++;
        const delay = Math.pow(2, this.retryCount) * 1000; // Exponential backoff
        console.log(`Retrying request (${this.retryCount}/${this.maxRetries}) after ${delay}ms`);
        
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const result = await this.request<T>(endpoint, options);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        });
      }
      
      toast.error(error instanceof Error ? error.message : 'Failed to call VAPI API');
      throw error;
    }
  }

  async getCallAnalysis(filters?: CallAnalysisFilters): Promise<CallAnalysisResult[]> {
    // If no filters provided, use the stored assistant ID
    const assistantId = filters?.assistantId || this.assistantId || "b6860fc3-a9da-4741-83ce-cb07c5725486";
    
    if (!assistantId) {
      throw new Error("Assistant ID is required");
    }

    // Try different endpoints based on VAPI API structure
    // This is a fallback mechanism to handle API changes
    try {
      // Try the new endpoint structure first - /api/v1/calls
      const endpoint = `/api/v1/calls`;
      const queryParams = new URLSearchParams();
      
      if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString());
      }
      
      if (filters?.startDate) {
        queryParams.append('start_date', filters.startDate);
      }
      
      if (filters?.endDate) {
        queryParams.append('end_date', filters.endDate);
      }
      
      // Add the assistant ID filter as a query parameter rather than part of the path
      queryParams.append('assistant_id', assistantId);
      
      const url = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint;
      const response = await this.request<{ calls: CallAnalysisResult[] }>(url, {
        method: 'GET',
      });
      
      return this.processCollegeCallData(response.calls || []);
    } catch (error) {
      console.error("Error with primary endpoint, trying fallback:", error);
      
      try {
        // Fallback to an alternative endpoint - /v1/calls
        const endpoint = `/v1/calls`;
        const queryParams = new URLSearchParams();
        
        if (filters?.limit) {
          queryParams.append('limit', filters.limit.toString());
        }
        
        if (assistantId) {
          queryParams.append('assistant_id', assistantId);
        }
        
        const url = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint;
        const response = await this.request<{ calls: CallAnalysisResult[] }>(url, {
          method: 'GET',
        });
        
        return this.processCollegeCallData(response.calls || []);
      } catch (fallbackError) {
        console.error("All endpoints failed, returning empty data:", fallbackError);
        // If both endpoints fail, return empty data rather than throwing
        return [];
      }
    }
  }

  private processCollegeCallData(calls: CallAnalysisResult[]): CallAnalysisResult[] {
    return calls.map(call => {
      const collegeKeywords = this.extractCollegeKeywords(call.transcription);
      
      const inquiryType = this.categorizeInquiry(call.transcription, collegeKeywords);
      
      return {
        ...call,
        call_type: call.call_type || this.determineCallType(call),
        contact_name: call.contact_name || this.extractContactName(call),
        company_name: call.company_name || this.determineAffiliation(call),
        keywords: collegeKeywords.length > 0 ? collegeKeywords : (call.keywords || []),
        inquiry_type: inquiryType,
      };
    });
  }

  private extractCollegeKeywords(transcription: string = ""): string[] {
    if (!transcription) return [];
    
    const collegeKeywordSets = [
      ["admissions", "application", "apply", "acceptance", "deadline", "requirements"],
      ["financial aid", "scholarship", "grant", "tuition", "fafsa", "loan", "payment"],
      ["housing", "dorm", "residence", "accommodation", "on-campus", "apartment"],
      ["program", "major", "course", "curriculum", "credit", "transfer", "class"],
      ["campus tour", "visit", "open house", "orientation", "campus map"],
      ["transcript", "gpa", "test score", "sat", "act", "prerequisites"],
      ["graduation", "commencement", "degree", "diploma", "certificate"],
      ["advisor", "counselor", "professor", "faculty", "department", "dean"],
      ["registration", "enroll", "sign up", "waitlist", "add/drop", "withdraw"],
      ["schedule", "timetable", "calendar", "semester", "quarter", "term"],
      ["student id", "card", "account", "login", "portal", "system"],
      ["library", "resources", "textbook", "material", "equipment", "technology"],
      ["extracurricular", "club", "organization", "activity", "involvement"],
      ["career", "internship", "job", "placement", "employment", "alumni"],
      ["health", "insurance", "medical", "wellness", "clinic", "counseling"],
      ["parking", "transportation", "shuttle", "bus", "permit", "commute"],
      ["email", "contact", "information", "address", "phone", "update"],
      ["deadline", "due date", "extension", "late", "missed", "reschedule"],
      ["international", "visa", "foreign", "exchange", "study abroad", "i-20"],
      ["disability", "accommodation", "accessibility", "service", "support"],
    ];
    
    const foundKeywords: string[] = [];
    
    collegeKeywordSets.forEach(set => {
      set.forEach(keyword => {
        if (transcription.toLowerCase().includes(keyword.toLowerCase())) {
          if (!foundKeywords.includes(set[0])) {
            foundKeywords.push(set[0]);
          }
          
          if (keyword !== set[0] && !foundKeywords.includes(keyword)) {
            foundKeywords.push(keyword);
          }
        }
      });
    });
    
    return foundKeywords;
  }

  private categorizeInquiry(transcription: string = "", keywords: string[]): string {
    if (keywords.includes("admissions") || 
        keywords.includes("application") || 
        keywords.includes("acceptance") ||
        keywords.includes("requirements") ||
        keywords.includes("apply")) {
      return "Admissions";
    } else if (keywords.includes("financial aid") || 
               keywords.includes("scholarship") || 
               keywords.includes("tuition") ||
               keywords.includes("payment") ||
               keywords.includes("fafsa")) {
      return "Financial Aid";
    } else if (keywords.includes("housing") || 
               keywords.includes("dorm") ||
               keywords.includes("residence") ||
               keywords.includes("apartment")) {
      return "Housing";
    } else if (keywords.includes("program") || 
               keywords.includes("major") || 
               keywords.includes("course") ||
               keywords.includes("class") ||
               keywords.includes("credit") ||
               keywords.includes("transfer")) {
      return "Academic";
    } else if (transcription.toLowerCase().includes("complaint") || 
               transcription.toLowerCase().includes("issue") || 
               transcription.toLowerCase().includes("problem") ||
               transcription.toLowerCase().includes("help") ||
               transcription.toLowerCase().includes("assistance")) {
      return "Support";
    } else if (keywords.includes("career") ||
              keywords.includes("internship") ||
              keywords.includes("job") ||
              keywords.includes("employment")) {
      return "Career Services";
    } else if (keywords.includes("schedule") ||
              keywords.includes("appointment") ||
              keywords.includes("meeting") ||
              keywords.includes("calendar")) {
      return "Scheduling";
    }
    
    return "General Inquiry";
  }

  private determineCallType(call: CallAnalysisResult): string {
    if (call.call_type) return call.call_type;
    
    if (call.assistant_phone && call.assistant_phone === call.from) {
      return "outbound";
    }
    return "inbound";
  }

  private extractContactName(call: CallAnalysisResult): string {
    if (call.customer_name) return call.customer_name;
    
    if (call.transcription) {
      const namePatterns = [
        /my name is ([A-Za-z\s]+)/i,
        /this is ([A-Za-z\s]+) (calling|speaking)/i,
        /hello[\s,]+(\w+)/i,
        /hi[\s,]+(\w+)/i
      ];
      
      for (const pattern of namePatterns) {
        const match = call.transcription.match(pattern);
        if (match && match[1]) {
          const name = match[1].trim();
          if (name.length > 2 && !['the', 'and', 'but', 'for', 'from'].includes(name.toLowerCase())) {
            return name;
          }
        }
      }
    }
    
    if (call.from && call.from !== call.assistant_phone) {
      return `Caller ${call.from.slice(-4)}`;
    }
    if (call.to && call.to !== call.assistant_phone) {
      return `Caller ${call.to.slice(-4)}`;
    }
    
    return "Unknown Caller";
  }

  private determineAffiliation(call: CallAnalysisResult): string {
    if (call.transcription) {
      const transcription = call.transcription.toLowerCase();
      
      if (transcription.includes("high school") || 
          transcription.includes("secondary school") ||
          transcription.includes("senior year")) {
        return "High School Student";
      }
      
      if (transcription.includes("transfer") || 
          transcription.includes("community college") ||
          transcription.includes("credits from")) {
        return "Transfer Applicant";
      }
      
      if (transcription.includes("my son") || 
          transcription.includes("my daughter") ||
          transcription.includes("my child") ||
          transcription.includes("parent") ||
          transcription.includes("guardian")) {
        return "Parent/Guardian";
      }
      
      if (transcription.includes("graduate program") || 
          transcription.includes("master's") ||
          transcription.includes("phd") ||
          transcription.includes("doctoral")) {
        return "Graduate Applicant";
      }
      
      if (transcription.includes("my classes") || 
          transcription.includes("my course") ||
          transcription.includes("my professor") ||
          transcription.includes("my transcript") ||
          transcription.includes("my schedule")) {
        return "Current Student";
      }
      
      if (transcription.includes("faculty") || 
          transcription.includes("professor") ||
          transcription.includes("instructor") ||
          transcription.includes("teach") ||
          transcription.includes("department chair")) {
        return "Faculty/Staff";
      }
    }
    
    return "College Inquiry";
  }

  async createCampaign(payload: {
    name: string;
    description?: string;
    contacts: Array<{
      phone_number: string;
      first_name?: string;
      last_name?: string;
      [key: string]: any;
    }>;
    scheduling?: {
      start_time?: string;
      max_concurrent_calls?: number;
      timezone?: string;
    };
    [key: string]: any;
  }) {
    if (!payload.assistant_id && this.assistantId) {
      payload.assistant_id = this.assistantId;
    }
    
    // Try the API v1 endpoint first
    try {
      const endpoint = `/api/v1/campaigns`;
      return this.request<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Error with primary campaign endpoint, trying fallback:", error);
      
      // Fallback to the v1 endpoint
      const endpoint = `/v1/campaigns`;
      return this.request<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
  }

  async getCampaigns() {
    if (!this.assistantId) {
      throw new Error("Assistant ID is required");
    }
    
    // Try the API v1 endpoint first
    try {
      const endpoint = `/api/v1/campaigns`;
      const queryParams = new URLSearchParams();
      queryParams.append('assistant_id', this.assistantId);
      
      const url = `${endpoint}?${queryParams.toString()}`;
      return this.request<{ campaigns: any[] }>(url, {
        method: 'GET'
      });
    } catch (error) {
      console.error("Error with primary campaigns endpoint, trying fallback:", error);
      
      // Fallback to the v1 endpoint
      const endpoint = `/v1/campaigns`;
      const queryParams = new URLSearchParams();
      queryParams.append('assistant_id', this.assistantId);
      
      const url = `${endpoint}?${queryParams.toString()}`;
      return this.request<{ campaigns: any[] }>(url, {
        method: 'GET'
      });
    }
  }

  async getCampaign(campaignId: string) {
    // Try the API v1 endpoint first
    try {
      const endpoint = `/api/v1/campaigns/${campaignId}`;
      return this.request<any>(endpoint, {
        method: 'GET'
      });
    } catch (error) {
      console.error("Error with primary campaign endpoint, trying fallback:", error);
      
      // Fallback to the v1 endpoint
      const endpoint = `/v1/campaigns/${campaignId}`;
      return this.request<any>(endpoint, {
        method: 'GET'
      });
    }
  }

  async createOutboundCall(payload: {
    phone_number: string;
    first_name?: string;
    last_name?: string;
    metadata?: {
      [key: string]: any;
    };
  }) {
    if (!this.assistantId) {
      throw new Error("Assistant ID is required");
    }
    
    const callPayload = {
      ...payload,
      assistant_id: this.assistantId
    };
    
    // Try the API v1 endpoint first
    try {
      const endpoint = `/api/v1/calls`;
      return this.request<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify(callPayload)
      });
    } catch (error) {
      console.error("Error with primary outbound call endpoint, trying fallback:", error);
      
      // Fallback to the v1 endpoint
      const endpoint = `/v1/calls`;
      return this.request<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify(callPayload)
      });
    }
  }

  async getCallRecordings(limit?: number) {
    // Try different endpoints based on VAPI API structure
    try {
      // Try the new API v1 endpoint structure first
      const endpoint = `/api/v1/calls`;
      const queryParams = new URLSearchParams();
      
      if (this.assistantId) {
        queryParams.append('assistant_id', this.assistantId);
      }
      
      if (limit) {
        queryParams.append('limit', limit.toString());
      }
      
      const url = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint;
      const response = await this.request<{ calls: any[] }>(url, {
        method: 'GET'
      });
      
      return response.calls || [];
    } catch (error) {
      console.error("Error with primary call recordings endpoint, trying fallback:", error);
      
      try {
        // Fallback to the v1 endpoint
        const endpoint = `/v1/calls`;
        const queryParams = new URLSearchParams();
        
        if (this.assistantId) {
          queryParams.append('assistant_id', this.assistantId);
        }
        
        if (limit) {
          queryParams.append('limit', limit.toString());
        }
        
        const url = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint;
        const response = await this.request<{ calls: any[] }>(url, {
          method: 'GET'
        });
        
        return response.calls || [];
      } catch (fallbackError) {
        console.error("All endpoints failed, returning empty data:", fallbackError);
        return [];
      }
    }
  }
}

export const vapiService = new VapiService();

export default vapiService;
