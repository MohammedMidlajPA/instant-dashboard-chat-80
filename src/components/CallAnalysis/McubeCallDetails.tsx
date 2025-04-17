
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, XCircle, Phone, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { CallRecord } from "@/services/mcube";

interface McubeCallDetailsProps {
  callId: string | null;
  call: CallRecord | null;
  isLoading: boolean;
  error: Error | null;
}

export const McubeCallDetails: React.FC<McubeCallDetailsProps> = ({ 
  callId, 
  call, 
  isLoading, 
  error 
}) => {
  if (!callId) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>Select a call to view details</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
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
          <p>{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!call) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>No call details found</p>
        </CardContent>
      </Card>
    );
  }

  // Format phone numbers
  const customerPhone = call.customerPhone || "Unknown";
  const agentPhone = call.agentPhone || "Unknown";
  
  // Format times and duration
  const startTime = new Date(call.startTime).toLocaleString();
  const endTime = call.endTime ? new Date(call.endTime).toLocaleString() : "N/A";
  const duration = call.duration 
    ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` 
    : "Unknown";
  
  // Check if call was successful (based on status)
  const callSuccessful = call.status === "ANSWER" || call.status === "COMPLETED";
  
  // Determine sentiment color
  const getSentimentClass = (sentiment?: string) => {
    if (!sentiment) return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    
    sentiment = sentiment.toLowerCase();
    if (sentiment === "positive") 
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (sentiment === "negative") 
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            {call.direction === 'inbound' ? (
              <PhoneIncoming className="h-5 w-5 mr-2 text-blue-500" />
            ) : (
              <PhoneOutgoing className="h-5 w-5 mr-2 text-green-500" />
            )}
            <span>Call with {customerPhone}</span>
          </div>
          <div>
            {callSuccessful !== null && (
              <span className={callSuccessful ? "text-green-600" : "text-amber-600"}>
                {callSuccessful 
                  ? <CheckCircle className="h-5 w-5 inline-block mr-1" /> 
                  : <XCircle className="h-5 w-5 inline-block mr-1" />}
                {callSuccessful ? "Completed" : "Not Completed"}
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Start Time</p>
            <p className="font-medium">{startTime}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">End Time</p>
            <p className="font-medium">{endTime}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">{duration}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Direction</p>
            <p className="font-medium capitalize">{call.direction}</p>
          </div>
        </div>

        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Call Details</TabsTrigger>
            {call.transcription && <TabsTrigger value="transcript">Transcript</TabsTrigger>}
            {call.recordingUrl && <TabsTrigger value="recording">Recording</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="details">
            <div className="bg-muted/50 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-3">MCUBE Call Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Call ID:</span>
                  <span className="ml-2">{call.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2">{call.status}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Agent Phone:</span>
                  <span className="ml-2">{agentPhone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Agent Name:</span>
                  <span className="ml-2">{call.agentName || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Customer Phone:</span>
                  <span className="ml-2">{customerPhone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">DID Number:</span>
                  <span className="ml-2">{call.didNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Disconnected By:</span>
                  <span className="ml-2">{call.disconnectedBy || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Call Group:</span>
                  <span className="ml-2">{call.groupName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sentiment:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getSentimentClass(call.sentiment)}`}>
                    {call.sentiment || "Neutral"}
                  </span>
                </div>
                {call.answeredTime && (
                  <div>
                    <span className="text-muted-foreground">Answer Time:</span>
                    <span className="ml-2">{call.answeredTime}</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {call.transcription && (
            <TabsContent value="transcript">
              <div className="bg-muted/50 p-4 rounded-md text-sm whitespace-pre-line">
                <h3 className="text-sm font-medium mb-2">Call Transcript</h3>
                <p>{call.transcription}</p>
                
                {call.keywords && call.keywords.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {call.keywords.map((keyword, idx) => (
                        <span 
                          key={idx} 
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
          
          {call.recordingUrl && (
            <TabsContent value="recording">
              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Call Recording</h3>
                <audio controls className="w-full" src={call.recordingUrl}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default McubeCallDetails;
