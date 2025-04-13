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
    keywords: ['product demo', 'pricing', 'follow-up'],
  },
  { 
    id: "2", 
    contact: 'Sarah Johnson', 
    company: 'XYZ Industries', 
    date: '2023-05-14', 
    duration: '8:21', 
    type: 'Inbound',
    sentiment: 'Neutral',
    keywords: ['technical issue', 'support', 'renewal'],
  },
  { 
    id: "3", 
    contact: 'Michael Brown', 
    company: 'Acme Inc.', 
    date: '2023-05-13', 
    duration: '15:37', 
    type: 'Outbound',
    sentiment: 'Positive',
    keywords: ['proposal', 'budget', 'decision maker'],
  },
  { 
    id: "4", 
    contact: 'Emily Wilson', 
    company: 'Tech Solutions', 
    date: '2023-05-12', 
    duration: '9:54', 
    type: 'Outbound',
    sentiment: 'Negative',
    keywords: ['complaint', 'escalation', 'refund'],
  },
  { 
    id: "5", 
    contact: 'David Lee', 
    company: 'Global Enterprises', 
    date: '2023-05-11', 
    duration: '11:12', 
    type: 'Inbound',
    sentiment: 'Neutral',
    keywords: ['inquiry', 'features', 'pricing'],
  }
];

const SentimentBadge = ({ type }: { type: string }) => {
  const styles = {
    Positive: "bg-green-100 text-green-800",
    Neutral: "bg-blue-100 text-blue-800",
    Negative: "bg-red-100 text-red-800"
  };
  
  const color = styles[type as keyof typeof styles] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {type}
    </span>
  );
};

const CallTypeBadge = ({ type }: { type: string }) => {
  const color = type === 'Inbound' 
    ? "bg-purple-100 text-purple-800" 
    : "bg-blue-100 text-blue-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {type}
    </span>
  );
};

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
        const formattedData = callData.map(call => ({
          id: call.id,
          contact: call.contact_name || 'Unknown',
          company: call.company_name || 'Unknown',
          date: call.call_date,
          duration: formatDuration(call.duration),
          type: call.call_type === 'inbound' ? 'Inbound' : 'Outbound',
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
            <h1 className="text-2xl font-bold">Call Recordings</h1>
            <p className="text-muted-foreground">AI-powered analysis of your sales conversations</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <PhoneIcon className="h-6 w-6 text-blue-700" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Total Calls</p>
                      <h3 className="text-2xl font-bold">127</h3>
                      <p className="text-xs text-green-500">+12% from last month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <ClockIcon className="h-6 w-6 text-green-700" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Total Talk Time</p>
                      <h3 className="text-2xl font-bold">43h 12m</h3>
                      <p className="text-xs text-green-500">+8% from last month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-3 rounded-full">
                      <UserIcon className="h-6 w-6 text-amber-700" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Unique Contacts</p>
                      <h3 className="text-2xl font-bold">84</h3>
                      <p className="text-xs text-green-500">+15% from last month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <CalendarIcon className="h-6 w-6 text-purple-700" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Upcoming Calls</p>
                      <h3 className="text-2xl font-bold">12</h3>
                      <p className="text-xs text-gray-500">Next: Today, 3:30 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-medium">Recent Recordings</CardTitle>
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
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading recordings...</p>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contact</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Sentiment</TableHead>
                        <TableHead>Keywords</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecordings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <p className="text-gray-500">No recordings found.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRecordings.map((recording) => (
                          <TableRow key={recording.id}>
                            <TableCell className="font-medium">{recording.contact}</TableCell>
                            <TableCell>{recording.company}</TableCell>
                            <TableCell>{new Date(recording.date).toLocaleDateString()}</TableCell>
                            <TableCell>{recording.duration}</TableCell>
                            <TableCell>
                              <CallTypeBadge type={recording.type} />
                            </TableCell>
                            <TableCell>
                              <SentimentBadge type={recording.sentiment} />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {recording.keywords.map((keyword, i) => (
                                  <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <PlayIcon className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <DownloadIcon className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <MessageSquareIcon className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CallRecordings;
