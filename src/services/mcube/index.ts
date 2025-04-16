
import { McubeInboundCall, McubeOutboundCallRequest, McubeOutboundCallResponse, CallRecord, CallFilters } from './types';
import { toast } from 'sonner';

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
   * This method would be called by a backend API endpoint that processes incoming MCUBE webhooks
   */
  public processInboundCall(callData: McubeInboundCall): CallRecord {
    console.log('Processing inbound call data:', callData);
    
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
   * Make an outbound call using the MCUBE API
   * Following the format from documentation:
   * curl --location 'https://api.mcube.com/Restmcube-api/outbound-calls' \
   * --header 'Content-Type: application/json' \
   * --data '{
   *     "HTTP_AUTHORIZATION":"Token",
   *     "exenumber": "Executive Number",
   *     "custnumber": "Customer Number",
   *     "refurl": "https://api.mcube.com/Restmcube-api/outbound-calls"
   * }'
   */
  public async makeOutboundCall(
    agentPhone: string, 
    customerPhone: string, 
    refId?: string
  ): Promise<McubeOutboundCallResponse> {
    try {
      if (!this.token) {
        throw new Error('MCUBE API token not set. Please set a valid token first.');
      }
      
      if (!agentPhone || !customerPhone) {
        throw new Error('Agent phone and customer phone are required.');
      }
      
      console.log(`Initiating outbound call from ${agentPhone} to ${customerPhone}`);
      
      // Prepare request payload according to MCUBE API documentation
      const payload: McubeOutboundCallRequest = {
        HTTP_AUTHORIZATION: this.token,
        exenumber: agentPhone,
        custnumber: customerPhone,
        refurl: `${MCUBE_API_BASE_URL}/outbound-calls`, // This should be your callback URL
        refid: refId
      };

      // In production, make the actual API call
      // For now, we'll use a conditional to determine if we're in development mode
      if (process.env.NODE_ENV === 'production') {
        try {
          const response = await fetch(`${MCUBE_API_BASE_URL}/outbound-calls`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`MCUBE API error: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log('MCUBE outbound call response:', data);
          
          // Create a call record from the response
          if (data.success) {
            const callId = data.callId || `mcube-${Date.now()}`;
            const startTime = new Date().toISOString();
            
            const callRecord: CallRecord = {
              id: callId,
              startTime,
              direction: 'outbound',
              status: 'INITIATED',
              agentPhone,
              customerPhone,
              duration: 0,
            };
            
            // Store the call
            this.storeCall(callRecord);
            this.notifyListeners();
            
            return {
              success: true,
              callId,
              status: 'INITIATED',
              message: 'Call initiated successfully'
            };
          } else {
            throw new Error(data.message || 'Failed to initiate call');
          }
        } catch (error) {
          console.error('Error making MCUBE API call:', error);
          throw error;
        }
      } else {
        // Development mode - simulate successful call
        console.log('DEV MODE: Simulating outbound call with payload:', payload);
        
        // Simulate API call with a mock response
        const callId = `mock-${Date.now()}`;
        const startTime = new Date().toISOString();
        
        // Create a mock call record
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
        
        // Simulate a call in progress and then completion
        setTimeout(() => {
          const updatedCall: CallRecord = {
            ...mockCallRecord,
            status: 'ANSWER',
            duration: 15, // 15 seconds
            endTime: new Date(new Date(startTime).getTime() + 15000).toISOString(),
            sentiment: Math.random() > 0.3 ? 'Positive' : 'Neutral',
            disconnectedBy: Math.random() > 0.5 ? 'Agent' : 'Customer',
          };
          
          this.storeCall(updatedCall);
          this.notifyListeners();
          
          // Show toast notification
          toast.success('Call completed successfully');
          
        }, 15000); // After 15 seconds
        
        // Notify listeners immediately with initial call data
        this.notifyListeners();
        
        return {
          success: true,
          callId,
          status: 'INITIATED',
          message: 'Call initiated successfully (DEVELOPMENT MODE)'
        };
      }
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
