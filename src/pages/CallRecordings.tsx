
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  SearchIcon,
  RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { VapiApiKeyForm } from "@/components/VapiApiKeyForm";
import { CallRecordingsList } from "@/components/CallRecordings/CallRecordingsList";
import { AnalyticsSummaryCards } from "@/components/CallRecordings/AnalyticsSummaryCards";
import { MonthlyCallsChart } from "@/components/CallRecordings/MonthlyCallsChart";
import { SentimentDistribution } from "@/components/CallRecordings/SentimentDistribution";
import { TopKeywords } from "@/components/CallRecordings/TopKeywords";
import { useCollegeCallRecordings } from "@/hooks/useCollegeCallRecordings";
import { Badge } from "@/components/ui/badge";
import { useVapiRealtime } from "@/hooks/useVapiRealtime";
import { useEffect } from "react";

const CallRecordings = () => {
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const {
    recordings,
    stats,
    isLoading: loadingRecordings,
    fetchRecordings
  } = useCollegeCallRecordings({
    autoFetch: isApiKeySet,
    limit: 100
  });

  // Use our real-time hook for live updates
  const { 
    isLoading: realtimeLoading,
    isConnected,
    refetch 
  } = useVapiRealtime({
    fetchInterval: 30000, // 30 seconds
    initialFetchDelay: 1000, // 1 second initial delay
    enabled: isApiKeySet,
    onDataUpdate: () => {
      // When real-time data updates, fetch the recordings
      fetchRecordings();
    }
  });

  const isLoading = loadingRecordings || realtimeLoading;

  const filteredRecordings = searchTerm 
    ? recordings.filter(recording => {
        const searchableText = `${recording.contact} ${recording.company} ${recording.keywords.join(' ')}`.toLowerCase();
        return searchableText.includes(searchTerm.toLowerCase());
      })
    : recordings;

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
            <div className="flex justify-end mb-4">
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
            </div>

            <AnalyticsSummaryCards 
              totalCalls={stats.totalCalls}
              totalTalkTime={stats.totalTalkTime}
              uniqueContacts={stats.uniqueContacts}
              admissionsInquiries={stats.admissionsInquiries}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2">
                <MonthlyCallsChart data={stats.monthlyData} />
              </div>
              <div>
                <SentimentDistribution data={stats.sentimentDistribution} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div>
                <TopKeywords keywords={stats.topKeywords} />
              </div>
              <div className="lg:col-span-2">
                <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-medium">Recent Calls</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        refetch();
                        fetchRecordings();
                      }} 
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
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CallRecordings;
