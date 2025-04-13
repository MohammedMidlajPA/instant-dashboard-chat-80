
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  SearchIcon, 
  RefreshCw, 
  Phone, 
  MessageSquare, 
  User,
  Clock,
  Bookmark
} from "lucide-react";
import { useState, useEffect } from "react";
import { useVapiRealtime } from "@/hooks/useVapiRealtime";
import { Badge } from "@/components/ui/badge";
import { VapiApiKeyForm } from "@/components/VapiApiKeyForm";
import { CallTranscript } from "@/components/CallTranscript";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { toast } from "sonner";

type CallRecording = {
  id: string;
  contact_name: string;
  company_name: string;
  call_date: string;
  duration: number;
  call_type: string;
  sentiment: string;
  keywords: string[];
  transcription: string;
  inquiry_type?: string;
};

const OutboundCalling = () => {
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCall, setSelectedCall] = useState<CallRecording | null>(null);
  const [activeTab, setActiveTab] = useState("recent");
  
  // Use the real-time hook to get live call data
  const { 
    data: callData,
    isLoading,
    isConnected,
    refetch 
  } = useVapiRealtime<CallRecording[]>({
    fetchInterval: 15000, // 15 seconds for more frequent updates
    initialFetchDelay: 1000,
    enabled: isApiKeySet,
    onDataUpdate: (data) => {
      // Show notification when new calls come in
      if (data && Array.isArray(data) && data.length > 0) {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        
        const recentCalls = data.filter(call => {
          const callDate = new Date(call.call_date);
          return callDate >= fiveMinutesAgo;
        });
        
        if (recentCalls.length > 0) {
          toast.success(`${recentCalls.length} new call${recentCalls.length > 1 ? 's' : ''} in the last 5 minutes`);
        }
      }
    }
  });

  // Filter calls based on search term
  const filteredCalls = searchTerm && callData
    ? callData.filter(call => {
        const searchableText = `${call.contact_name} ${call.company_name} ${call.keywords?.join(' ')} ${call.transcription || ''} ${call.inquiry_type || ''}`.toLowerCase();
        return searchableText.includes(searchTerm.toLowerCase());
      })
    : callData || [];
  
  // Function to format duration in mm:ss
  const formatDuration = (seconds: number) => {
    if (!seconds) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };
  
  // Get recent and saved calls (here using a simple filter, but could be more complex)
  const recentCalls = filteredCalls.sort((a, b) => 
    new Date(b.call_date).getTime() - new Date(a.call_date).getTime()
  ).slice(0, 20);
  
  // Simulating "saved" calls - in a real app, you'd have a way to mark calls as saved
  // For now, let's assume calls with positive sentiment are "saved"
  const savedCalls = filteredCalls.filter(call => call.sentiment === "positive");
  
  // Current calls to display based on active tab
  const displayedCalls = activeTab === "recent" ? recentCalls : savedCalls;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Voice Agent Conversations</h1>
            <p className="text-muted-foreground">View and interact with call recordings</p>
          </div>
          <div className="relative w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search transcripts..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <VapiApiKeyForm onApiKeySet={setIsApiKeySet} />

        {isApiKeySet && (
          <>
            <div className="flex justify-between items-center mb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="recent" className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Recent Calls</span>
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="flex items-center gap-2">
                    <Bookmark size={16} />
                    <span>Saved Calls</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Real-time Updates Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Connecting to VAPI...
                  </Badge>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refetch} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Refresh</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Calls List */}
              <div className="md:col-span-5 lg:col-span-4">
                <Card className="h-[700px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">
                      {activeTab === "recent" ? "Recent Conversations" : "Saved Conversations"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-3">
                    {isLoading && !displayedCalls.length ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="flex flex-col items-center">
                          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                          <p className="mt-4 text-muted-foreground">Loading call data...</p>
                        </div>
                      </div>
                    ) : displayedCalls.length === 0 ? (
                      <div className="flex flex-col justify-center items-center h-full text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                        <p>No {activeTab === "recent" ? "recent" : "saved"} conversations found</p>
                        <p className="text-sm mt-2">
                          {activeTab === "recent" 
                            ? "Try making an outbound call to generate recordings" 
                            : "Positive sentiment calls will appear here"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {displayedCalls.map((call) => (
                          <Card 
                            key={call.id}
                            className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                              selectedCall?.id === call.id ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => setSelectedCall(call)}
                          >
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium truncate">{call.contact_name}</span>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`
                                  text-xs capitalize px-1.5 
                                  ${call.sentiment === "positive" ? "bg-green-50 text-green-700 border-green-200" :
                                    call.sentiment === "negative" ? "bg-red-50 text-red-700 border-red-200" :
                                    "bg-blue-50 text-blue-700 border-blue-200"}
                                `}
                              >
                                {call.sentiment}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <div>{new Date(call.call_date).toLocaleString()}</div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{formatDuration(call.duration)}</span>
                              </div>
                            </div>
                            {call.keywords && call.keywords.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {call.keywords.slice(0, 3).map((keyword, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                                {call.keywords.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{call.keywords.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Chat Transcript */}
              <div className="md:col-span-7 lg:col-span-8">
                <Card className="h-[700px] flex flex-col">
                  <CardHeader className="border-b">
                    {selectedCall ? (
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <span>{selectedCall.contact_name}</span>
                            <Badge variant="outline" className="ml-2">
                              {selectedCall.company_name}
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedCall.call_date).toLocaleString()} • {formatDuration(selectedCall.duration)}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">Full Details</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Call Details</DialogTitle>
                                <DialogDescription>
                                  {selectedCall.contact_name} - {new Date(selectedCall.call_date).toLocaleString()}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                  <h3 className="font-medium mb-2">Call Information</h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="grid grid-cols-3 gap-1">
                                      <span className="text-muted-foreground">Contact:</span>
                                      <span className="col-span-2">{selectedCall.contact_name}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1">
                                      <span className="text-muted-foreground">Affiliation:</span>
                                      <span className="col-span-2">{selectedCall.company_name}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1">
                                      <span className="text-muted-foreground">Date:</span>
                                      <span className="col-span-2">{new Date(selectedCall.call_date).toLocaleString()}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1">
                                      <span className="text-muted-foreground">Duration:</span>
                                      <span className="col-span-2">{formatDuration(selectedCall.duration)}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1">
                                      <span className="text-muted-foreground">Call Type:</span>
                                      <span className="col-span-2 capitalize">{selectedCall.call_type}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1">
                                      <span className="text-muted-foreground">Sentiment:</span>
                                      <span className="col-span-2 capitalize">{selectedCall.sentiment}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1">
                                      <span className="text-muted-foreground">Inquiry Type:</span>
                                      <span className="col-span-2">{selectedCall.inquiry_type || "General"}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="font-medium mb-2">Topics Discussed</h3>
                                  <div className="flex flex-wrap gap-1">
                                    {selectedCall.keywords?.map((keyword, idx) => (
                                      <Badge key={idx} variant="secondary">
                                        {keyword}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button onClick={() => setSelectedCall(null)} variant="ghost" size="sm">
                            Close
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <CardTitle className="text-lg font-medium">
                        Select a conversation to view
                      </CardTitle>
                    )}
                  </CardHeader>
                  
                  <CardContent className="flex-1 p-0 overflow-hidden">
                    {selectedCall ? (
                      <CallTranscript
                        transcription={selectedCall.transcription}
                        contact={selectedCall.contact_name}
                        date={selectedCall.call_date}
                      />
                    ) : (
                      <div className="flex flex-col justify-center items-center h-full text-muted-foreground">
                        <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                        <p>Select a conversation from the list</p>
                        <p className="text-sm mt-2">Call transcripts will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OutboundCalling;
