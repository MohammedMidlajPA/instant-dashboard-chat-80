
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlayIcon, DownloadIcon, MessageSquareIcon, InfoIcon, AlertCircle } from "lucide-react";
import { SentimentBadge } from "./SentimentBadge";
import { CallTypeBadge } from "./CallTypeBadge";
import { InquiryTypeBadge } from "./InquiryTypeBadge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface Recording {
  id: string;
  contact: string;
  company: string;
  date: string;
  duration: string;
  type: 'Outbound' | 'Inbound' | 'Transfer' | 'Follow-up';
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  keywords: string[];
  inquiryType?: string;
  transcription?: string;
  recording_url?: string;
}

interface CallRecordingsListProps {
  recordings: Recording[];
  isLoading: boolean;
}

export const CallRecordingsList: React.FC<CallRecordingsListProps> = ({ 
  recordings, 
  isLoading 
}) => {
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isLoading && recordings.length === 0) {
      setApiError("Connection to VAPI API unsuccessful. This may be due to an endpoint format change or authentication issue.");
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
                    <li>Ensure the VAPI API endpoints are up to date</li>
                    <li>Check if your assistant ID is valid</li>
                    <li>Try refreshing the connection by clicking "Connect to VAPI" in the VAPI Connection section</li>
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
            {!Array.isArray(recordings) || recordings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <InfoIcon className="h-6 w-6 text-gray-400 mb-2" />
                    <p className="text-gray-500">No recordings found</p>
                    <p className="text-sm text-gray-400 mt-1">Make an outbound call to generate call recordings</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              recordings.map((recording) => (
                <TableRow key={recording.id}>
                  <TableCell className="font-medium">{recording.contact}</TableCell>
                  <TableCell>{recording.company}</TableCell>
                  <TableCell>{new Date(recording.date).toLocaleDateString()}</TableCell>
                  <TableCell>{recording.duration}</TableCell>
                  <TableCell>
                    <CallTypeBadge type={recording.type} />
                  </TableCell>
                  <TableCell>
                    {recording.inquiryType && <InquiryTypeBadge type={recording.inquiryType} />}
                  </TableCell>
                  <TableCell>
                    <SentimentBadge type={recording.sentiment} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(recording.keywords) && recording.keywords.length > 0 ? (
                        <>
                          {recording.keywords.slice(0, 2).map((keyword, i) => (
                            <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                          {recording.keywords.length > 2 && (
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
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">No topics</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" title="Play recording" disabled={!recording.recording_url}>
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
                              {selectedRecording?.contact} - {new Date(selectedRecording?.date || "").toLocaleString()}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 bg-gray-50 p-4 rounded-md text-sm">
                            {selectedRecording?.transcription || "No transcription available for this call."}
                          </div>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Keywords</h4>
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(selectedRecording?.keywords) && selectedRecording?.keywords.length > 0 ? (
                                selectedRecording?.keywords.map((keyword, i) => (
                                  <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    {keyword}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">No keywords available</span>
                              )}
                            </div>
                          </div>
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
