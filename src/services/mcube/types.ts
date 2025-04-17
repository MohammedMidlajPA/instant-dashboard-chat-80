// MCUBE API Types

// Inbound call payload structure from MCUBE
export interface McubeInboundCall {
  starttime: string;      // Start time of call - "2023-10-12 11:49:57"
  callid: string;         // Unique Id for every call - "80889767291697091597"
  emp_phone: string;      // Agent phone number - "8767316316"
  clicktocalldid: string; // MCUBE DID number - "8035053336"
  callto: string;         // Customer number - "7816999444"
  dialstatus: string;     // "ANSWER", "CANCEL", "Executive Busy", "Busy", "NoAnswer"
  filename: string;       // Call Recording URL
  direction: string;      // "inbound" or "outbound"
  endtime: string;        // End time of the call
  disconnectedby: string; // "Customer" or "Agent"
  answeredtime: string;   // "00:00:04"
  groupname: string;      // "Integration", "Inbound", "Autodialer"
  agentname: string;      // Name of the Agent - "Test"
}

// Outbound call request to MCUBE API
export interface McubeOutboundCallRequest {
  HTTP_AUTHORIZATION: string; // MCUBE API Token
  exenumber: string;          // Agent phone number
  custnumber: string;         // Customer phone number
  refurl: string;             // Callback URL
  refid?: string;             // Optional reference ID
}

// MCUBE Outbound call response
export interface McubeOutboundCallResponse {
  success: boolean;
  callId?: string;
  message?: string;
  status?: string;
}

// Standardized call record format for our application
export interface CallRecord {
  id: string;                     // Unique ID (callid from MCUBE)
  startTime: string;              // Call start time
  startedAt?: string;             // Alternative start time format
  call_date?: string;             // Alternative date format
  endTime?: string;               // Call end time
  duration?: number;              // Duration in seconds
  direction: 'inbound' | 'outbound';
  status: string;                 // Call status (from dialstatus)
  agentPhone: string;             // Agent phone (emp_phone)
  agentName?: string;             // Agent name if available
  customerPhone: string;          // Customer phone (callto)
  didNumber?: string;             // DID number (clicktocalldid)
  recordingUrl?: string;          // Recording URL (filename)
  recording_url?: string;         // Alternative recording URL
  disconnectedBy?: string;        // Who ended the call
  answeredTime?: string;          // When call was answered
  groupName?: string;             // Call group
  transcription?: string;         // Call transcription
  transcript?: string;            // Alternative transcription field
  sentiment?: string;             // Sentiment analysis result
  keywords?: string[];            // Keywords extracted from transcription
  notes?: string;                 // Call notes
  contact_name?: string;          // Contact/customer name
  company_name?: string;          // Company name
  inquiry_type?: string;          // Type of inquiry
  
  // Syntheon.ai specific fields
  analysis?: {
    successEvaluation?: boolean;    // Whether call was successful
    success_evaluation?: boolean;   // Alternative field
    scriptAdherence?: number;       // Script adherence percentage (0-100)
    deadAirSeconds?: number;        // Total dead air in seconds
    deadAirPercentage?: number;     // Dead air as percentage of call
    agentTalkRatio?: number;        // Percentage of call where agent is talking
    sentimentBreakdown?: {          // Detailed sentiment analysis
      positive: number;
      neutral: number;
      negative: number;
    };
    agentMetrics?: {                // Agent performance metrics
      talkSpeed: number;            // Words per minute
      interruptionCount: number;    // Times agent interrupted customer
      questionCount: number;        // Questions asked by agent
      empathyScore: number;         // Empathy rating (0-100)
      talkRatio?: number;           // Alternative field for talk ratio
    };
    keyInsights?: string[];         // Important takeaways from call
  };
  
  // For compatibility with existing code
  success_evaluation?: boolean;     // Whether call was successful
}

// Filters for retrieving calls
export interface CallFilters {
  agentPhone?: string;
  startDate?: string;
  endDate?: string;
  direction?: 'inbound' | 'outbound';
  status?: string;
  groupName?: string;
  limit?: number;
}

// Campaign structure
export interface CallCampaign {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  contacts: CampaignContact[];
  script?: string;
  agentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

// Campaign contact
export interface CampaignContact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  company?: string;
  status: 'pending' | 'contacted' | 'completed' | 'failed';
  callId?: string;
  notes?: string;
}

// Syntheon.ai Analysis Request
export interface SyntheonAnalysisRequest {
  callId: string;
  recordingUrl: string;
  transcription?: string;
  scriptId?: string;
}

// Syntheon.ai Analysis Response
export interface SyntheonAnalysisResponse {
  callId: string;
  summary: string;
  sentiment: string;
  scriptAdherence?: number;
  deadAirSeconds: number;
  deadAirPercentage: number;
  keywords: string[];
  agentMetrics: {
    talkSpeed: number;
    interruptionCount: number;
    questionCount: number;
    empathyScore: number;
  };
  keyInsights: string[];
  success: boolean;
}
