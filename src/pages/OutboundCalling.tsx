
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  PhoneCall, 
  Check, 
  X, 
  PhoneOutgoing, 
  Clock, 
  Calendar, 
  User,
  MoreHorizontal,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { mcubeService } from "@/services/mcube";
import { useMcubeCalls } from "@/hooks/useMcubeCalls";
import { formatDistance } from "date-fns";

const OutboundCalling = () => {
  const [activeTab, setActiveTab] = useState<"dial" | "recent">("dial");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agentNumber, setAgentNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { calls, fetchCalls } = useMcubeCalls({
    filters: { direction: "outbound", limit: 10 }
  });
  
  const handleCall = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number to call");
      return;
    }
    
    if (!agentNumber) {
      toast.error("Please enter your agent number");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await mcubeService.makeOutboundCall(agentNumber, phoneNumber);
      toast.success(`Call initiated to ${phoneNumber}`);
      
      // Reset form after successful call
      setPhoneNumber("");
      
      // Switch to recent calls tab
      setActiveTab("recent");
      
      // Refresh call list
      fetchCalls();
    } catch (error) {
      console.error("Error initiating call:", error);
      toast.error("Failed to initiate call");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCallTime = (timeString: string) => {
    try {
      return formatDistance(new Date(timeString), new Date(), { addSuffix: true });
    } catch (e) {
      return timeString;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Outbound Calling</h1>
          <p className="text-muted-foreground">Make outbound calls to your contacts</p>
        </div>
        
        <Tabs defaultValue="dial" value={activeTab} onValueChange={(v) => setActiveTab(v as "dial" | "recent")}>
          <TabsList>
            <TabsTrigger value="dial">
              <PhoneOutgoing className="h-4 w-4 mr-2" />
              Make a Call
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-2" />
              Recent Calls
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dial" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PhoneCall className="h-5 w-5 mr-2 text-primary" />
                  New Outbound Call
                </CardTitle>
                <CardDescription>
                  Enter the number you want to call
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agentNumber">Your Phone Number</Label>
                    <Input
                      id="agentNumber"
                      placeholder="Enter your phone number"
                      value={agentNumber}
                      onChange={(e) => setAgentNumber(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This is the number that will make the call
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Customer Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="Enter phone number to call"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button variant="outline" onClick={() => {
                  setPhoneNumber("");
                  setAgentNumber("");
                }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleCall} disabled={isLoading}>
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Initiate Call
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="recent" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Recent Outbound Calls</CardTitle>
                  <CardDescription>Your most recent outbound calls</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchCalls}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {calls.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-muted-foreground">No recent outbound calls</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {calls.map((call) => (
                      <div 
                        key={call.id} 
                        className="flex items-start justify-between border-b pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-center">
                          <div className="mr-3 bg-primary/10 p-2 rounded-full">
                            <PhoneOutgoing className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{call.customerPhone}</p>
                            <div className="flex text-xs text-muted-foreground gap-4 mt-1">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDuration(call.duration)}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatCallTime(call.startTime)}
                              </span>
                              <span className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {call.agentName || "Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setPhoneNumber(call.customerPhone);
                              if (!agentNumber && call.agentPhone) {
                                setAgentNumber(call.agentPhone);
                              }
                              setActiveTab("dial");
                            }}
                          >
                            <PhoneOutgoing className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default OutboundCalling;
