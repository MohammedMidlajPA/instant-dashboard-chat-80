
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

      // Enhance the results with college-specific data processing
      return this.processCollegeCallData(allResults);
    } else {
      // Standard request with the provided filters
      const endpoint = `/assistants/call-analysis?${params.toString()}`;
      const response = await this.request<{ results: CallAnalysisResult[] }>(endpoint);
      
      // Enhance the results with college-specific data processing
      return this.processCollegeCallData(response.results || []);
    }
  }

  // Process call data specifically for college use case
  private processCollegeCallData(calls: CallAnalysisResult[]): CallAnalysisResult[] {
    return calls.map(call => {
      // Extract college-specific keywords
      const collegeKeywords = this.extractCollegeKeywords(call.transcription);
      
      // Determine the type of inquiry (admissions, financial aid, etc.)
      const inquiryType = this.categorizeInquiry(call.transcription, collegeKeywords);
      
      // Enhance with additional processing for college environment
      return {
        ...call,
        // Add derived fields for the college context
        call_type: call.call_type || this.determineCallType(call),
        contact_name: call.contact_name || this.extractContactName(call),
        company_name: call.company_name || this.determineAffiliation(call),
        keywords: collegeKeywords.length > 0 ? collegeKeywords : (call.keywords || []),
        inquiry_type: inquiryType,
      };
    });
  }

  // Extract college-relevant keywords from transcription
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
          // Add the primary category keyword (first in the set)
          if (!foundKeywords.includes(set[0])) {
            foundKeywords.push(set[0]);
          }
          
          // Also add the specific matching keyword if it's not the category itself
          if (keyword !== set[0] && !foundKeywords.includes(keyword)) {
            foundKeywords.push(keyword);
          }
        }
      });
    });
    
    return foundKeywords;
  }

  // Categorize the type of inquiry based on transcription and keywords
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

  // Determine call type if not provided by API
  private determineCallType(call: CallAnalysisResult): string {
    // Check if the call type is explicitly provided
    if (call.call_type) return call.call_type;
    
    // Implement logic to determine if a call is inbound or outbound
    // This is placeholder logic - customize based on your data
    if (call.assistant_phone && call.assistant_phone === call.from) {
      return "outbound";
    }
    return "inbound";
  }

  // Extract contact name if not provided by API
  private extractContactName(call: CallAnalysisResult): string {
    // If customer_name is provided, use it
    if (call.customer_name) return call.customer_name;
    
    // Try to extract a name from the transcription if available
    if (call.transcription) {
      // Look for common introduction patterns in transcriptions
      const namePatterns = [
        /my name is ([A-Za-z\s]+)/i,
        /this is ([A-Za-z\s]+) (calling|speaking)/i,
        /hello[\s,]+(\w+)/i,
        /hi[\s,]+(\w+)/i
      ];
      
      for (const pattern of namePatterns) {
        const match = call.transcription.match(pattern);
        if (match && match[1]) {
          // Clean up the extracted name
          const name = match[1].trim();
          // Avoid returning very short names or words that are likely not names
          if (name.length > 2 && !['the', 'and', 'but', 'for', 'from'].includes(name.toLowerCase())) {
            return name;
          }
        }
      }
    }
    
    // If we can't extract a name, use the phone number with masking
    if (call.from && call.from !== call.assistant_phone) {
      return `Caller ${call.from.slice(-4)}`;
    }
    if (call.to && call.to !== call.assistant_phone) {
      return `Caller ${call.to.slice(-4)}`;
    }
    
    return "Unknown Caller";
  }

  // Determine college affiliation based on call data
  private determineAffiliation(call: CallAnalysisResult): string {
    // Try to extract affiliation from transcription
    if (call.transcription) {
      const transcription = call.transcription.toLowerCase();
      
      // Check for high school affiliation
      if (transcription.includes("high school") || 
          transcription.includes("secondary school") ||
          transcription.includes("senior year")) {
        return "High School Student";
      }
      
      // Check for transfer student
      if (transcription.includes("transfer") || 
          transcription.includes("community college") ||
          transcription.includes("credits from")) {
        return "Transfer Applicant";
      }
      
      // Check for parent/guardian
      if (transcription.includes("my son") || 
          transcription.includes("my daughter") ||
          transcription.includes("my child") ||
          transcription.includes("parent") ||
          transcription.includes("guardian")) {
        return "Parent/Guardian";
      }
      
      // Check for graduate student
      if (transcription.includes("graduate program") || 
          transcription.includes("master's") ||
          transcription.includes("phd") ||
          transcription.includes("doctoral")) {
        return "Graduate Applicant";
      }
      
      // Check for current student
      if (transcription.includes("my classes") || 
          transcription.includes("my course") ||
          transcription.includes("my professor") ||
          transcription.includes("my transcript") ||
          transcription.includes("my schedule")) {
        return "Current Student";
      }
      
      // Check for faculty/staff
      if (transcription.includes("faculty") || 
          transcription.includes("professor") ||
          transcription.includes("instructor") ||
          transcription.includes("teach") ||
          transcription.includes("department chair")) {
        return "Faculty/Staff";
      }
    }
    
    // Default affiliation if none of the above matches
    return "College Inquiry";
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
}

// Create and export a singleton instance
export const vapiService = new VapiService();

export default vapiService;
