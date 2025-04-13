
import { useState, useEffect } from "react";
import { vapiService } from "@/services/vapiService";
import { toast } from "sonner";

interface Recording {
  id: string;
  contact: string;
  company: string;
  date: string;
  duration: string;
  type: 'Outbound' | 'Inbound';
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  keywords: string[];
}

interface CallRecordingsHookResult {
  recordings: Recording[];
  isLoading: boolean;
  error: Error | null;
  fetchRecordings: () => Promise<void>;
  searchRecordings: (searchTerm: string) => Recording[];
}

interface CallRecordingsHookOptions {
  assistantId?: string;
  limit?: number;
  autoFetch?: boolean;
  placeholder?: Recording[];
}

export const useCallRecordings = (options?: CallRecordingsHookOptions): CallRecordingsHookResult => {
  const {
    assistantId,
    limit = 10,
    autoFetch = true,
    placeholder = []
  } = options || {};

  const [recordings, setRecordings] = useState<Recording[]>(placeholder);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const formatDuration = (seconds: number): string => {
    if (!seconds) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const fetchRecordings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const id = assistantId || vapiService.getAssistantId();
      
      if (!id) {
        throw new Error("Assistant ID not found. Please check your configuration.");
      }

      const callData = await vapiService.getCallAnalysis({
        assistantId: id,
        fetchAll: false,
        limit,
      });

      if (callData && callData.length > 0) {
        const formattedData: Recording[] = callData.map(call => ({
          id: call.id,
          contact: call.contact_name || 'Unknown',
          company: call.company_name || 'College Inquiry',
          date: call.call_date,
          duration: formatDuration(call.duration),
          type: (call.call_type === 'inbound' ? 'Inbound' : 'Outbound') as 'Inbound' | 'Outbound',
          sentiment: (call.sentiment?.charAt(0).toUpperCase() + call.sentiment?.slice(1)) as 'Positive' | 'Neutral' | 'Negative',
          keywords: call.keywords || [],
        }));

        setRecordings(formattedData);
      } else {
        toast.info("No call recordings found. Using placeholder data.");
        setRecordings(placeholder);
      }
    } catch (err) {
      console.error("Error fetching recordings:", err);
      setError(err instanceof Error ? err : new Error('Failed to load call recordings'));
      toast.error("Failed to load call recordings");
      setRecordings(placeholder);
    } finally {
      setIsLoading(false);
    }
  };

  const searchRecordings = (searchTerm: string): Recording[] => {
    if (!searchTerm) return recordings;
    
    return recordings.filter(recording => {
      const searchableText = `${recording.contact} ${recording.company} ${recording.keywords.join(' ')}`.toLowerCase();
      return searchableText.includes(searchTerm.toLowerCase());
    });
  };

  useEffect(() => {
    if (autoFetch) {
      fetchRecordings();
    }
  }, [autoFetch]);

  return {
    recordings,
    isLoading,
    error,
    fetchRecordings,
    searchRecordings,
  };
};
