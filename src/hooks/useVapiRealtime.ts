
import { useState, useEffect, useRef, useCallback } from 'react';
import { vapiService } from '@/services/vapiService';
import { toast } from 'sonner';

interface UseVapiRealtimeOptions {
  assistantId?: string;
  fetchInterval?: number; // in milliseconds
  initialFetchDelay?: number; // in milliseconds
  onDataUpdate?: (data: any) => void;
  enabled?: boolean;
  retryLimit?: number;
  retryDelay?: number; // in milliseconds
  endpoint?: string; // Optional endpoint override
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export function useVapiRealtime<T = any>(options: UseVapiRealtimeOptions = {}) {
  const {
    assistantId,
    fetchInterval = 30000, // Default to 30 seconds
    initialFetchDelay = 0,
    onDataUpdate,
    enabled = true,
    retryLimit = 3,
    retryDelay = 5000, // 5 seconds
    endpoint,
    limit = 100,
    startDate,
    endDate
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const intervalRef = useRef<number | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const connectionAttemptsRef = useRef<number>(0);
  const fetchInProgressRef = useRef<boolean>(false);

  // Function to fetch data from VAPI
  const fetchData = useCallback(async (force = false) => {
    if (!enabled || !isMountedRef.current || fetchInProgressRef.current) return;
    
    // Set fetch in progress to prevent concurrent calls
    fetchInProgressRef.current = true;
    
    try {
      setIsLoading(true);
      
      // Only clear error if this is a fresh attempt, not a retry
      if (retryCount === 0) {
        setError(null);
      }
      
      // Get the assistant ID from options or from localStorage/service
      const id = assistantId || vapiService.getAssistantId() || "b6860fc3-a9da-4741-83ce-cb07c5725486";
      
      if (!id) {
        throw new Error("Assistant ID not found. Please check your configuration.");
      }

      // Calculate time since last fetch
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;
      
      // If we're fetching too frequently and this isn't a forced fetch, skip this fetch
      if (!force && lastFetchTimeRef.current > 0 && timeSinceLastFetch < fetchInterval * 0.8) {
        console.log(`Skipping fetch: last fetch was ${timeSinceLastFetch}ms ago`);
        setIsLoading(false);
        fetchInProgressRef.current = false;
        return;
      }

      console.log("Fetching VAPI data with assistant ID:", id, endpoint ? `(endpoint: ${endpoint})` : "");

      // Use the correct query parameter structure based on documentation
      const params: any = {
        assistantId: id,
        limit: limit,
      };
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      // If an endpoint is specified, use it for specialized API calls
      let callData;
      if (endpoint === 'logs') {
        callData = await vapiService.getLogs(params);
      } else {
        callData = await vapiService.getCallAnalysis(params);
      }

      if (!isMountedRef.current) {
        fetchInProgressRef.current = false;
        return;
      }

      console.log("Data received from VAPI:", callData);

      // Reset retry count on successful fetch
      setRetryCount(0);
      connectionAttemptsRef.current = 0;
      
      // Update state with new data
      setData(callData as unknown as T);
      setIsConnected(true);
      lastFetchTimeRef.current = now;
      
      // Call the onDataUpdate callback if provided
      if (onDataUpdate && callData) {
        onDataUpdate(callData);
      }
    } catch (err) {
      if (!isMountedRef.current) {
        fetchInProgressRef.current = false;
        return;
      }
      
      console.error("Error fetching real-time data from VAPI:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch VAPI data'));
      setIsConnected(false);
      
      // Implement retry logic
      if (retryCount < retryLimit) {
        const nextRetryCount = retryCount + 1;
        setRetryCount(nextRetryCount);
        
        console.log(`Retry attempt ${nextRetryCount}/${retryLimit} in ${retryDelay}ms`);
        
        // Schedule retry
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchInProgressRef.current = false;
            fetchData(true); // Force fetch on retry
          }
        }, retryDelay);
      } else {
        // Track connection attempts to avoid spamming the user with error messages
        connectionAttemptsRef.current += 1;
        
        // Only show toast if this is the last retry attempt and not the initial fetch,
        // and limit frequency of error messages
        if (lastFetchTimeRef.current > 0 && connectionAttemptsRef.current <= 3) {
          toast.error("Lost connection to VAPI. Please try refreshing the page.");
        }
        
        // Reset retry count after a while to allow future retry attempts
        setTimeout(() => {
          if (isMountedRef.current) {
            setRetryCount(0);
            fetchInProgressRef.current = false;
          }
        }, fetchInterval * 2);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        
        // Only mark fetch as complete if we're not in a retry cycle
        if (retryCount >= retryLimit || retryCount === 0) {
          fetchInProgressRef.current = false;
        }
      }
    }
  }, [assistantId, enabled, fetchInterval, onDataUpdate, retryCount, retryLimit, retryDelay, endpoint, limit, startDate, endDate]);

  // Start the polling
  useEffect(() => {
    isMountedRef.current = true;
    
    if (!enabled) return;
    
    // Initial fetch with optional delay
    const initialFetchTimeout = setTimeout(() => {
      fetchData();
    }, initialFetchDelay);

    // Set up the interval for subsequent fetches
    intervalRef.current = window.setInterval(() => fetchData(), fetchInterval);

    // Clean up
    return () => {
      isMountedRef.current = false;
      clearTimeout(initialFetchTimeout);
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, fetchInterval, initialFetchDelay, fetchData]);

  // Method to manually trigger a fetch
  const refetch = useCallback(() => {
    setRetryCount(0); // Reset retry count on manual refetch
    connectionAttemptsRef.current = 0; // Reset connection attempts
    return fetchData(true); // Force fetch
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    isConnected,
    refetch,
    retryCount
  };
}
