import { fetchCredentials, getAuthHeaders, getAssistantId } from './credentials';
import { CallSummary, CallDetails, CallAnalysisFilters } from './types';
import { toast } from "sonner";

const BASE_URL = "https://api.vapi.ai";
let retryCount = 0;
const maxRetries = 3;

/**
 * Makes a request to the Vapi API with retry handling
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  await fetchCredentials();
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    console.log(`Making request to Vapi API: ${url}`);
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });
    
    // Reset retry count on success
    retryCount = 0;
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Vapi API error (${response.status}): ${errorText}`);
      
      // Handle rate limits and server errors with retries
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        throw new Error(`Vapi API temporarily unavailable (${response.status}): ${errorText}`);
      }
      
      throw new Error(`Vapi API error (${response.status}): ${errorText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('Error calling Vapi API:', error);
    
    // Implement retry logic for network errors or temporary unavailability
    if (retryCount < maxRetries && 
        (error instanceof TypeError || 
         (error instanceof Error && error.message.includes('temporarily unavailable')))) {
      retryCount++;
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      console.log(`Retrying request (${retryCount}/${maxRetries}) after ${delay}ms`);
      
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const result = await request<T>(endpoint, options);
            resolve(result);
          } catch (retryError) {
            reject(retryError);
          }
        }, delay);
      });
    }
    
    toast.error(error instanceof Error ? error.message : 'Failed to call Vapi API');
    throw error;
  }
}

/**
 * Get call analysis with flexible endpoint handling
 */
export async function getCallAnalysis(filters?: CallAnalysisFilters): Promise<CallSummary[]> {
  const assistantId = filters?.assistantId || getAssistantId() || "b6860fc3-a9da-4741-83ce-cb07c5725486";
  
  if (!assistantId) {
    throw new Error("Assistant ID is required");
  }
  
  console.log("Fetching call analysis with assistant ID:", assistantId);
  
  // Try multiple endpoint formats
  const endpoints = [
    "/v1/calls",
    "/api/v1/calls",
    "/v1/calls/list",
    "/api/v1/calls/list"
  ];
  
  let lastError = null;
  
  for (const endpoint of endpoints) {
    try {
      const queryParams = new URLSearchParams();
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
        // First format attempt
        const response = await request<{ calls: CallSummary[] }>(url);
        console.log("Success with endpoint format 1:", endpoint);
        return processCallData(response.calls || []);
      } catch (formatError1) {
        try {
          // Second format attempt
          const response = await request<{ results: CallSummary[] }>(url);
          console.log("Success with endpoint format 2:", endpoint);
          return processCallData(response.results || []);
        } catch (formatError2) {
          try {
            // Third format attempt - direct array
            const response = await request<CallSummary[]>(url);
            console.log("Success with endpoint format 3:", endpoint);
            return processCallData(response || []);
          } catch (formatError3) {
            // Try one more format that might be used
            const response = await request<{ data: CallSummary[] }>(url);
            console.log("Success with endpoint format 4:", endpoint);
            return processCallData(response.data || []);
          }
        }
      }
    } catch (error) {
      console.error(`Failed with endpoint ${endpoint}:`, error);
      lastError = error;
      // Continue to try the next endpoint
    }
  }
  
  console.error("All endpoints failed, returning empty data:", lastError);
  return [];
}

/**
 * Get detailed information for a specific call
 */
export async function getCallDetails(callId: string): Promise<CallDetails> {
  if (!callId) {
    throw new Error("Call ID is required");
  }
  
  // Try multiple endpoint formats
  const endpoints = [
    `/v1/calls/${callId}`,
    `/api/v1/calls/${callId}`,
    `/v1/call/${callId}`,
    `/api/v1/call/${callId}`
  ];
  
  let lastError = null;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying to fetch details for call ${callId} with endpoint: ${endpoint}`);
      const details = await request<CallDetails>(endpoint);
      console.log("Successfully retrieved call details with endpoint:", endpoint);
      return details;
    } catch (error) {
      console.error(`Failed to get call details with endpoint ${endpoint}:`, error);
      lastError = error;
    }
  }
  
  throw lastError || new Error(`Failed to get details for call ${callId}`);
}

/**
 * Process call data to ensure consistent field naming and add computed fields
 */
function processCallData(calls: CallSummary[]): CallSummary[] {
  return calls.map(call => {
    // Normalize field names (API might use snake_case or camelCase)
    const normalizedCall: CallSummary = {
      id: call.id || call.call_id || '',
      startedAt: call.startedAt || call.call_date,
      endedAt: call.endedAt,
      endedReason: call.endedReason || call.ended_reason,
      status: call.status,
      assistantId: call.assistantId || call.assistant_id,
      phoneNumber: call.phoneNumber || call.assistant_phone,
      customerNumber: call.customerNumber || call.customer_phone,
      duration: call.durationSeconds || call.duration,
      cost: call.cost,
      sentiment: call.sentiment,
      transcription: call.transcription,
      recording_url: call.recording_url || call.recordingUrl,
      contact_name: call.contact_name,
      company_name: call.company_name,
      keywords: call.keywords || [],
      inquiry_type: call.inquiry_type,
      from: call.from,
      to: call.to
    };
    
    // Extract contact name if not present
    if (!normalizedCall.contact_name && normalizedCall.transcription) {
      normalizedCall.contact_name = extractContactName(normalizedCall);
    }
    
    // Determine inquiry type if not present
    if (!normalizedCall.inquiry_type && normalizedCall.transcription) {
      normalizedCall.inquiry_type = categorizeInquiry(normalizedCall.transcription, normalizedCall.keywords || []);
    }
    
    // Extract keywords if not present
    if ((!normalizedCall.keywords || normalizedCall.keywords.length === 0) && normalizedCall.transcription) {
      normalizedCall.keywords = extractKeywords(normalizedCall.transcription);
    }
    
    // Determine call type if not present (outbound/inbound)
    if (!normalizedCall.inquiry_type) {
      normalizedCall.inquiry_type = determineCallType(normalizedCall);
    }
    
    return normalizedCall;
  });
}

/**
 * Extract contact name from transcription if available
 */
function extractContactName(call: CallSummary): string {
  if (call.contact_name) return call.contact_name;
  
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

/**
 * Categorize inquiry type based on transcription content
 */
function categorizeInquiry(transcription: string = "", keywords: string[]): string {
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

/**
 * Extract keywords from transcription
 */
function extractKeywords(transcription: string = ""): string[] {
  if (!transcription) return [];
  
  const collegeKeywordSets = [
    ["admissions", "application", "apply", "acceptance", "deadline", "requirements"],
    ["financial aid", "scholarship", "grant", "tuition", "fafsa", "loan", "payment"],
    ["housing", "dorm", "residence", "accommodation", "on-campus", "apartment"],
    ["program", "major", "course", "curriculum", "credit", "transfer", "class"],
    ["campus tour", "visit", "open house", "orientation", "campus map"],
    ["transcript", "gpa", "test score", "sat", "act", "prerequisites"]
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

/**
 * Determine if call is inbound or outbound
 */
function determineCallType(call: CallSummary): string {
  if (call.assistant_phone && call.from === call.assistant_phone) {
    return "Outbound";
  }
  return "Inbound";
}

/**
 * Compute human-readable duration from call data
 */
export function computeCallDuration(call: CallSummary): string {
  if (!call) return "";
  
  let durationInSeconds = 0;
  
  if (typeof call.duration === "number") {
    durationInSeconds = call.duration;
  } else if (call.startedAt && call.endedAt) {
    const start = new Date(call.startedAt).getTime();
    const end = new Date(call.endedAt).getTime();
    durationInSeconds = Math.max(0, (end - start) / 1000);
  } else {
    return "";
  }
  
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  
  if (minutes === 0) {
    return `${seconds}s`;
  }
  
  return `${minutes}m ${seconds}s`;
}
