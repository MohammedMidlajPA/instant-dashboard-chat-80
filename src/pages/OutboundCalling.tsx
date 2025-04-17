
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneCall, Check, X } from "lucide-react";
import { toast } from "sonner";
import { mcubeService } from "@/services/mcubeService";

const OutboundCalling = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agentNumber, setAgentNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
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
      await mcubeService.initiateOutboundCall(agentNumber, phoneNumber);
      toast.success(`Call initiated to ${phoneNumber}`);
      
      // Reset form after successful call
      setPhoneNumber("");
    } catch (error) {
      console.error("Error initiating call:", error);
      toast.error("Failed to initiate call");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Outbound Calling</h1>
          <p className="text-muted-foreground">Make outbound calls to your contacts</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-1">
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
              <Button variant="outline" onClick={() => setPhoneNumber("")}>
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
          
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Recent Outbound Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center">
                <p className="text-muted-foreground">No recent outbound calls</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OutboundCalling;
