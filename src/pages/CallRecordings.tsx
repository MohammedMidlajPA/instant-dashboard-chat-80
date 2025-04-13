
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VapiApiKeyForm } from "@/components/VapiApiKeyForm";
import { 
  PlayIcon, 
  PauseIcon, 
  DownloadIcon, 
  ClockIcon, 
  CalendarIcon, 
  PhoneIcon, 
  UserIcon, 
  MessageSquareIcon,
  SearchIcon,
  RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { vapiService } from "@/services/vapiService";
import { toast } from "sonner";
import { CallRecordingsList } from "@/components/CallRecordings/CallRecordingsList";
import { AnalyticsSummaryCards } from "@/components/CallRecordings/AnalyticsSummaryCards";

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

const placeholderRecordings: Recording[] = [
  { 
    id: "1", 
    contact: 'John Smith', 
    company: 'ABC Corporation', 
    date: '2023-05-15', 
    duration: '12:43', 
    type: 'Outbound',
    sentiment: 'Positive',
    keywords: ['admissions inquiry', 'application deadline', 'scholarship'],
  },
  { 
    id: "2", 
    contact: 'Sarah Johnson', 
    company: 'Local High School', 
    date: '2023-05-14', 
    duration: '8:21', 
    type: 'Inbound',
    sentiment: 'Neutral',
    keywords: ['campus tour', 'housing', 'orientation'],
  },
  { 
    id: "3", 
    contact: 'Michael Brown', 
    company: 'Community College', 
    date: '2023-05-13', 
    duration: '15:37', 
    type: 'Outbound',
    sentiment: 'Positive',
    keywords: ['transfer credits', 'program requirements', 'application'],
  },
  { 
    id: "4", 
    contact: 'Emily Wilson', 
    company: 'Wilson Family', 
    date: '2023-05-12', 
    duration: '9:54', 
    type: 'Outbound',
    sentiment: 'Negative',
    keywords: ['financial aid', 'tuition payment', 'deadline'],
  },
  { 
    id: "5", 
    contact: 'David Lee', 
    company: 'Graduate Applicant', 
    date: '2023-05-11', 
    duration: '11:12', 
    type: 'Inbound',
    sentiment: 'Neutral',
    keywords: ['graduate program', 'application status', 'department contact'],
  }
];

const CallRecordings = () => {
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>(placeholderRecordings);
  const [searchTerm, setSearchTerm] = useState("");
  
  const fetchRecordings = async () => {
    if (!isApiKeySet) return;
    
    setIsLoading(true);
    try {
      const assistantId = vapiService.getAssistantId();
      if (!assistantId) {
        toast.error("Assistant ID not found. Please check your configuration.");
        return;
      }
      
      const callData = await vapiService.getCallAnalysis({ 
        assistantId, 
        fetchAll: false,
        limit: 10 
      });
      
      if (callData && callData.length > 0) {
        const formattedData: Recording[] = callData.map(call => ({
          id: call.id,
          contact: call.contact_name || 'Unknown',
          company: call.company_name || 'Unknown College Applicant',
          date: call.call_date,
          duration: formatDuration(call.duration),
          type: (call.call_type === 'inbound' ? 'Inbound' : 'Outbound') as 'Inbound' | 'Outbound',
          sentiment: (call.sentiment?.charAt(0).toUpperCase() + call.sentiment?.slice(1)) as 'Positive' | 'Neutral' | 'Negative',
          keywords: call.keywords || [],
        }));
        
        setRecordings(formattedData);
      } else {
        toast.info("No call recordings found. Using placeholder data.");
        setRecordings(placeholderRecordings);
      }
    } catch (error) {
      console.error("Error fetching recordings:", error);
      toast.error("Failed to load call recordings");
      setRecordings(placeholderRecordings);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDuration = (seconds: number): string => {
    if (!seconds) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    if (isApiKeySet) {
      fetchRecordings();
    }
  }, [isApiKeySet]);
  
  const filteredRecordings = recordings.filter(recording => {
    const searchableText = `${recording.contact} ${recording.company} ${recording.keywords.join(' ')}`.toLowerCase();
    return searchableText.includes(searchTerm.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">College Voice Agent Call Recordings</h1>
            <p className="text-muted-foreground">AI-powered analysis of student and applicant conversations</p>
          </div>
          <div className="relative w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search recordings..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <VapiApiKeyForm onApiKeySet={setIsApiKeySet} />

        {isApiKeySet && (
          <>
            <AnalyticsSummaryCards />

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-medium">Recent Calls</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchRecordings} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Refresh</span>
                </Button>
              </CardHeader>
              <CardContent>
                <CallRecordingsList 
                  recordings={filteredRecordings} 
                  isLoading={isLoading} 
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CallRecordings;
