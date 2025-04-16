
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { SentimentBadge } from "@/components/CallRecordings/SentimentBadge";
import { CallRecord } from "@/services/mcube";

interface McubeCallDetailsProps {
  callId: string;
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
        <CardContent className="p-8 text-center text-gray-500">
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
        <CardContent className="p-8 text-center text-gray-500">
          <p>No call details found</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for display
  const contactName = call.contactName || "Unknown Caller";
  const callDate = call.startTime 
    ? new Date(call.startTime).toLocaleString()
    : "Unknown date";
  const duration = call.duration 
    ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` 
    : "Unknown";
  const transcript = call.transcription || "No transcript available";
  
  // Determine call success
  const callSuccessful = call.success ?? (call.sentiment?.toLowerCase() === "positive");

  return (
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
            <p className="text-sm text-gray-500">Direction</p>
            <p className="font-medium capitalize">{call.direction}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sentiment</p>
            <SentimentBadge type={call.sentiment || "Neutral"} />
          </div>
        </div>

        <Tabs defaultValue="transcript">
          <TabsList className="mb-4">
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="keywords">Keywords & Topics</TabsTrigger>
            {call.recordingUrl && <TabsTrigger value="recording">Recording</TabsTrigger>}
            <TabsTrigger value="details">Call Details</TabsTrigger>
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
          
          {call.recordingUrl && (
            <TabsContent value="recording">
              <div className="p-4 rounded-md bg-gray-50">
                <h3 className="text-sm font-medium mb-2">Call Recording</h3>
                <audio controls className="w-full" src={call.recordingUrl}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            </TabsContent>
          )}
          
          <TabsContent value="details">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-3">Additional Call Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <div>
                  <span className="text-gray-500">Call ID:</span>
                  <span className="ml-2">{call.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2">{call.status}</span>
                </div>
                <div>
                  <span className="text-gray-500">Agent Phone:</span>
                  <span className="ml-2">{call.agentPhone}</span>
                </div>
                <div>
                  <span className="text-gray-500">Agent Name:</span>
                  <span className="ml-2">{call.agentName || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Customer Phone:</span>
                  <span className="ml-2">{call.customerPhone}</span>
                </div>
                <div>
                  <span className="text-gray-500">Company:</span>
                  <span className="ml-2">{call.companyName || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Disconnected By:</span>
                  <span className="ml-2">{call.disconnectedBy || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Group:</span>
                  <span className="ml-2">{call.groupName || "N/A"}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default McubeCallDetails;
