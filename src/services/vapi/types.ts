// Call data types based on Vapi API
export interface CallSummary { 
  id: string;
  call_id?: string;
  startedAt?: string;
  endedAt?: string;
  call_date?: string; // Alternative field name
  endedReason?: string;
  ended_reason?: string; // Alternative field name
  status?: string;
  assistantId?: string;
  assistant_id?: string; // Alternative field name
  assistantName?: string;
  phoneNumber?: string;      // assistant's phone number used
  assistant_phone?: string;  // Alternative field name
  customerNumber?: string;   // customer's phone number
  customer_phone?: string;   // Alternative field name
  durationSeconds?: number;
  duration?: number;         // Alternative field name
  cost?: number;
  sentiment?: string;
  transcription?: string;
  contact_name?: string;
  company_name?: string;
  keywords?: string[];
  inquiry_type?: string;
  from?: string;
  to?: string;
  recording_url?: string;
  analysis?: CallAnalysis;   // Added analysis field to base type
}

export interface CallAnalysis {
  summary?: string;
  structuredData?: any;
  successEvaluation?: string;  // e.g. textual success report or boolean criteria
  success_evaluation?: number; // Alternative field name
}

export interface CallAnalysisFilters {
  assistantId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  fetchAll?: boolean;
}

// Extend existing types to support batch call operations
export interface BatchCallRequest {
  customers: Array<{
    phoneNumber: string;
    metadata?: Record<string, any>;
  }>;
  assistantId?: string;
  scheduling?: {
    earliestTime?: string;
    latestTime?: string;
  };
}

// Add Google Sheets tool types
export interface GoogleSheetsRowAppendToolConfig {
  spreadsheetId: string;
  sheetName: string;
  rows: any[];
}

// Extend CallDetails to include scheduling and transcription details
export interface CallDetails extends CallSummary {
  // Override the transcription property with an object type 
  // but keep the string version available too
  transcript?: string;  // Add transcript as alternative for transcription
  messages?: Array<{
    role: string;        // "assistant"/"bot", "user", or "system"
    message: string;     // text of the utterance
    time?: number;       // timestamp (ms since epoch)
    secondsFromStart?: number;
  }>;
  recordingUrl?: string; // Alternative to recording_url
  costBreakdown?: Record<string, number>;
  scheduling?: {
    scheduledTime?: string;
    actualStartTime?: string;
    status?: 'scheduled' | 'completed' | 'failed';
  };
  transcriptionDetails?: {  // Use a different name to avoid conflict
    method?: 'default' | 'google' | 'openai';
    fallbackPlan?: string[];
    confidence?: number;
  };
}
