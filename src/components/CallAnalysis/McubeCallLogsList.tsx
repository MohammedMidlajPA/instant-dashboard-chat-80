
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { mcubeService, McubeCallData } from "@/services/mcubeService";
import { formatDistance } from "date-fns";
import { Phone, PhoneOutgoing, Clock, Calendar, User } from "lucide-react";

export function McubeCallLogsList() {
  const [calls, setCalls] = useState<McubeCallData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCallLogs = async () => {
    setLoading(true);
    try {
      const callLogs = await mcubeService.getCallLogs(10);
      setCalls(callLogs);
    } catch (error) {
      console.error("Error fetching call logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch call logs on first render
  useState(() => {
    fetchCallLogs();
  });

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone?: string): string => {
    if (!phone) return "Unknown";
    // Simple formatting for demo purposes
    return phone;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Calls</h3>
        <button 
          onClick={fetchCallLogs}
          className="text-sm text-primary underline cursor-pointer"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : calls.length === 0 ? (
        <p className="text-center py-4 text-muted-foreground">No call logs available</p>
      ) : (
        <div className="space-y-3">
          {calls.map((call) => (
            <Card key={call.callId} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 bg-primary/10 p-2 rounded-full">
                      {call.direction === 'inbound' ? (
                        <Phone className="h-5 w-5 text-primary" />
                      ) : (
                        <PhoneOutgoing className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{formatPhoneNumber(call.customerPhone)}</p>
                      <div className="flex text-xs text-muted-foreground gap-4 mt-1">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(call.duration)}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDistance(new Date(call.startTime), new Date(), { addSuffix: true })}
                        </span>
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {call.agentName || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      call.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      call.status === 'missed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
