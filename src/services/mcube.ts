
import { toast } from "sonner";
import * as mcubeTypes from "./mcube/types";

// Re-exporting types from the mcube/types file
export type CallRecord = mcubeTypes.CallRecord;
export type CallFilters = mcubeTypes.CallFilters;
export type Campaign = mcubeTypes.CallCampaign;

// Define campaign interface
export interface CampaignCreatePayload {
  name: string;
  description?: string;
  contacts: ContactPayload[];
  provider?: string;
  scheduling?: {
    start_time: string;
    max_concurrent_calls: number;
    timezone: string;
  };
  voice_agent?: {
    prompt: string;
    first_message?: string;
    model: string;
    voice_id?: string;
    has_knowledge_base: boolean;
  };
}

// Define contact payload
export interface ContactPayload {
  phone_number: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  metadata?: Record<string, any>;
}

// Simple cache for API calls
const cache: Record<string, any> = {};

class McubeService {
  private apiUrl: string = 'https://api.mcube.com'; // Replace with actual API URL
  private token: string | null = null;
  
  constructor(token?: string) {
    if (token) {
      this.setToken(token);
    } else {
      this.token = localStorage.getItem('mcube_token');
    }
  }
  
  /**
   * Set the telecom API token
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('mcube_token', token);
  }
  
  /**
   * Get the stored telecom API token
   */
  getToken(): string | null {
    return this.token;
  }
  
  /**
   * Clear the stored telecom API token
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('mcube_token');
    toast.info("Telecom credentials have been cleared");
  }
  
  /**
   * Make an authenticated request to the telecom API
   */
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.token) {
      // Initialize with a mock token for development purposes
      this.setToken("mock-token-for-development");
    }
    
    const url = `${this.apiUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    try {
      console.log(`Making request to: ${url}`);
      // For demonstration, we'll simulate API responses
      
      return await this.getMockResponse<T>(endpoint, options);
    } catch (error) {
      console.error('Error calling API:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to call API');
      throw error;
    }
  }
  
  /**
   * Mock responses for demonstration purposes
   */
  private async getMockResponse<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (endpoint.includes('/campaigns') && options.method === 'POST') {
      return {
        id: `campaign-${Date.now()}`,
        name: (JSON.parse(options.body as string)).name,
        status: 'draft',
        message: 'Campaign created successfully'
      } as unknown as T;
    }
    
    if (endpoint.includes('/campaigns') && options.method === 'GET') {
      return [
        {
          id: 'campaign-1',
          name: 'Fall 2025 Outreach',
          description: 'Fall 2025 outreach to prospective students',
          status: 'active',
          contacts_count: 250,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          provider: 'mcube',
          completed_count: 120
        },
        {
          id: 'campaign-2',
          name: 'Spring 2026 Follow-up',
          description: 'Follow-up calls for interested students',
          status: 'scheduled',
          contacts_count: 75,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          provider: 'twilio',
          completed_count: 0
        }
      ] as unknown as T;
    }
    
    if (endpoint.includes('/call-logs')) {
      return this.getCallLogs() as unknown as T;
    }
    
    if (endpoint.includes('/campaign-results')) {
      return {
        id: endpoint.split('/').pop(),
        name: 'Fall 2025 Outreach',
        total_calls: 250,
        completed_calls: 235,
        answered_calls: 180,
        interested_count: 95,
        not_interested_count: 85,
        average_duration: 120 // seconds
      } as unknown as T;
    }
    
    throw new Error(`No mock implementation for endpoint: ${endpoint}`);
  }
  
  /**
   * Initiate an outbound call
   */
  async makeOutboundCall(
    agentNumber: string, 
    customerNumber: string, 
    callbackUrl?: string
  ): Promise<{ callId: string }> {
    try {
      const payload = {
        HTTP_AUTHORIZATION: this.token,
        exenumber: agentNumber,
        custnumber: customerNumber,
        refurl: callbackUrl || window.location.origin
      };
      
      // This is a placeholder - actual implementation would use the real endpoint
      const result = await this.request<{ callId: string }>(
        '/outbound-calls', 
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );
      
      toast.success("Outbound call initiated successfully");
      return result;
    } catch (error) {
      console.error('Failed to initiate outbound call:', error);
      toast.error('Failed to initiate outbound call');
      throw error;
    }
  }
  
  /**
   * Create a new campaign
   */
  async createCampaign(payload: CampaignCreatePayload): Promise<any> {
    try {
      const result = await this.request<any>(
        '/campaigns', 
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );
      
      return result;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  }
  
  /**
   * Get all campaigns
   */
  async getCampaigns(): Promise<any[]> {
    try {
      const result = await this.request<any[]>(
        '/campaigns',
        { method: 'GET' }
      );
      
      return result;
    } catch (error) {
      console.error('Failed to get campaigns:', error);
      throw error;
    }
  }
  
  /**
   * Get campaign details
   */
  async getCampaign(campaignId: string): Promise<any> {
    try {
      const result = await this.request<any>(
        `/campaigns/${campaignId}`,
        { method: 'GET' }
      );
      
      return result;
    } catch (error) {
      console.error('Failed to get campaign:', error);
      throw error;
    }
  }
  
  /**
   * Get campaign results
   */
  async getCampaignResults(campaignId: string): Promise<any> {
    try {
      const result = await this.request<any>(
        `/campaign-results/${campaignId}`,
        { method: 'GET' }
      );
      
      return result;
    } catch (error) {
      console.error('Failed to get campaign results:', error);
      throw error;
    }
  }
  
  /**
   * Get recent call logs
   */
  async getCallLogs(limit: number = 10): Promise<mcubeTypes.CallRecord[]> {
    // Check cache first
    const cacheKey = `call_logs_${limit}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    
    // Mock data for UI development
    const mockData: mcubeTypes.CallRecord[] = Array(limit).fill(null).map((_, index) => ({
      id: `call-${Date.now()}-${index}`,
      startTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      endTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      duration: Math.floor(Math.random() * 600),
      agentName: ['John Doe', 'Jane Smith', 'Mike Johnson'][Math.floor(Math.random() * 3)],
      agentPhone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      customerPhone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      direction: Math.random() > 0.5 ? 'inbound' : 'outbound',
      status: ['completed', 'missed', 'busy', 'failed', 'no-answer'][Math.floor(Math.random() * 5)],
      recordingUrl: Math.random() > 0.3 ? `https://example.com/recordings/call-${index}.wav` : undefined,
    }));
    
    // Store in cache
    cache[cacheKey] = mockData;
    
    return mockData;
  }
  
  /**
   * Get call details by ID
   */
  async getCallDetails(callId: string): Promise<mcubeTypes.CallRecord | null> {
    // Check cache first
    const cacheKey = `call_details_${callId}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    
    // Mock a single call detail
    const mockDetail: mcubeTypes.CallRecord = {
      id: callId,
      startTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      endTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      duration: Math.floor(Math.random() * 600),
      agentName: ['John Doe', 'Jane Smith', 'Mike Johnson'][Math.floor(Math.random() * 3)],
      agentPhone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      customerPhone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      direction: Math.random() > 0.5 ? 'inbound' : 'outbound',
      status: ['completed', 'missed', 'busy', 'failed', 'no-answer'][Math.floor(Math.random() * 5)],
      recordingUrl: Math.random() > 0.3 ? `https://example.com/recordings/${callId}.wav` : undefined,
      notes: "Mock call detail entry for demonstration"
    };
    
    // Store in cache
    cache[cacheKey] = mockDetail;
    
    return mockDetail;
  }

  // Methods needed for CallAnalysis components
  async getCalls(filters?: mcubeTypes.CallFilters): Promise<mcubeTypes.CallRecord[]> {
    return this.getCallLogs(filters?.limit || 10);
  }

  async getCallById(callId: string): Promise<mcubeTypes.CallRecord | null> {
    return this.getCallDetails(callId);
  }

  subscribeToCallUpdates(callback: (call: mcubeTypes.CallRecord) => void): () => void {
    // Mock implementation that doesn't actually subscribe
    console.log("Mock subscription to call updates");
    return () => console.log("Mock unsubscribe from call updates");
  }

  async analyzeSyntheonCall(callId: string): Promise<any> {
    // Mock Syntheon analysis
    return {
      callId,
      success: true,
      message: "Mock analysis completed"
    };
  }
}

export const mcubeService = new McubeService();
export default mcubeService;
