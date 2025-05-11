
import { useState, useEffect, useCallback } from 'react';
import { mcubeService, CallRecord, CallFilters } from '../services/mcube';
import { toast } from 'sonner';

interface UseMcubeCallsOptions {
  filters?: CallFilters;
  autoFetch?: boolean;
  onDataUpdate?: (calls: CallRecord[]) => void;
  onError?: (error: Error) => void;
}

export function useMcubeCalls(options: UseMcubeCallsOptions = {}) {
  const { filters, autoFetch = true, onDataUpdate, onError } = options;
  
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Stats derived from call data
  const [stats, setStats] = useState({
    totalCalls: 0,
    inboundCalls: 0,
    outboundCalls: 0,
    totalTalkTime: 0,
    avgCallDuration: 0,
    callsByStatus: {} as Record<string, number>,
    callsByGroup: {} as Record<string, number>,
    sentimentDistribution: {
      positive: 0,
      neutral: 0,
      negative: 0
    }
  });

  // Function to fetch calls
  const fetchCalls = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get calls from the service with any filters
      // Fix: Don't directly assign the Promise to state
      const callData = await mcubeService.getCalls(filters);
      setCalls(callData);
      
      // Call the onDataUpdate callback if provided
      if (onDataUpdate) {
        onDataUpdate(callData);
      }
      
      // Calculate stats from the calls
      calculateStats(callData);
      
    } catch (err) {
      console.error('Error fetching calls:', err);
      const error = err instanceof Error ? err : new Error('Failed to fetch calls');
      setError(error);
      
      if (onError) {
        onError(error);
      } else {
        toast.error('Failed to fetch call data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, onDataUpdate, onError]);

  // Make an outbound call
  const makeCall = useCallback(async (
    agentPhone: string,
    customerPhone: string,
    refId?: string
  ) => {
    try {
      setIsLoading(true);
      
      const response = await mcubeService.makeOutboundCall(agentPhone, customerPhone, refId);
      
      // Fix: Check for success property using optional chaining
      if (response?.success) {
        toast.success('Call initiated successfully');
        // Refresh calls after initiating
        fetchCalls();
        return response;
      } else {
        // Fix: Check for message property using optional chaining
        toast.error(response?.message || 'Failed to initiate call');
        throw new Error(response?.message || 'Failed to initiate call');
      }
    } catch (err) {
      console.error('Error making call:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to make call: Unknown error';
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCalls]);

  // Calculate stats from call data
  const calculateStats = useCallback((callData: CallRecord[]) => {
    if (!callData.length) {
      setStats({
        totalCalls: 0,
        inboundCalls: 0,
        outboundCalls: 0,
        totalTalkTime: 0,
        avgCallDuration: 0,
        callsByStatus: {},
        callsByGroup: {},
        sentimentDistribution: { positive: 0, neutral: 0, negative: 0 }
      });
      return;
    }

    const totalCalls = callData.length;
    const inboundCalls = callData.filter(call => call.direction === 'inbound').length;
    const outboundCalls = callData.filter(call => call.direction === 'outbound').length;
    
    // Total talk time (in seconds)
    const totalTalkTime = callData.reduce((total, call) => total + (call.duration || 0), 0);
    
    // Average call duration
    const avgCallDuration = totalCalls > 0 ? totalTalkTime / totalCalls : 0;
    
    // Count calls by status
    const callsByStatus = callData.reduce((acc, call) => {
      const status = call.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Count calls by group
    const callsByGroup = callData.reduce((acc, call) => {
      const group = call.groupName || 'Unknown';
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Sentiment distribution
    const sentimentDistribution = {
      positive: callData.filter(call => call.sentiment?.toLowerCase() === 'positive').length,
      neutral: callData.filter(call => !call.sentiment || call.sentiment.toLowerCase() === 'neutral').length,
      negative: callData.filter(call => call.sentiment?.toLowerCase() === 'negative').length
    };
    
    setStats({
      totalCalls,
      inboundCalls,
      outboundCalls,
      totalTalkTime,
      avgCallDuration,
      callsByStatus,
      callsByGroup,
      sentimentDistribution
    });
  }, []);

  // Subscribe to real-time updates from the MCUBE service
  useEffect(() => {
    if (!autoFetch) return;
    
    // Initial fetch
    fetchCalls();
    
    // Fix: Create a simple polling mechanism instead of using subscriptions
    // since subscribeToCallUpdates doesn't exist
    const intervalId = setInterval(() => {
      fetchCalls();
    }, 30000); // Poll every 30 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [autoFetch, fetchCalls]);

  // Update selected call when ID changes
  useEffect(() => {
    const getSelectedCall = async () => {
      if (selectedCallId) {
        try {
          // Fix: Don't directly assign Promise to state
          const call = await mcubeService.getCallById(selectedCallId);
          setSelectedCall(call);
        } catch (err) {
          console.error('Error fetching selected call:', err);
          setSelectedCall(null);
        }
      } else {
        setSelectedCall(null);
      }
    };
    
    getSelectedCall();
  }, [selectedCallId]);

  return {
    calls,
    stats,
    isLoading,
    error,
    fetchCalls,
    makeCall,
    selectedCall,
    selectedCallId,
    setSelectedCallId
  };
}
