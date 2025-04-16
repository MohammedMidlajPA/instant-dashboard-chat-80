
// MCUBE API Types

// Inbound call payload structure
export interface McubeInboundCall {
  starttime: string;      // "2023-10-12 11:49:57"
  callid: string;         // "80889767291697091597"
  emp_phone: string;      // "8767316316"
  clicktocalldid: string; // "8035053336"
  callto: string;         // "7816999444"
  dialstatus: string;     // "ANSWER", "CANCEL", "Executive Busy", "Busy", "NoAnswer"
  filename: string;       // Recording URL: "https://s3.ap-south-1.amazonaws.com/app.mcube.com/recordings/..."
  direction: string;      // "inbound" or "outbound"
  endtime: string;        // End time of the call
  disconnectedby: string; // "Customer" or "Agent"
  answeredtime: string;   // "00:00:04"
  groupname: string;      // "Integration"
  agentname: string;      // "Test"
}

// Outbound call request structure
export interface McubeOutboundCallRequest {
  HTTP_AUTHORIZATION: string; // Token for authentication
  exenumber: string;          // Executive/Agent number
  custnumber: string;         // Customer number to call
  refurl: string;             // Callback URL
  refid?: string;             // Optional reference ID
}

// Outbound call response structure
export interface McubeOutboundCallResponse {
  success: boolean;
  message?: string;
  callId?: string;
  status?: string;
}

// Standardized call format for our application
export interface CallRecord {
  id: string;                   // Unique ID (callid from MCUBE)
  startTime: string;            // Call start time
  endTime?: string;             // Call end time
  duration?: number;            // Duration in seconds
  direction: 'inbound' | 'outbound';
  status: string;               // Call status (from dialstatus)
  agentPhone: string;           // Agent phone (emp_phone)
  agentName?: string;           // Agent name if available
  customerPhone: string;        // Customer phone (callto)
  recordingUrl?: string;        // Recording URL (filename)
  disconnectedBy?: string;      // Who ended the call
  groupName?: string;           // Call group
  sentiment?: string;           // Will be calculated or set manually
  transcription?: string;       // Will be populated if available
  keywords?: string[];          // Keywords extracted from transcription
  contactName?: string;         // Customer name if available
  companyName?: string;         // Company name if available
  success?: boolean;            // Whether the call was successful
}

// Filters for retrieving calls
export interface CallFilters {
  agentPhone?: string;
  startDate?: string;
  endDate?: string;
  direction?: 'inbound' | 'outbound';
  limit?: number;
}
