
import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlayIcon, MessageSquareIcon, InfoIcon, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SentimentBadge } from "@/components/CallRecordings/SentimentBadge";
import { CallTypeBadge } from "@/components/CallRecordings/CallTypeBadge";
import { InquiryTypeBadge } from "@/components/CallRecordings/InquiryTypeBadge";
import { computeCallDuration, CallSummary } from "@/services/vapi";
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

interface CallLogsListProps {
  recordings: CallSummary[];
  isLoading: boolean;
}

export const CallLogsList: React.FC<CallLogsListProps> = ({ recordings, isLoading }) => {
  const [selectedRecording, setSelectedRecording] = useState<CallSummary | null>(null);
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
                    <li>Verify your VAPI API key is correct</li>
                    <li>Check if your assistant ID is valid</li>
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
              <TableHead>Topics</TableHead>
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
                <TableRow key={recording.id}>
                  <TableCell className="font-medium">{recording.contact_name || "Unknown"}</TableCell>
                  <TableCell>{recording.company_name || "College Inquiry"}</TableCell>
                  <TableCell>
                    {recording.startedAt || recording.call_date 
                      ? new Date(recording.startedAt || recording.call_date || "").toLocaleDateString() 
                      : "Unknown"}
                  </TableCell>
                  <TableCell>{computeCallDuration(recording)}</TableCell>
                  <TableCell>
                    <CallTypeBadge type={recording.inquiry_type || "Inbound"} />
                  </TableCell>
                  <TableCell>
                    {recording.inquiry_type && <InquiryTypeBadge type={recording.inquiry_type} />}
                  </TableCell>
                  <TableCell>
                    <SentimentBadge type={recording.sentiment || "Neutral"} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {recording.keywords && recording.keywords.slice(0, 2).map((keyword, i) => (
                        <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                      {recording.keywords && recording.keywords.length > 2 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs cursor-pointer">
                                +{recording.keywords.length - 2}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-xs">
                                {recording.keywords.slice(2).join(", ")}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        title="Play recording" 
                        disabled={!recording.recording_url}
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
                                selectedRecording?.startedAt || selectedRecording?.call_date 
                                  ? new Date(selectedRecording?.startedAt || selectedRecording?.call_date || "").toLocaleString()
                                  : "Unknown date"
                              }
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 bg-gray-50 p-4 rounded-md text-sm">
                            {selectedRecording?.transcription || "No transcription available for this call."}
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
