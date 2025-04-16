
import React from "react";
import { CallRecord } from "@/services/mcube";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SentimentBadge } from "@/components/CallRecordings/SentimentBadge";
import { PhoneCall, PhoneOutgoing, PhoneIncoming } from "lucide-react";

interface McubeCallLogsListProps {
  calls: CallRecord[];
  isLoading: boolean;
  onSelectCall: (callId: string) => void;
  selectedCallId?: string;
}

export const McubeCallLogsList: React.FC<McubeCallLogsListProps> = ({
  calls,
  isLoading,
  onSelectCall,
  selectedCallId
}) => {
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "00:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-3">
            <div className="flex justify-between mb-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-16" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <PhoneCall className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p>No call records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
      {calls.map((call) => (
        <Card
          key={call.id}
          className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
            selectedCallId === call.id ? "ring-2 ring-primary bg-muted" : ""
          }`}
          onClick={() => onSelectCall(call.id)}
        >
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-2">
              {call.direction === "inbound" ? (
                <PhoneIncoming className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              ) : (
                <PhoneOutgoing className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              )}
              <span className="font-medium truncate">
                {call.contactName || call.customerPhone}
              </span>
            </div>
            <SentimentBadge type={call.sentiment || "Neutral"} />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{new Date(call.startTime).toLocaleString()}</span>
            <span>{formatDuration(call.duration)}</span>
          </div>
          
          {call.companyName && (
            <div className="mt-1">
              <Badge variant="outline" className="text-xs bg-background/50">
                {call.companyName}
              </Badge>
            </div>
          )}
          
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
  );
};

export default McubeCallLogsList;
