
import { McubeInboundCall, McubeOutboundCallRequest, McubeOutboundCallResponse, CallRecord, CallFilters } from './types';

// Constants
const MCUBE_API_BASE_URL = 'https://api.mcube.com/Restmcube-api';
const MCUBE_TOKEN = 'your-mcube-token'; // Retrieve from environment or secure storage

/**
 * MCube Service for handling inbound and outbound calls
 */
export class McubeService {
  private static instance: McubeService;
  private token: string = '';
  private calls: CallRecord[] = [];
  private listeners: ((calls: CallRecord[]) => void)[] = [];

  private constructor() {
    // Initialize with token
    this.token = MCUBE_TOKEN;
    
    // Load mock data for development
    this.loadMockData();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): McubeService {
    if (!McubeService.instance) {
      McubeService.instance = new McubeService();
    }
    return McubeService.instance;
  }

  /**
   * Set the authentication token
   */
  public setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get the current authentication token
   */
  public getToken(): string {
    return this.token;
  }

  /**
   * Process an inbound call from webhook
   */
  public processInboundCall(callData: McubeInboundCall): CallRecord {
    // Convert McubeInboundCall to our standard CallRecord format
    const callRecord: CallRecord = {
      id: callData.callid,
      startTime: callData.starttime,
      endTime: callData.endtime,
      direction: callData.direction.toLowerCase() as 'inbound' | 'outbound',
      status: callData.dialstatus,
      agentPhone: callData.emp_phone,
      agentName: callData.agentname,
      customerPhone: callData.callto,
      recordingUrl: callData.filename,
      disconnectedBy: callData.disconnectedby,
      groupName: callData.groupname,
      // Calculate duration if both start and end times are available
      duration: this.calculateDuration(callData.starttime, callData.endtime),
      // These fields will be populated separately or through analysis
      sentiment: 'Neutral',
      keywords: [],
      transcription: '',
    };

    // Add call to our local storage
    this.storeCall(callRecord);
    
    // Notify listeners
    this.notifyListeners();
    
    return callRecord;
  }

  /**
   * Make an outbound call
   */
  public async makeOutboundCall(
    agentPhone: string, 
    customerPhone: string, 
    refId?: string
  ): Promise<McubeOutboundCallResponse> {
    try {
      // Prepare request payload
      const payload: McubeOutboundCallRequest = {
        HTTP_AUTHORIZATION: this.token,
        exenumber: agentPhone,
        custnumber: customerPhone,
        refurl: `${MCUBE_API_BASE_URL}/callback`, // This should be your callback URL
        refid: refId
      };

      // In production, this would make an actual API call
      // For now, we'll simulate a response
      console.log('Making outbound call with payload:', payload);
      
      // Simulate API call (in production, use actual fetch or axios call)
      // const response = await fetch(`${MCUBE_API_BASE_URL}/outbound-calls`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(payload),
      // });
      // return await response.json();
      
      // For simulation, create a mock call record
      const callId = `mock-${Date.now()}`;
      const startTime = new Date().toISOString();
      
      const mockCallRecord: CallRecord = {
        id: callId,
        startTime,
        direction: 'outbound',
        status: 'INITIATED',
        agentPhone,
        customerPhone,
        duration: 0,
      };
      
      // Store the mock call
      this.storeCall(mockCallRecord);
      
      // Notify listeners
      this.notifyListeners();
      
      return {
        success: true,
        callId,
        status: 'INITIATED',
        message: 'Call initiated successfully'
      };
    } catch (error) {
      console.error('Error making outbound call:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to initiate call'
      };
    }
  }

  /**
   * Get all call records with optional filtering
   */
  public getCalls(filters?: CallFilters): CallRecord[] {
    let filteredCalls = [...this.calls];
    
    if (filters) {
      if (filters.agentPhone) {
        filteredCalls = filteredCalls.filter(call => call.agentPhone === filters.agentPhone);
      }
      
      if (filters.direction) {
        filteredCalls = filteredCalls.filter(call => call.direction === filters.direction);
      }
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredCalls = filteredCalls.filter(call => new Date(call.startTime) >= startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filteredCalls = filteredCalls.filter(call => new Date(call.startTime) <= endDate);
      }
      
      if (filters.limit && filters.limit > 0) {
        filteredCalls = filteredCalls.slice(0, filters.limit);
      }
    }
    
    // Sort by start time (newest first)
    return filteredCalls.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  /**
   * Get a specific call by ID
   */
  public getCallById(callId: string): CallRecord | undefined {
    return this.calls.find(call => call.id === callId);
  }

  /**
   * Subscribe to call updates
   */
  public subscribeToCallUpdates(callback: (calls: CallRecord[]) => void): () => void {
    this.listeners.push(callback);
    
    // Immediately provide current data
    callback(this.calls);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Store a call record
   */
  private storeCall(call: CallRecord): void {
    // Check if call already exists (update it) or add new
    const existingIndex = this.calls.findIndex(c => c.id === call.id);
    
    if (existingIndex >= 0) {
      // Update existing call
      this.calls[existingIndex] = { ...this.calls[existingIndex], ...call };
    } else {
      // Add new call
      this.calls.push(call);
    }
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getCalls()));
  }

  /**
   * Calculate duration between two timestamps in seconds
   */
  private calculateDuration(start: string, end?: string): number {
    if (!end) return 0;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  }

  /**
   * Load mock data for development purposes
   */
  private loadMockData(): void {
    const mockCalls: CallRecord[] = [
      {
        id: 'mock-1',
        startTime: '2025-04-15T10:30:00Z',
        endTime: '2025-04-15T10:45:00Z',
        duration: 900,
        direction: 'inbound',
        status: 'ANSWER',
        agentPhone: '8767316316',
        agentName: 'John Doe',
        customerPhone: '7816999444',
        recordingUrl: 'https://example.com/recording-1.wav',
        disconnectedBy: 'Customer',
        groupName: 'Integration',
        sentiment: 'Positive',
        transcription: 'This is a mock transcription of a positive call about enrollment.',
        keywords: ['enrollment', 'application', 'deadline'],
        contactName: 'Sarah Student',
        companyName: 'State University',
        success: true
      },
      {
        id: 'mock-2',
        startTime: '2025-04-15T11:15:00Z',
        endTime: '2025-04-15T11:20:00Z',
        duration: 300,
        direction: 'outbound',
        status: 'ANSWER',
        agentPhone: '8767316316',
        agentName: 'John Doe',
        customerPhone: '5551234567',
        recordingUrl: 'https://example.com/recording-2.wav',
        disconnectedBy: 'Agent',
        groupName: 'Outreach',
        sentiment: 'Neutral',
        transcription: 'This is a mock transcription about financial aid information.',
        keywords: ['financial aid', 'scholarship', 'FAFSA'],
        contactName: 'Michael Applicant',
        companyName: 'High School',
        success: true
      },
      {
        id: 'mock-3',
        startTime: '2025-04-16T09:00:00Z',
        endTime: '2025-04-16T09:05:00Z',
        duration: 300,
        direction: 'inbound',
        status: 'ANSWER',
        agentPhone: '8767316317',
        agentName: 'Jane Smith',
        customerPhone: '5559876543',
        recordingUrl: 'https://example.com/recording-3.wav',
        disconnectedBy: 'Customer',
        groupName: 'Support',
        sentiment: 'Negative',
        transcription: 'This is a mock transcription of a complaint about application process.',
        keywords: ['application', 'problem', 'website'],
        contactName: 'Chris Parent',
        companyName: 'Parent Association',
        success: false
      }
    ];
    
    // Add mock calls to our storage
    mockCalls.forEach(call => this.storeCall(call));
  }
}

// Export a singleton instance
export const mcubeService = McubeService.getInstance();

// Export types for easier access
export * from './types';
