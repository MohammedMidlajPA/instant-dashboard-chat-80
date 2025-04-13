
import { useState, useEffect, useRef } from 'react';
import { vapiService } from '@/services/vapiService';
import { toast } from 'sonner';

interface UseVapiRealtimeOptions {
  assistantId?: string;
  fetchInterval?: number; // in milliseconds
  initialFetchDelay?: number; // in milliseconds
  onDataUpdate?: (data: any) => void;
  enabled?: boolean;
}

export function useVapiRealtime<T = any>(options: UseVapiRealtimeOptions = {}) {
  const {
    assistantId,
    fetchInterval = 30000, // Default to 30 seconds
    initialFetchDelay = 0,
    onDataUpdate,
    enabled = true
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  // Function to fetch data from VAPI
  const fetchData = async () => {
    if (!enabled) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the assistant ID from options or from the service
      const id = assistantId || vapiService.getAssistantId();
      
      if (!id) {
        throw new Error("Assistant ID not found. Please check your configuration.");
      }

      // Calculate time since last fetch
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;
      
      // If we're fetching too frequently, skip this fetch
      if (lastFetchTimeRef.current > 0 && timeSinceLastFetch < fetchInterval * 0.8) {
        console.log(`Skipping fetch: last fetch was ${timeSinceLastFetch}ms ago`);
        setIsLoading(false);
        return;
      }

      // Get call data from VAPI using the updated endpoint format for call analysis
      const callData = await vapiService.getCallAnalysis({
        assistantId: id,
        limit: 100,
      });

      // Update state with new data
      setData(callData as unknown as T);
      setIsConnected(true);
      lastFetchTimeRef.current = now;
      
      // Call the onDataUpdate callback if provided
      if (onDataUpdate && callData) {
        onDataUpdate(callData);
      }
    } catch (err) {
      console.error("Error fetching real-time data from VAPI:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch VAPI data'));
      setIsConnected(false);
      
      // Only show toast if this is not the initial fetch
      if (lastFetchTimeRef.current > 0) {
        toast.error("Lost connection to VAPI. Attempting to reconnect...");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Start the polling
  useEffect(() => {
    if (!enabled) return;
    
    // Initial fetch with optional delay
    const initialFetchTimeout = setTimeout(() => {
      fetchData();
    }, initialFetchDelay);

    // Set up the interval for subsequent fetches
    intervalRef.current = window.setInterval(fetchData, fetchInterval);

    // Clean up
    return () => {
      clearTimeout(initialFetchTimeout);
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, fetchInterval, assistantId]);

  // Method to manually trigger a fetch
  const refetch = () => {
    fetchData();
  };

  return {
    data,
    isLoading,
    error,
    isConnected,
    refetch
  };
}
