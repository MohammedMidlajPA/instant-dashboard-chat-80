
import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlayIcon, MessageSquareIcon, InfoIcon, AlertCircle, BarChart2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SentimentBadge } from "@/components/CallRecordings/SentimentBadge";
import { CallTypeBadge } from "@/components/CallRecordings/CallTypeBadge";
import { InquiryTypeBadge } from "@/components/CallRecordings/InquiryTypeBadge";
import { CallRecord } from "@/services/mcube";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper function for computing call duration
const computeCallDuration = (call: CallRecord): string => {
  if (call.duration) {
    const minutes = Math.floor(call.duration / 60);
    const seconds = call.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  return "N/A";
};

interface CallLogsListProps {
  recordings: CallRecord[];
  isLoading: boolean;
  onSelectCall?: (callId: string) => void;
}

export const CallLogsList: React.FC<CallLogsListProps> = ({ recordings, isLoading, onSelectCall }) => {
  const [selectedRecording, setSelectedRecording] = useState<CallRecord | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isLoading && recordings.length === 0) {
      setApiError("No call recordings found. This may be due to an API connection issue or there are no calls available.");
    } else {
      setApiError(null);
    }
  }, [isLoading, recordings]);

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="flex flex-col items-center">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-gray-200 border-t-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading recordings...</p>
          </div>
        </div>
      ) : apiError ? (
        <Card className="shadow-sm border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-800">API Connection Issue</h3>
                <p className="text-sm text-amber-700 mt-1">{apiError}</p>
                <div className="mt-3 text-sm">
                  <p className="font-medium text-amber-800">Troubleshooting steps:</p>
                  <ul className="list-disc pl-5 mt-1 text-amber-700 space-y-1">
                    <li>Verify your MCUBE API key is correct</li>
                    <li>Check your network connection</li>
                    <li>Try refreshing the connection</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student/Applicant</TableHead>
              <TableHead>Affiliation</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Inquiry</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Analysis</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recordings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <InfoIcon className="h-6 w-6 text-gray-400 mb-2" />
                    <p className="text-gray-500">No recordings found</p>
                    <p className="text-sm text-gray-400 mt-1">Generate calls to see recordings</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              recordings.map((recording) => (
                <TableRow key={recording.id} className="cursor-pointer" onClick={() => onSelectCall && onSelectCall(recording.id)}>
                  <TableCell className="font-medium">{recording.contact_name || "Unknown"}</TableCell>
                  <TableCell>{recording.company_name || "College Inquiry"}</TableCell>
                  <TableCell>
                    {recording.startedAt || recording.call_date || recording.startTime 
                      ? new Date(recording.startedAt || recording.call_date || recording.startTime || "").toLocaleDateString() 
                      : "Unknown"}
                  </TableCell>
                  <TableCell>{computeCallDuration(recording)}</TableCell>
                  <TableCell>
                    <CallTypeBadge type={recording.direction || "Inbound"} />
                  </TableCell>
                  <TableCell>
                    {recording.inquiry_type && <InquiryTypeBadge type={recording.inquiry_type} />}
                  </TableCell>
                  <TableCell>
                    <SentimentBadge type={recording.sentiment || "Neutral"} />
                  </TableCell>
                  <TableCell>
                    {recording.analysis ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`inline-block w-5 h-5 rounded-full ${
                              recording.analysis.successEvaluation ? 'bg-green-500' : 'bg-amber-500'
                            }`}>
                              <BarChart2 className="h-3 w-3 text-white mx-auto my-1" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="max-w-xs text-xs">
                              <div className="font-semibold mb-1">Syntheon.ai Analysis:</div>
                              <div>Script adherence: {recording.analysis.scriptAdherence || 0}%</div>
                              <div>Dead air: {recording.analysis.deadAirPercentage || 0}%</div>
                              <div>Empathy score: {recording.analysis.agentMetrics?.empathyScore || 0}%</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-xs text-gray-400">Not analyzed</span>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        title="Play recording" 
                        disabled={!recording.recording_url && !recording.recordingUrl}
                      >
                        <PlayIcon className="h-3 w-3" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="View transcript"
                            onClick={() => setSelectedRecording(recording)}
                          >
                            <MessageSquareIcon className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Call Transcript</DialogTitle>
                            <DialogDescription>
                              {selectedRecording?.contact_name || "Unknown"} - {
                                selectedRecording?.startedAt || selectedRecording?.call_date || selectedRecording?.startTime 
                                  ? new Date(selectedRecording?.startedAt || selectedRecording?.call_date || selectedRecording?.startTime || "").toLocaleString()
                                  : "Unknown date"
                              }
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 bg-gray-50 p-4 rounded-md text-sm">
                            {selectedRecording?.transcription || selectedRecording?.transcript || "No transcription available for this call."}
                          </div>
                          {selectedRecording?.keywords && selectedRecording.keywords.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Keywords</h4>
                              <div className="flex flex-wrap gap-1">
                                {selectedRecording.keywords.map((keyword, i) => (
                                  <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default CallLogsList;
