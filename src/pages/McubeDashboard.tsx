
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  SearchIcon,
  RefreshCw,
  PhoneCall,
  Phone
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { McubeCallLogsList } from "@/components/CallAnalysis/McubeCallLogsList";
import { McubeCallDetails } from "@/components/CallAnalysis/McubeCallDetails";
import { useMcubeCalls } from "@/hooks/useMcubeCalls";
import { CallFilters } from "@/services/mcube";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const McubeDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showOutboundDialog, setShowOutboundDialog] = useState(false);
  const [agentPhone, setAgentPhone] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  
  // Set up filters for the calls
  const [filters, setFilters] = useState<CallFilters>({
    limit: 100
  });
  
  // Use our hook for fetching MCUBE calls
  const {
    calls,
    stats,
    isLoading,
    fetchCalls,
    makeCall,
    selectedCallId,
    setSelectedCallId,
    selectedCall,
    error
  } = useMcubeCalls({
    filters,
    autoFetch: true
  });

  // Filter calls based on search term
  const filteredCalls = searchTerm 
    ? calls.filter(call => {
        const searchableText = [
          call.contactName || '',
          call.companyName || '',
          call.customerPhone,
          call.transcription || '',
          ...(call.keywords || [])
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchTerm.toLowerCase());
      })
    : calls;
    
  // Handle initiating an outbound call
  const handleMakeCall = async () => {
    if (!agentPhone || !customerPhone) {
      toast.error("Agent and customer phone numbers are required");
      return;
    }
    
    try {
      await makeCall(agentPhone, customerPhone);
      setShowOutboundDialog(false);
      // Clear the form
      setCustomerPhone("");
    } catch (error) {
      console.error("Failed to make call:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">MCUBE Call Dashboard</h1>
            <p className="text-muted-foreground">Monitor and analyze voice agent conversations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search calls..." 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Dialog open={showOutboundDialog} onOpenChange={setShowOutboundDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Phone className="h-4 w-4 mr-2" />
                  Make Call
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Initiate Outbound Call</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="agentPhone" className="text-right">
                      Agent Phone
                    </Label>
                    <Input
                      id="agentPhone"
                      value={agentPhone}
                      onChange={(e) => setAgentPhone(e.target.value)}
                      placeholder="8767316316"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customerPhone" className="text-right">
                      Customer Phone
                    </Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="5551234567"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowOutboundDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleMakeCall} disabled={!agentPhone || !customerPhone}>
                    Start Call
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 p-3 bg-blue-50 rounded-full">
                  <PhoneCall className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Calls</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-bold">{stats.totalCalls}</h3>
                    <span className="text-green-500 text-sm">+12.5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 p-3 bg-green-50 rounded-full">
                  <PhoneCall className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Positive Calls</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-bold">{stats.sentimentDistribution.positive}</h3>
                    <span className="text-green-500 text-sm">
                      {stats.totalCalls > 0 ? 
                        `${Math.round((stats.sentimentDistribution.positive / stats.totalCalls) * 100)}%` : 
                        '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 p-3 bg-amber-50 rounded-full">
                  <PhoneCall className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Talk Time</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-bold">
                      {Math.floor(stats.totalTalkTime / 60)} mins
                    </h3>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 p-3 bg-purple-50 rounded-full">
                  <PhoneCall className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unique Contacts</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-bold">{stats.uniqueContacts}</h3>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Call List - Takes up more space on larger screens */}
          <div className="md:col-span-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Recent Calls</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchCalls} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Refresh</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge 
                    variant={!filters.direction ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilters({...filters, direction: undefined})}
                  >
                    All
                  </Badge>
                  <Badge 
                    variant={filters.direction === "inbound" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilters({...filters, direction: "inbound"})}
                  >
                    Inbound
                  </Badge>
                  <Badge 
                    variant={filters.direction === "outbound" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilters({...filters, direction: "outbound"})}
                  >
                    Outbound
                  </Badge>
                </div>
              
                <McubeCallLogsList 
                  calls={filteredCalls} 
                  isLoading={isLoading}
                  onSelectCall={setSelectedCallId}
                  selectedCallId={selectedCallId || undefined}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Call Details - Takes up less space */}
          <div className="md:col-span-7">
            <McubeCallDetails 
              callId={selectedCallId || ""} 
              call={selectedCall}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default McubeDashboard;
