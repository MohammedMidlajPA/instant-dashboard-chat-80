
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import { Phone, PhoneOutgoing, Clock, Calendar, User, Play } from "lucide-react";
import { CallRecord, mcubeService } from "@/services/mcube";

export function McubeCallLogsList() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCallLogs = async () => {
    setLoading(true);
    try {
      const callLogs = mcubeService.getCalls({ limit: 10 });
      setCalls(callLogs);
    } catch (error) {
      console.error("Error fetching call logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch call logs on first render
  useEffect(() => {
    fetchCallLogs();
    
    // Subscribe to call updates
    const unsubscribe = mcubeService.subscribeToCallUpdates((updatedCalls) => {
      setCalls(updatedCalls.slice(0, 10));
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone?: string): string => {
    if (!phone) return "Unknown";
    // Simple formatting
    return phone;
  };

  const getStatusClass = (status: string) => {
    if (!status) return "";
    
    status = status.toLowerCase();
    if (status === "answer" || status === "completed") 
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (status === "cancel" || status === "missed" || status === "no-answer" || status === "noresponse") 
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    if (status === "busy" || status === "executive busy") 
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Calls</h3>
        <Button 
          variant="outline"
          size="sm"
          onClick={fetchCallLogs}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </Button>
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
            <Card key={call.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
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
                  <div className="flex items-center space-x-2">
                    {call.recordingUrl && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(call.status)}`}>
                      {call.status}
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
