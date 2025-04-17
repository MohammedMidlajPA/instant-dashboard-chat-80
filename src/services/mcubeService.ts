
import { toast } from "sonner";

// Define call data interface for MCUBE integration
export interface McubeCallData {
  callId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  agentName?: string;
  agentPhone?: string;
  customerPhone?: string;
  direction: 'inbound' | 'outbound';
  status: string;
  recordingUrl?: string;
  notes?: string;
}

// Simple cache for API calls
const cache: Record<string, any> = {};

class McubeService {
  private apiUrl: string = 'https://api.mcube.com';
  private token: string | null = null;
  
  constructor(token?: string) {
    if (token) {
      this.setToken(token);
    } else {
      this.token = localStorage.getItem('mcube_token');
    }
  }
  
  /**
   * Set the MCUBE API token
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('mcube_token', token);
  }
  
  /**
   * Get the stored MCUBE API token
   */
  getToken(): string | null {
    return this.token;
  }
  
  /**
   * Clear the stored MCUBE API token
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('mcube_token');
    toast.info("MCUBE credentials have been cleared");
  }
  
  /**
   * Make an authenticated request to the MCUBE API
   */
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.token) {
      throw new Error("MCUBE API token is not set");
    }
    
    const url = `${this.apiUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    try {
      console.log(`Making request to: ${url}`);
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`MCUBE API error (${response.status}): ${errorText}`);
        throw new Error(`MCUBE API error (${response.status}): ${errorText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error('Error calling MCUBE API:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to call MCUBE API');
      throw error;
    }
  }
  
  /**
   * Initiate an outbound call
   */
  async initiateOutboundCall(
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
      
      // This is a placeholder - actual implementation would use the real MCUBE endpoint
      const result = await this.request<{ callId: string }>(
        '/Restmcube-api/outbound-calls', 
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
   * Get recent call logs
   */
  async getCallLogs(limit: number = 10): Promise<McubeCallData[]> {
    // This would normally fetch from the API
    // For now, return mock data since we're removing VAPI integration
    
    // Check cache first
    const cacheKey = `call_logs_${limit}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    
    // Mock data for UI development
    const mockData: McubeCallData[] = Array(limit).fill(null).map((_, index) => ({
      callId: `call-${Date.now()}-${index}`,
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
  async getCallDetails(callId: string): Promise<McubeCallData | null> {
    // This would normally fetch from the API
    // For now, return mock data since we're removing VAPI integration
    
    // Check cache first
    const cacheKey = `call_details_${callId}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    
    // Mock a single call detail
    const mockDetail: McubeCallData = {
      callId,
      startTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      endTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      duration: Math.floor(Math.random() * 600),
      agentName: ['John Doe', 'Jane Smith', 'Mike Johnson'][Math.floor(Math.random() * 3)],
      agentPhone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      customerPhone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      direction: Math.random() > 0.5 ? 'inbound' : 'outbound',
      status: ['completed', 'missed', 'busy', 'failed', 'no-answer'][Math.floor(Math.random() * 5)],
      recordingUrl: Math.random() > 0.3 ? `https://example.com/recordings/${callId}.wav` : undefined,
      notes: "This is a mock call detail entry since VAPI integration has been removed."
    };
    
    // Store in cache
    cache[cacheKey] = mockDetail;
    
    return mockDetail;
  }
}

export const mcubeService = new McubeService();
export default mcubeService;
