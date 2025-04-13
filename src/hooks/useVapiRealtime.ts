
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
}

export function useVapiRealtime<T = any>(options: UseVapiRealtimeOptions = {}) {
  const {
    assistantId,
    fetchInterval = 30000, // Default to 30 seconds
    initialFetchDelay = 0,
    onDataUpdate,
    enabled = true,
    retryLimit = 3,
    retryDelay = 5000 // 5 seconds
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const intervalRef = useRef<number | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  // Function to fetch data from VAPI
  const fetchData = useCallback(async (force = false) => {
    if (!enabled || !isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      
      // Only clear error if this is a fresh attempt, not a retry
      if (retryCount === 0) {
        setError(null);
      }
      
      // Get the assistant ID from options or from localStorage/service
      // Use the provided ID first, fall back to the one from vapiService or localStorage
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
        return;
      }

      console.log("Fetching call data with assistant ID:", id);

      // Get call data from VAPI using the updated service method
      const callData = await vapiService.getCallAnalysis({
        assistantId: id,
        limit: 100,
      });

      if (!isMountedRef.current) return;

      console.log("Call data received:", callData);

      // Reset retry count on successful fetch
      setRetryCount(0);
      
      // Update state with new data
      setData(callData as unknown as T);
      setIsConnected(true);
      lastFetchTimeRef.current = now;
      
      // Call the onDataUpdate callback if provided
      if (onDataUpdate && callData) {
        onDataUpdate(callData);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      
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
            fetchData(true); // Force fetch on retry
          }
        }, retryDelay);
      } else {
        // Only show toast if this is the last retry attempt and not the initial fetch
        if (lastFetchTimeRef.current > 0) {
          toast.error("Lost connection to VAPI. Please try refreshing the page.");
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [assistantId, enabled, fetchInterval, onDataUpdate, retryCount, retryLimit, retryDelay]);

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
