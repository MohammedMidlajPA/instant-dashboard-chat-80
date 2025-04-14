
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

    console.log("Fetching call analysis with assistant ID:", assistantId);

    // Define the correct endpoints based on VAPI API
    // Using query parameters as recommended in documentation
    const endpoints = [
      // Main endpoints to try first - use query parameters
      "/v1/call-analysis",
      "/call-analysis",
      "/v1/calls/analysis",
      "/calls/analysis",
      "/v1/assistants/call-analysis",
      "/assistants/call-analysis",
      
      // Additional endpoints to try
      "/v1/analytics/calls",
      "/analytics/calls",
      "/v1/calls",
      "/calls"
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const queryParams = new URLSearchParams();
        
        // Pass assistant_id as a query parameter, not in the path
        queryParams.append('assistant_id', assistantId);
        
        if (filters?.limit) {
          queryParams.append('limit', filters.limit.toString());
        }
        
        if (filters?.startDate) {
          queryParams.append('start_date', filters.startDate);
        }
        
        if (filters?.endDate) {
          queryParams.append('end_date', filters.endDate);
        }
        
        const url = `${endpoint}?${queryParams.toString()}`;
        console.log("Trying endpoint:", url);

        try {
          // Try different response formats
          // Option 1: { calls: [...] }
          const response = await this.request<{ calls: CallAnalysisResult[] }>(url, {
            method: 'GET',
          });
          
          console.log("Success with endpoint format 1:", endpoint);
          return this.processCollegeCallData(response.calls || []);
        } catch (formatError1) {
          try {
            // Option 2: { results: [...] }
            const response = await this.request<{ results: CallAnalysisResult[] }>(url, {
              method: 'GET',
            });
            
            console.log("Success with endpoint format 2:", endpoint);
            return this.processCollegeCallData(response.results || []);
          } catch (formatError2) {
            // Option 3: Direct array
            const response = await this.request<CallAnalysisResult[]>(url, {
              method: 'GET',
            });
            
            console.log("Success with endpoint format 3:", endpoint);
            return this.processCollegeCallData(response || []);
          }
        }
      } catch (error) {
        console.error(`Failed with endpoint ${endpoint}:`, error);
        lastError = error;
        // Continue to next endpoint
      }
    }

    // If all endpoints failed, return empty data rather than throwing
    console.error("All endpoints failed, returning empty data:", lastError);
    return [];
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
    
    // Try different campaign endpoints using query parameter approach
    const endpoints = [
      `/v1/campaigns`,
      `/campaigns`,
      `/api/v1/campaigns`
    ];
    
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying to create campaign with endpoint: ${endpoint}`);
        const result = await this.request<any>(endpoint, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        console.log("Campaign created successfully with endpoint:", endpoint);
        return result;
      } catch (error) {
        console.error(`Failed to create campaign with endpoint ${endpoint}:`, error);
        lastError = error;
        // Continue to next endpoint
      }
    }
    
    // If all endpoints fail, throw the last error
    throw lastError || new Error("Failed to create campaign with all attempted endpoints");
  }

  async getCampaigns() {
    const assistantId = this.assistantId || "b6860fc3-a9da-4741-83ce-cb07c5725486";
    
    if (!assistantId) {
      throw new Error("Assistant ID is required");
    }
    
    // Try different campaign endpoints
    const endpoints = [
      `/v1/campaigns`,
      `/campaigns`,
      `/api/v1/campaigns`
    ];
    
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('assistant_id', assistantId);
        
        const url = `${endpoint}?${queryParams.toString()}`;
        console.log(`Trying to get campaigns with endpoint: ${url}`);
        
        const result = await this.request<{ campaigns: any[] }>(url, {
          method: 'GET'
        });
        
        console.log("Campaigns retrieved successfully with endpoint:", endpoint);
        return result;
      } catch (error) {
        console.error(`Failed to get campaigns with endpoint ${endpoint}:`, error);
        lastError = error;
        // Continue to next endpoint
      }
    }
    
    // If all endpoints fail, return empty data rather than throwing
    console.error("All campaign endpoints failed, returning empty data");
    return { campaigns: [] };
  }

  async getCampaign(campaignId: string) {
    // Try different campaign endpoints
    const endpoints = [
      `/v1/campaigns/${campaignId}`,
      `/campaigns/${campaignId}`,
      `/api/v1/campaigns/${campaignId}`
    ];
    
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying to get campaign with endpoint: ${endpoint}`);
        const result = await this.request<any>(endpoint, {
          method: 'GET'
        });
        console.log("Campaign retrieved successfully with endpoint:", endpoint);
        return result;
      } catch (error) {
        console.error(`Failed to get campaign with endpoint ${endpoint}:`, error);
        lastError = error;
        // Continue to next endpoint
      }
    }
    
    // If all endpoints fail, throw the last error
    throw lastError || new Error("Failed to get campaign with all attempted endpoints");
  }

  async createOutboundCall(payload: {
    phone_number: string;
    first_name?: string;
    last_name?: string;
    metadata?: {
      [key: string]: any;
    };
  }) {
    const assistantId = this.assistantId || "b6860fc3-a9da-4741-83ce-cb07c5725486";
    
    if (!assistantId) {
      throw new Error("Assistant ID is required");
    }
    
    const callPayload = {
      ...payload,
      assistant_id: assistantId
    };
    
    // Try different call endpoints
    const endpoints = [
      `/v1/calls`,
      `/calls`,
      `/api/v1/calls`
    ];
    
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying to create outbound call with endpoint: ${endpoint}`);
        const result = await this.request<any>(endpoint, {
          method: 'POST',
          body: JSON.stringify(callPayload)
        });
        console.log("Outbound call created successfully with endpoint:", endpoint);
        return result;
      } catch (error) {
        console.error(`Failed to create outbound call with endpoint ${endpoint}:`, error);
        lastError = error;
        // Continue to next endpoint
      }
    }
    
    // If all endpoints fail, throw the last error
    throw lastError || new Error("Failed to create outbound call with all attempted endpoints");
  }

  async getCallRecordings(limit?: number) {
    const assistantId = this.assistantId || "b6860fc3-a9da-4741-83ce-cb07c5725486";
    
    // Try different endpoints based on VAPI API documentation
    const endpoints = [
      `/v1/calls`,
      `/calls`,
      `/v1/calls/recordings`,
      `/calls/recordings`
    ];
    
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        const queryParams = new URLSearchParams();
        
        // Always pass assistant_id as a query parameter
        queryParams.append('assistant_id', assistantId);
        
        if (limit) {
          queryParams.append('limit', limit.toString());
        }
        
        const url = `${endpoint}?${queryParams.toString()}`;
        console.log(`Trying to get call recordings with endpoint: ${url}`);
        
        try {
          const response = await this.request<{ calls: any[] }>(url, {
            method: 'GET'
          });
          
          console.log("Call recordings retrieved successfully with endpoint:", endpoint);
          return response.calls || [];
        } catch (formatError) {
          const response = await this.request<any[]>(url, {
            method: 'GET'
          });
          
          console.log("Call recordings retrieved successfully with endpoint (array format):", endpoint);
          return response || [];
        }
      } catch (error) {
        console.error(`Failed to get call recordings with endpoint ${endpoint}:`, error);
        lastError = error;
        // Continue to next endpoint
      }
    }
    
    // If all endpoints fail, return empty data rather than throwing
    console.error("All endpoints failed when getting call recordings, returning empty data");
    return [];
  }
}

export const vapiService = new VapiService();

export default vapiService;
