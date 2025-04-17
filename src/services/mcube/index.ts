
import { 
  McubeInboundCall, 
  McubeOutboundCallRequest, 
  McubeOutboundCallResponse, 
  CallRecord, 
  CallFilters,
  CallCampaign,
  SyntheonAnalysisRequest,
  SyntheonAnalysisResponse
} from './types';
import { toast } from 'sonner';

// Constants
const MCUBE_API_BASE_URL = 'https://api.mcube.com/Restmcube-api';
const MCUBE_TOKEN_KEY = 'mcube_api_token';
const SYNTHEON_API_BASE_URL = 'https://api.syntheon.ai';

/**
 * MCube Service for handling inbound and outbound calls
 */
class McubeService {
  private token: string | null = null;
  private calls: CallRecord[] = [];
  private campaigns: CallCampaign[] = [];
  private listeners: ((calls: CallRecord[]) => void)[] = [];
  private campaignListeners: ((campaigns: CallCampaign[]) => void)[] = [];

  constructor() {
    // Initialize with token from storage
    this.token = localStorage.getItem(MCUBE_TOKEN_KEY);
    
    // Load mock data for development
    this.loadMockData();
  }

  /**
   * Set the authentication token
   */
  public setToken(token: string): void {
    this.token = token;
    localStorage.setItem(MCUBE_TOKEN_KEY, token);
    toast.success('MCUBE API token has been set');
  }

  /**
   * Get the current authentication token
   */
  public getToken(): string | null {
    return this.token;
  }

  /**
   * Clear the authentication token
   */
  public clearToken(): void {
    this.token = null;
    localStorage.removeItem(MCUBE_TOKEN_KEY);
    toast.info('MCUBE API token has been cleared');
  }

  /**
   * Process an inbound call from webhook
   * This would be called by a backend API endpoint that processes MCUBE webhooks
   */
  public processInboundCall(callData: McubeInboundCall): CallRecord {
    console.log('Processing inbound call data:', callData);
    
    // Convert McubeInboundCall to our standard CallRecord format
    const callRecord: CallRecord = {
      id: callData.callid,
      startTime: callData.starttime,
      startedAt: callData.starttime,
      call_date: callData.starttime,
      endTime: callData.endtime,
      direction: callData.direction.toLowerCase() as 'inbound' | 'outbound',
      status: callData.dialstatus,
      agentPhone: callData.emp_phone,
      agentName: callData.agentname,
      contact_name: "Unknown Caller", // Default value
      customerPhone: callData.callto,
      didNumber: callData.clicktocalldid,
      recordingUrl: callData.filename,
      recording_url: callData.filename,
      disconnectedBy: callData.disconnectedby,
      answeredTime: callData.answeredtime,
      groupName: callData.groupname,
      // Calculate duration if both start and end times are available
      duration: this.calculateDuration(callData.starttime, callData.endtime),
      // These fields will be populated separately or through analysis
      sentiment: 'Neutral',
      keywords: [],
      transcription: '',
      transcript: '',
    };

    // Add call to our local storage
    this.storeCall(callRecord);
    
    // Notify listeners
    this.notifyListeners();
    
    return callRecord;
  }

  /**
   * Make an outbound call using the MCUBE API
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
        refurl: `${window.location.origin}/api/mcube-callback`, // This should be your callback URL
        refid: refId
      };

      // In production, make the actual API call
      // For development, we'll simulate a successful call
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
              startedAt: startTime,
              call_date: startTime,
              direction: 'outbound',
              status: 'INITIATED',
              agentPhone,
              customerPhone,
              contact_name: "Unknown",
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
          startedAt: startTime,
          call_date: startTime,
          direction: 'outbound',
          status: 'INITIATED',
          agentPhone,
          customerPhone,
          contact_name: "Unknown",
          duration: 0,
        };
        
        // Store the mock call
        this.storeCall(mockCallRecord);
        
        // Simulate a call in progress and then completion
        setTimeout(() => {
          const updatedCall: CallRecord = {
            ...mockCallRecord,
            status: 'ANSWER',
            duration: 45, // 45 seconds
            endTime: new Date(new Date(startTime).getTime() + 45000).toISOString(),
            sentiment: Math.random() > 0.3 ? 'Positive' : 'Neutral',
            disconnectedBy: Math.random() > 0.5 ? 'Agent' : 'Customer',
            recordingUrl: 'https://example.com/mock-recording.wav',
            recording_url: 'https://example.com/mock-recording.wav',
          };
          
          this.storeCall(updatedCall);
          this.notifyListeners();
          
          // Show toast notification
          toast.success('Call completed successfully');
          
          // Simulate Syntheon.ai analysis after call
          setTimeout(() => {
            this.analyzeSyntheonCall(callId);
          }, 2000);
          
        }, 5000); // After 5 seconds
        
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
      
      if (filters.status) {
        filteredCalls = filteredCalls.filter(call => call.status === filters.status);
      }
      
      if (filters.groupName) {
        filteredCalls = filteredCalls.filter(call => call.groupName === filters.groupName);
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
  public getCallById(callId: string): CallRecord | null {
    return this.calls.find(call => call.id === callId) || null;
  }

  /**
   * Request Syntheon.ai analysis for a call
   */
  public async analyzeSyntheonCall(callId: string): Promise<CallRecord | null> {
    const call = this.getCallById(callId);
    if (!call || !call.recordingUrl) {
      console.error('Cannot analyze call: missing call data or recording URL');
      return null;
    }
    
    try {
      console.log(`Requesting Syntheon.ai analysis for call ${callId}`);
      
      // In production, make the actual API call to Syntheon.ai
      // For now, we'll simulate a response
      
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock Syntheon.ai analysis results
      const scriptAdherence = Math.floor(Math.random() * 30) + 70; // 70-100%
      const deadAirSeconds = Math.floor(Math.random() * 30); // 0-30 seconds
      const deadAirPercentage = Number(((deadAirSeconds / (call.duration || 60)) * 100).toFixed(1));
      const talkSpeed = Math.floor(Math.random() * 50) + 120; // 120-170 wpm
      const interruptionCount = Math.floor(Math.random() * 5); // 0-5
      const questionCount = Math.floor(Math.random() * 10) + 5; // 5-15
      const empathyScore = Math.floor(Math.random() * 40) + 60; // 60-100
      
      const keyInsights = [
        "Customer expressed interest in premium features",
        "Pricing was a key concern during the conversation",
        "Customer mentioned competitor's offering",
        "Follow-up needed on technical specifications"
      ].sort(() => Math.random() - 0.5).slice(0, 3);
      
      // Update call with analysis data
      const updatedCall: CallRecord = {
        ...call,
        analysis: {
          successEvaluation: Math.random() > 0.3,
          success_evaluation: Math.random() > 0.3,
          scriptAdherence,
          deadAirSeconds,
          deadAirPercentage,
          sentimentBreakdown: {
            positive: Math.floor(Math.random() * 60) + 40, // 40-100
            neutral: Math.floor(Math.random() * 40), // 0-40
            negative: Math.floor(Math.random() * 20) // 0-20
          },
          agentMetrics: {
            talkSpeed,
            interruptionCount,
            questionCount,
            empathyScore
          },
          keyInsights
        }
      };
      
      // Store the updated call
      this.storeCall(updatedCall);
      this.notifyListeners();
      
      toast.success('Call analysis completed');
      
      return updatedCall;
    } catch (error) {
      console.error('Error analyzing call with Syntheon.ai:', error);
      toast.error('Failed to analyze call');
      return null;
    }
  }
  
  /**
   * Get call performance metrics across all calls
   */
  public getPerformanceMetrics() {
    const calls = this.getCalls();
    if (calls.length === 0) {
      return {
        averageScriptAdherence: 0,
        averageDeadAirPercentage: 0,
        averageTalkSpeed: 0,
        averageEmpathyScore: 0,
        totalInterruptions: 0,
        callSuccessRate: 0
      };
    }
    
    // Filter calls with analysis data
    const analyzedCalls = calls.filter(call => call.analysis);
    if (analyzedCalls.length === 0) {
      return {
        averageScriptAdherence: 0,
        averageDeadAirPercentage: 0,
        averageTalkSpeed: 0,
        averageEmpathyScore: 0,
        totalInterruptions: 0,
        callSuccessRate: 0
      };
    }
    
    // Calculate metrics
    const averageScriptAdherence = analyzedCalls.reduce((sum, call) => 
      sum + (call.analysis?.scriptAdherence || 0), 0) / analyzedCalls.length;
      
    const averageDeadAirPercentage = analyzedCalls.reduce((sum, call) => 
      sum + (call.analysis?.deadAirPercentage || 0), 0) / analyzedCalls.length;
      
    const averageTalkSpeed = analyzedCalls.reduce((sum, call) => 
      sum + (call.analysis?.agentMetrics?.talkSpeed || 0), 0) / analyzedCalls.length;
      
    const averageEmpathyScore = analyzedCalls.reduce((sum, call) => 
      sum + (call.analysis?.agentMetrics?.empathyScore || 0), 0) / analyzedCalls.length;
      
    const totalInterruptions = analyzedCalls.reduce((sum, call) => 
      sum + (call.analysis?.agentMetrics?.interruptionCount || 0), 0);
      
    const successfulCalls = analyzedCalls.filter(call => 
      call.analysis?.successEvaluation || call.analysis?.success_evaluation).length;
    const callSuccessRate = (successfulCalls / analyzedCalls.length) * 100;
    
    return {
      averageScriptAdherence,
      averageDeadAirPercentage,
      averageTalkSpeed,
      averageEmpathyScore,
      totalInterruptions,
      callSuccessRate
    };
  }

  /**
   * Subscribe to call updates
   */
  public subscribeToCallUpdates(callback: (calls: CallRecord[]) => void): () => void {
    this.listeners.push(callback);
    
    // Immediately provide current data
    callback(this.getCalls());
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Get all campaigns
   */
  public getCampaigns(): CallCampaign[] {
    return [...this.campaigns].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Create a new campaign
   */
  public createCampaign(campaign: Omit<CallCampaign, 'id' | 'createdAt' | 'updatedAt'>): CallCampaign {
    const now = new Date().toISOString();
    const newCampaign: CallCampaign = {
      ...campaign,
      id: `campaign-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    
    this.campaigns.push(newCampaign);
    this.notifyCampaignListeners();
    
    return newCampaign;
  }

  /**
   * Subscribe to campaign updates
   */
  public subscribeToCampaignUpdates(callback: (campaigns: CallCampaign[]) => void): () => void {
    this.campaignListeners.push(callback);
    
    // Immediately provide current data
    callback(this.getCampaigns());
    
    // Return unsubscribe function
    return () => {
      this.campaignListeners = this.campaignListeners.filter(listener => listener !== callback);
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
   * Notify all call listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getCalls()));
  }

  /**
   * Notify all campaign listeners of changes
   */
  private notifyCampaignListeners(): void {
    this.campaignListeners.forEach(listener => listener(this.getCampaigns()));
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
    // Mock call data
    const mockCalls: CallRecord[] = [
      {
        id: 'mcube-1',
        startTime: '2025-04-16T10:30:00Z',
        startedAt: '2025-04-16T10:30:00Z',
        call_date: '2025-04-16T10:30:00Z',
        endTime: '2025-04-16T10:45:00Z',
        duration: 900,
        direction: 'inbound',
        status: 'ANSWER',
        agentPhone: '8767316316',
        agentName: 'John Smith',
        customerPhone: '5551234567',
        contact_name: 'Michael Brown',
        company_name: 'Tech Solutions Inc.',
        didNumber: '8035053336',
        recordingUrl: 'https://example.com/recording-1.wav',
        recording_url: 'https://example.com/recording-1.wav',
        disconnectedBy: 'Customer',
        answeredTime: '00:00:03',
        groupName: 'Inbound',
        sentiment: 'Positive',
        transcription: 'Hello, I need information about your product. Could you please tell me more about the features?',
        transcript: 'Hello, I need information about your product. Could you please tell me more about the features?',
        keywords: ['information', 'product', 'features'],
        inquiry_type: 'Product Information',
        analysis: {
          successEvaluation: true,
          success_evaluation: true,
          scriptAdherence: 92,
          deadAirSeconds: 8,
          deadAirPercentage: 0.9,
          sentimentBreakdown: {
            positive: 75,
            neutral: 20,
            negative: 5
          },
          agentMetrics: {
            talkSpeed: 145,
            interruptionCount: 0,
            questionCount: 8,
            empathyScore: 85
          },
          keyInsights: [
            "Customer interested in premium features",
            "Customer requested pricing information",
            "Follow-up demo requested"
          ]
        }
      },
      {
        id: 'mcube-2',
        startTime: '2025-04-16T11:15:00Z',
        startedAt: '2025-04-16T11:15:00Z',
        call_date: '2025-04-16T11:15:00Z',
        endTime: '2025-04-16T11:25:00Z',
        duration: 600,
        direction: 'outbound',
        status: 'ANSWER',
        agentPhone: '8767316317',
        agentName: 'Jane Williams',
        customerPhone: '5559876543',
        contact_name: 'Sarah Johnson',
        company_name: 'Digital Marketing Group',
        recordingUrl: 'https://example.com/recording-2.wav',
        recording_url: 'https://example.com/recording-2.wav',
        disconnectedBy: 'Agent',
        answeredTime: '00:00:05',
        groupName: 'Autodialer',
        sentiment: 'Neutral',
        transcription: 'I\'m calling to follow up on our previous conversation about our new service offering.',
        transcript: 'I\'m calling to follow up on our previous conversation about our new service offering.',
        keywords: ['follow up', 'service', 'offering'],
        inquiry_type: 'Follow-up',
        analysis: {
          successEvaluation: true,
          success_evaluation: true,
          scriptAdherence: 86,
          deadAirSeconds: 12,
          deadAirPercentage: 2.0,
          sentimentBreakdown: {
            positive: 55,
            neutral: 40,
            negative: 5
          },
          agentMetrics: {
            talkSpeed: 152,
            interruptionCount: 1,
            questionCount: 7,
            empathyScore: 78
          },
          keyInsights: [
            "Customer requested pricing sheet",
            "Mentioned budget constraints",
            "Asked about implementation timeline"
          ]
        }
      },
      {
        id: 'mcube-3',
        startTime: '2025-04-16T14:00:00Z',
        startedAt: '2025-04-16T14:00:00Z',
        call_date: '2025-04-16T14:00:00Z',
        endTime: '2025-04-16T14:02:00Z',
        duration: 120,
        direction: 'inbound',
        status: 'ANSWER',
        agentPhone: '8767316318',
        agentName: 'Robert Johnson',
        customerPhone: '5555551234',
        contact_name: 'Alex Thompson',
        company_name: 'Global Enterprises',
        didNumber: '8035053336',
        recordingUrl: 'https://example.com/recording-3.wav',
        recording_url: 'https://example.com/recording-3.wav',
        disconnectedBy: 'Customer',
        answeredTime: '00:00:02',
        groupName: 'Inbound',
        sentiment: 'Negative',
        transcription: 'I\'ve been waiting for a callback for days. This is unacceptable customer service.',
        transcript: 'I\'ve been waiting for a callback for days. This is unacceptable customer service.',
        keywords: ['waiting', 'callback', 'unacceptable', 'customer service'],
        inquiry_type: 'Complaint',
        analysis: {
          successEvaluation: false,
          success_evaluation: false,
          scriptAdherence: 76,
          deadAirSeconds: 5,
          deadAirPercentage: 4.2,
          sentimentBreakdown: {
            positive: 10,
            neutral: 30,
            negative: 60
          },
          agentMetrics: {
            talkSpeed: 162,
            interruptionCount: 3,
            questionCount: 4,
            empathyScore: 65
          },
          keyInsights: [
            "Customer frustrated about delayed response",
            "Previous rep promised 24-hour callback",
            "Customer threatening to cancel service"
          ]
        }
      },
      {
        id: 'mcube-4',
        startTime: '2025-04-16T16:30:00Z',
        startedAt: '2025-04-16T16:30:00Z',
        call_date: '2025-04-16T16:30:00Z',
        endTime: '2025-04-16T16:40:00Z',
        duration: 600,
        direction: 'outbound',
        status: 'ANSWER',
        agentPhone: '8767316317',
        agentName: 'Jane Williams',
        customerPhone: '5552223333',
        contact_name: 'Mark Davis',
        company_name: 'Innovation Labs',
        recordingUrl: 'https://example.com/recording-4.wav',
        recording_url: 'https://example.com/recording-4.wav',
        disconnectedBy: 'Agent',
        answeredTime: '00:00:04',
        groupName: 'Autodialer',
        sentiment: 'Positive',
        transcription: 'Thank you for your interest in our premium plan. I can help you set that up today.',
        transcript: 'Thank you for your interest in our premium plan. I can help you set that up today.',
        keywords: ['premium', 'plan', 'setup'],
        inquiry_type: 'Sales',
        analysis: {
          successEvaluation: true,
          success_evaluation: true,
          scriptAdherence: 94,
          deadAirSeconds: 6,
          deadAirPercentage: 1.0,
          sentimentBreakdown: {
            positive: 85,
            neutral: 15,
            negative: 0
          },
          agentMetrics: {
            talkSpeed: 138,
            interruptionCount: 0,
            questionCount: 9,
            empathyScore: 92
          },
          keyInsights: [
            "Customer agreed to premium subscription",
            "Setup scheduled for next week",
            "Customer requested email confirmation"
          ]
        }
      },
      {
        id: 'mcube-5',
        startTime: '2025-04-17T09:15:00Z',
        startedAt: '2025-04-17T09:15:00Z',
        call_date: '2025-04-17T09:15:00Z',
        endTime: '2025-04-17T09:20:00Z',
        duration: 300,
        direction: 'inbound',
        status: 'ANSWER',
        agentPhone: '8767316316',
        agentName: 'John Smith',
        customerPhone: '5554443333',
        contact_name: 'Jennifer Chen',
        company_name: 'Pacific Traders',
        didNumber: '8035053336',
        recordingUrl: 'https://example.com/recording-5.wav',
        recording_url: 'https://example.com/recording-5.wav',
        disconnectedBy: 'Agent',
        answeredTime: '00:00:02',
        groupName: 'Inbound',
        sentiment: 'Neutral',
        transcription: 'I\'m calling to check the status of my order #12345. Can you help me with that?',
        transcript: 'I\'m calling to check the status of my order #12345. Can you help me with that?',
        keywords: ['status', 'order', 'check'],
        inquiry_type: 'Support',
        analysis: {
          successEvaluation: true,
          success_evaluation: true,
          scriptAdherence: 89,
          deadAirSeconds: 10,
          deadAirPercentage: 3.3,
          sentimentBreakdown: {
            positive: 45,
            neutral: 50,
            negative: 5
          },
          agentMetrics: {
            talkSpeed: 133,
            interruptionCount: 1,
            questionCount: 6,
            empathyScore: 83
          },
          keyInsights: [
            "Order status provided and confirmed",
            "Customer requested delivery date confirmation",
            "Special handling instructions noted"
          ]
        }
      }
    ];
    
    // Add calls to our storage
    mockCalls.forEach(call => this.storeCall(call));

    // Add mock campaigns
    this.campaigns = [
      {
        id: 'campaign-1',
        name: 'Spring Promotion',
        description: 'Outreach for our spring promotion',
        startDate: '2025-04-15T00:00:00Z',
        endDate: '2025-05-15T00:00:00Z',
        status: 'active',
        contacts: [
          {
            id: 'contact-1',
            name: 'John Doe',
            phoneNumber: '5551234567',
            email: 'john@example.com',
            company: 'ABC Corp',
            status: 'contacted',
            callId: 'mcube-2',
            notes: 'Left a voicemail'
          },
          {
            id: 'contact-2',
            name: 'Jane Smith',
            phoneNumber: '5559876543',
            email: 'jane@example.com',
            company: 'XYZ Inc',
            status: 'pending',
          }
        ],
        script: "Hello, this is [Agent Name] from MCUBE. We're reaching out about our spring promotion...",
        createdAt: '2025-04-10T10:00:00Z',
        updatedAt: '2025-04-10T10:00:00Z',
      }
    ];
  }
}

// Export singleton instance
export const mcubeService = new McubeService();

// Export types for easier access
export * from './types';
