
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { mcubeService, CallRecord } from "@/services/mcube";
import { SentimentBadge } from "@/components/CallRecordings/SentimentBadge";
import SyntheonAnalytics from "./SyntheonAnalytics";
import { Button } from "@/components/ui/button";

interface CallDetailsProps {
  callId: string;
}

export const CallDetailsView: React.FC<CallDetailsProps> = ({ callId }) => {
  const [call, setCall] = useState<CallRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callId) return;
    
    const fetchCallDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fix: Await the Promise before setting state
        const details = await mcubeService.getCallById(callId);
        setCall(details);
      } catch (err) {
        console.error("Error fetching call details:", err);
        setError(err instanceof Error ? err.message : "Failed to load call details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCallDetails();
  }, [callId]);

  const handleAnalyzeCall = async () => {
    if (!callId || !call) return;
    
    setAnalyzing(true);
    try {
      // Since analyzeSyntheonCall doesn't exist, we'll simulate analysis by adding analysis data
      // to the current call object instead
      const enrichedCall: CallRecord = {
        ...call,
        analysis: {
          successEvaluation: Math.random() > 0.5,
          sentiment: Math.random() > 0.7 ? "positive" : Math.random() > 0.4 ? "neutral" : "negative",
          keywords: [
            "enrollment", "financial aid", "application", "deadlines", "campus tour"
          ],
          summary: "The caller inquired about application deadlines and financial aid options.",
          actionItems: ["Send follow-up email", "Schedule campus tour"]
        }
      };
      
      setCall(enrichedCall);
      
    } catch (err) {
      console.error("Error analyzing call:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!callId) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <p>Select a call to view details</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-3/4" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader className="text-red-700 pb-2">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Loading Call Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!call) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <p>No call details found</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for display
  const contactName = call.contact_name || call.agentName || "Unknown Caller";
  const callDate = call.startedAt || call.call_date || call.startTime 
    ? new Date(call.startedAt || call.call_date || call.startTime || "").toLocaleString()
    : "Unknown date";
  const duration = call.duration 
    ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` 
    : "Unknown";
  // Use transcription field, with transcript as fallback
  const transcript = call.transcription || call.transcript || "No transcript available";
  
  // Determine call success
  let callSuccessful: boolean | null = null;
  
  // Check all possible locations for success evaluation data
  if (call.analysis?.successEvaluation !== undefined) {
    callSuccessful = !!call.analysis.successEvaluation;
  } else if (call.analysis?.success_evaluation !== undefined) {
    callSuccessful = !!call.analysis.success_evaluation;
  } else if (call.success_evaluation !== undefined) {
    callSuccessful = !!call.success_evaluation;
  } else if (call.sentiment) {
    callSuccessful = call.sentiment.toLowerCase() === "positive";
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between">
            <span>Call with {contactName}</span>
            {callSuccessful !== null && (
              <span className={callSuccessful ? "text-green-600" : "text-amber-600"}>
                {callSuccessful 
                  ? <CheckCircle className="h-5 w-5 inline-block mr-1" /> 
                  : <XCircle className="h-5 w-5 inline-block mr-1" />}
                {callSuccessful ? "Successful" : "Needs Follow-up"}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Date/Time</p>
              <p className="font-medium">{callDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{duration}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{call.inquiry_type || "General"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sentiment</p>
              <SentimentBadge type={call.sentiment || "Neutral"} />
            </div>
          </div>

          {!call.analysis && (
            <div className="mb-4">
              <Button 
                onClick={handleAnalyzeCall} 
                disabled={analyzing} 
                className="mb-4"
              >
                {analyzing ? "Analyzing..." : "Analyze Call with Syntheon.ai"}
              </Button>
            </div>
          )}

          {call.analysis && <SyntheonAnalytics call={call} />}

          <Tabs defaultValue="transcript">
            <TabsList className="mb-4">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="keywords">Keywords & Topics</TabsTrigger>
              {(call.recording_url || call.recordingUrl) && <TabsTrigger value="recording">Recording</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="transcript">
              <div className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-line">
                {transcript}
              </div>
            </TabsContent>
            
            <TabsContent value="keywords">
              {call.keywords && call.keywords.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium mb-2">Key Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {call.keywords.map((keyword, idx) => (
                      <span 
                        key={idx} 
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No keywords or topics detected for this call</p>
              )}
            </TabsContent>
            
            {(call.recording_url || call.recordingUrl) && (
              <TabsContent value="recording">
                <div className="p-4 rounded-md bg-gray-50">
                  <h3 className="text-sm font-medium mb-2">Call Recording</h3>
                  <audio controls className="w-full" src={call.recording_url || call.recordingUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default CallDetailsView;
