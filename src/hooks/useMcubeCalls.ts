
import { useState, useEffect, useCallback } from 'react';
import { mcubeService, CallRecord, CallFilters } from '@/services/mcube';
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
    totalTalkTime: 0,
    uniqueContacts: 0,
    sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
    topKeywords: [] as { text: string; value: number }[],
    monthlyData: [] as { month: string; calls: number }[],
    admissionsInquiries: 0
  });

  // Function to fetch calls
  const fetchCalls = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get calls from the service with any filters
      const callData = mcubeService.getCalls(filters);
      
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
      
      if (response.success) {
        toast.success('Call initiated successfully');
        // Refresh calls after initiating
        fetchCalls();
        return response;
      } else {
        toast.error(response.message || 'Failed to initiate call');
        throw new Error(response.message || 'Failed to initiate call');
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
    // Total calls
    const totalCalls = callData.length;
    
    // Total talk time (in seconds)
    const totalTalkTime = callData.reduce((total, call) => total + (call.duration || 0), 0);
    
    // Unique contacts
    const uniqueContacts = new Set(callData.map(call => call.customerPhone)).size;
    
    // Sentiment distribution
    const sentimentDistribution = {
      positive: callData.filter(call => call.sentiment?.toLowerCase() === 'positive').length,
      neutral: callData.filter(call => !call.sentiment || call.sentiment.toLowerCase() === 'neutral').length,
      negative: callData.filter(call => call.sentiment?.toLowerCase() === 'negative').length
    };
    
    // Count keywords
    const keywordCounts = new Map<string, number>();
    callData.forEach(call => {
      call.keywords?.forEach(keyword => {
        const count = keywordCounts.get(keyword) || 0;
        keywordCounts.set(keyword, count + 1);
      });
    });
    
    // Sort keywords by count
    const topKeywords = Array.from(keywordCounts.entries())
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    
    // Group calls by month
    const monthlyCallMap = new Map<string, number>();
    callData.forEach(call => {
      const date = new Date(call.startTime);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const count = monthlyCallMap.get(monthYear) || 0;
      monthlyCallMap.set(monthYear, count + 1);
    });
    
    // Sort months chronologically
    const monthlyData = Array.from(monthlyCallMap.entries())
      .map(([month, calls]) => ({ month, calls }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    // Count admissions inquiries (based on keywords)
    const admissionKeywords = ['admission', 'enroll', 'application', 'apply'];
    const admissionsInquiries = callData.filter(call => {
      // Check transcription and keywords for admission-related terms
      const transcriptionText = call.transcription?.toLowerCase() || '';
      return (
        admissionKeywords.some(keyword => transcriptionText.includes(keyword)) ||
        call.keywords?.some(keyword => 
          admissionKeywords.some(admissionKeyword => 
            keyword.toLowerCase().includes(admissionKeyword)
          )
        )
      );
    }).length;
    
    setStats({
      totalCalls,
      totalTalkTime,
      uniqueContacts,
      sentimentDistribution,
      topKeywords,
      monthlyData,
      admissionsInquiries
    });
  }, []);

  // Subscribe to real-time updates from the MCUBE service
  useEffect(() => {
    if (!autoFetch) return;
    
    // Initial fetch
    fetchCalls();
    
    // Subscribe to call updates
    const unsubscribe = mcubeService.subscribeToCallUpdates((updatedCalls) => {
      setCalls(updatedCalls);
      calculateStats(updatedCalls);
      
      if (onDataUpdate) {
        onDataUpdate(updatedCalls);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [autoFetch, fetchCalls, calculateStats, onDataUpdate]);

  // Update selected call when ID changes
  useEffect(() => {
    if (selectedCallId) {
      const call = mcubeService.getCallById(selectedCallId);
      setSelectedCall(call || null);
    } else {
      setSelectedCall(null);
    }
  }, [selectedCallId, calls]);

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
