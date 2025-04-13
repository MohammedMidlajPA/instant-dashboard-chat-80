
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlayIcon, DownloadIcon, MessageSquareIcon } from "lucide-react";
import { SentimentBadge } from "./SentimentBadge";
import { CallTypeBadge } from "./CallTypeBadge";

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

interface CallRecordingsListProps {
  recordings: Recording[];
  isLoading: boolean;
}

export const CallRecordingsList: React.FC<CallRecordingsListProps> = ({ 
  recordings, 
  isLoading 
}) => {
  return (
    <>
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
              <TableHead>Affiliation</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Keywords</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recordings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <p className="text-gray-500">No recordings found.</p>
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
                      <Button variant="outline" size="sm" title="Play recording">
                        <PlayIcon className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" title="Download recording">
                        <DownloadIcon className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" title="View transcript">
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
    </>
  );
};
