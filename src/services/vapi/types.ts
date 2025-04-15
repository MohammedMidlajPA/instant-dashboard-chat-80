
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
}

export interface CallAnalysis {
  summary?: string;
  structuredData?: any;
  successEvaluation?: string;  // e.g. textual success report or boolean criteria
  success_evaluation?: number; // Alternative field name
}

export interface CallDetails extends CallSummary {
  analysis?: CallAnalysis;
  transcript?: string;
  transcription?: string; // Alternative field name
  messages?: Array<{
    role: string;        // "assistant"/"bot", "user", or "system"
    message: string;     // text of the utterance
    time?: number;       // timestamp (ms since epoch)
    secondsFromStart?: number;
  }>;
  recordingUrl?: string;
  recording_url?: string; // Alternative field name
  costBreakdown?: Record<string, number>;
}

export interface CallAnalysisFilters {
  assistantId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  fetchAll?: boolean;
}
