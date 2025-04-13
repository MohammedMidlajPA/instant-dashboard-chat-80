import { useState, useEffect } from "react";
import { vapiService } from "@/services/vapiService";
import { toast } from "sonner";

// Define college-specific recording interface
interface CollegeRecording {
  id: string;
  contact: string;
  company: string;
  date: string;
  duration: string;
  type: 'Outbound' | 'Inbound' | 'Transfer' | 'Follow-up';
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  keywords: string[];
  inquiryType: string;
  transcription?: string;
  recording_url?: string;
}

interface CollegeCallStats {
  totalCalls: number;
  totalTalkTime: string;
  uniqueContacts: number;
  admissionsInquiries: number;
  sentimentDistribution: Array<{name: string, value: number, color: string}>;
  monthlyData: any[];
  topKeywords: Array<{keyword: string, count: number}>;
}

interface CollegeCallRecordingsHookResult {
  recordings: CollegeRecording[];
  stats: CollegeCallStats;
  isLoading: boolean;
  error: Error | null;
  fetchRecordings: () => Promise<void>;
  searchRecordings: (searchTerm: string) => CollegeRecording[];
}

interface CollegeCallRecordingsHookOptions {
  assistantId?: string;
  limit?: number;
  autoFetch?: boolean;
  placeholderStats?: Partial<CollegeCallStats>;
  placeholderRecordings?: CollegeRecording[];
}

// Sample placeholder recordings for colleges
const defaultPlaceholderRecordings: CollegeRecording[] = [
  { 
    id: "1", 
    contact: 'John Smith', 
    company: 'Local High School', 
    date: '2025-04-10', 
    duration: '12:43', 
    type: 'Outbound',
    sentiment: 'Positive',
    keywords: ['application deadline', 'admission requirements', 'scholarship'],
    inquiryType: 'Admissions',
    transcription: "Hello, this is John Smith calling about the application deadline for the fall semester. I wanted to know what the requirements are for applying to the computer science program, and if there are any scholarships available for incoming freshmen."
  },
  { 
    id: "2", 
    contact: 'Sarah Johnson', 
    company: 'Transfer Student', 
    date: '2025-04-09', 
    duration: '8:21', 
    type: 'Inbound',
    sentiment: 'Neutral',
    keywords: ['campus tour', 'housing', 'orientation'],
    inquiryType: 'Housing',
    transcription: "Hi, my name is Sarah Johnson. I'm a transfer student and I'd like to schedule a campus tour next week. I also have some questions about on-campus housing options and the orientation schedule for transfer students."
  },
  { 
    id: "3", 
    contact: 'Michael Brown', 
    company: 'Community College', 
    date: '2025-04-08', 
    duration: '15:37', 
    type: 'Outbound',
    sentiment: 'Positive',
    keywords: ['transfer credits', 'program requirements', 'application'],
    inquiryType: 'Academic',
    transcription: "Hello Michael, I'm calling from State University to follow up on your interest in our transfer program. I'd like to discuss how your credits from Community College will transfer to our institution and what additional requirements you'll need to fulfill for your chosen program."
  },
  { 
    id: "4", 
    contact: 'Emily Wilson', 
    company: 'Wilson Family', 
    date: '2025-04-07', 
    duration: '9:54', 
    type: 'Inbound',
    sentiment: 'Negative',
    keywords: ['financial aid', 'tuition payment', 'deadline'],
    inquiryType: 'Financial Aid',
    transcription: "Hello, this is Emily Wilson. I'm calling because I'm concerned about my financial aid package. The amount offered doesn't cover enough of the tuition, and the payment deadline is approaching. I need to understand what other options are available to me."
  },
  { 
    id: "5", 
    contact: 'David Lee', 
    company: 'Graduate Applicant', 
    date: '2025-04-06', 
    duration: '11:12', 
    type: 'Inbound',
    sentiment: 'Neutral',
    keywords: ['graduate program', 'application status', 'department contact'],
    inquiryType: 'Admissions',
    transcription: "Hi, my name is David Lee. I submitted my application to the graduate program in psychology last month, and I wanted to check on the status. Also, could you provide me with contact information for someone in the psychology department who could answer some specific questions about the program?"
  }
];

// Default placeholder stats
const defaultPlaceholderStats: CollegeCallStats = {
  totalCalls: 127,
  totalTalkTime: "43h 12m",
  uniqueContacts: 84,
  admissionsInquiries: 58,
  sentimentDistribution: [
    { name: 'Positive', value: 65, color: '#10b981' },
    { name: 'Neutral', value: 25, color: '#3b82f6' },
    { name: 'Negative', value: 10, color: '#ef4444' },
  ],
  monthlyData: [
    { month: 'Jan', admissions: 65, financialAid: 28, housing: 15, academic: 23, support: 10 },
    { month: 'Feb', admissions: 59, financialAid: 32, housing: 12, academic: 27, support: 8 },
    { month: 'Mar', admissions: 80, financialAid: 45, housing: 25, academic: 30, support: 12 },
    { month: 'Apr', admissions: 81, financialAid: 40, housing: 30, academic: 25, support: 15 },
    { month: 'May', admissions: 56, financialAid: 36, housing: 22, academic: 18, support: 9 },
    { month: 'Jun', admissions: 55, financialAid: 30, housing: 18, academic: 20, support: 7 },
  ],
  topKeywords: [
    { keyword: "application deadline", count: 42 },
    { keyword: "financial aid", count: 38 },
    { keyword: "campus housing", count: 35 },
    { keyword: "transcript", count: 29 },
    { keyword: "transfer credits", count: 27 },
    { keyword: "scholarship", count: 24 },
    { keyword: "admission requirements", count: 22 },
    { keyword: "campus tour", count: 20 },
  ]
};

export const useCollegeCallRecordings = (options?: CollegeCallRecordingsHookOptions): CollegeCallRecordingsHookResult => {
  const {
    assistantId,
    limit = 10,
    autoFetch = true,
    placeholderRecordings = defaultPlaceholderRecordings,
    placeholderStats = defaultPlaceholderStats
  } = options || {};

  const [recordings, setRecordings] = useState<CollegeRecording[]>(placeholderRecordings);
  const [stats, setStats] = useState<CollegeCallStats>({
    ...defaultPlaceholderStats,
    ...placeholderStats
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const formatDuration = (seconds: number): string => {
    if (!seconds) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Helper function to calculate total talk time
  const calculateTotalTalkTime = (calls: any[]): string => {
    const totalSeconds = calls.reduce((acc, call) => acc + (call.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Helper function to process real data into the stats format
  const processStatsFromCallData = (callData: any[]): CollegeCallStats => {
    // Count unique contacts
    const uniqueContacts = new Set(callData.map(call => call.customer_phone || call.contact_name)).size;
    
    // Count admissions inquiries
    const admissionsInquiries = callData.filter(call => {
      const transcription = (call.transcription || "").toLowerCase();
      return transcription.includes("admission") || 
             transcription.includes("apply") || 
             transcription.includes("application") ||
             (call.keywords || []).some((k: string) => 
               k.toLowerCase().includes("admission") || 
               k.toLowerCase().includes("apply")
             );
    }).length;
    
    // Process sentiment distribution
    const sentimentCounts = {
      Positive: 0,
      Neutral: 0,
      Negative: 0
    };
    
    callData.forEach(call => {
      const sentiment = call.sentiment ? 
        call.sentiment.charAt(0).toUpperCase() + call.sentiment.slice(1).toLowerCase() : 
        "Neutral";
      
      if (sentiment in sentimentCounts) {
        sentimentCounts[sentiment as keyof typeof sentimentCounts]++;
      } else {
        sentimentCounts.Neutral++;
      }
    });
    
    const sentimentDistribution = [
      { name: 'Positive', value: sentimentCounts.Positive, color: '#10b981' },
      { name: 'Neutral', value: sentimentCounts.Neutral, color: '#3b82f6' },
      { name: 'Negative', value: sentimentCounts.Negative, color: '#ef4444' },
    ];
    
    // For real implementation, you would process the actual dates
    // Keeping sample data for monthly breakdown for now
    
    // For keywords, we would aggregate from actual data
    // Keeping sample data for top keywords for now
    
    return {
      totalCalls: callData.length,
      totalTalkTime: calculateTotalTalkTime(callData),
      uniqueContacts,
      admissionsInquiries,
      sentimentDistribution,
      monthlyData: defaultPlaceholderStats.monthlyData,
      topKeywords: defaultPlaceholderStats.topKeywords,
    };
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
        const formattedData: CollegeRecording[] = callData.map(call => ({
          id: call.id,
          contact: call.contact_name || 'Unknown',
          company: call.company_name || 'College Inquiry',
          date: call.call_date,
          duration: formatDuration(call.duration),
          type: (call.call_type === 'inbound' ? 'Inbound' : 'Outbound') as 'Outbound' | 'Inbound',
          sentiment: (call.sentiment?.charAt(0).toUpperCase() + call.sentiment?.slice(1)) as 'Positive' | 'Neutral' | 'Negative',
          keywords: call.keywords || [],
          inquiryType: call.inquiry_type || 'General Inquiry',
          transcription: call.transcription,
          recording_url: call.recording_url,
        }));

        setRecordings(formattedData);
        
        // Process stats from the actual data
        setStats(processStatsFromCallData(callData));
      } else {
        toast.info("No call recordings found. Using placeholder data.");
        setRecordings(placeholderRecordings);
        setStats({
          ...defaultPlaceholderStats,
          ...placeholderStats
        });
      }
    } catch (err) {
      console.error("Error fetching recordings:", err);
      setError(err instanceof Error ? err : new Error('Failed to load call recordings'));
      toast.error("Failed to load call recordings");
      setRecordings(placeholderRecordings);
      setStats({
        ...defaultPlaceholderStats,
        ...placeholderStats
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchRecordings = (searchTerm: string): CollegeRecording[] => {
    if (!searchTerm) return recordings;
    
    return recordings.filter(recording => {
      const searchableText = `${recording.contact} ${recording.company} ${recording.keywords.join(' ')} ${recording.inquiryType}`.toLowerCase();
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
    stats,
    isLoading,
    error,
    fetchRecordings,
    searchRecordings,
  };
};
