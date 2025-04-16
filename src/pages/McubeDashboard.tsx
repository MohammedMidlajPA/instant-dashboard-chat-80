
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  SearchIcon,
  RefreshCw,
  PhoneCall,
  Key,
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing,
  Clock,
  Users,
  MessageSquareText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { McubeCallLogsList } from "@/components/CallAnalysis/McubeCallLogsList";
import { McubeCallDetails } from "@/components/CallAnalysis/McubeCallDetails";
import { useMcubeCalls } from "@/hooks/useMcubeCalls";
import { CallFilters, mcubeService } from "@/services/mcube";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const McubeDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showApiTokenDialog, setShowApiTokenDialog] = useState(false);
  const [apiToken, setApiToken] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
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
    selectedCallId,
    setSelectedCallId,
    selectedCall,
    error
  } = useMcubeCalls({
    filters,
    autoFetch: true
  });

  // Check if we have a valid token
  const hasValidToken = !!mcubeService.getToken() && mcubeService.getToken() !== 'your-mcube-token';

  // Update filters when tab changes
  useEffect(() => {
    let newFilters: CallFilters = { ...filters };
    
    if (activeTab === "inbound") {
      newFilters.direction = "inbound";
    } else if (activeTab === "outbound") {
      newFilters.direction = "outbound";
    } else {
      delete newFilters.direction;
    }
    
    setFilters(newFilters);
  }, [activeTab]);

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

  // Handle setting the API token
  const handleSetApiToken = () => {
    if (!apiToken.trim()) {
      toast.error("Please enter a valid API token");
      return;
    }
    
    mcubeService.setToken(apiToken.trim());
    setShowApiTokenDialog(false);
    toast.success("MCUBE API token updated successfully");
    // Refresh calls with the new token
    fetchCalls();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Call Dashboard</h1>
            <p className="text-muted-foreground">Monitor and analyze student engagement conversations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search calls..." 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Dialog open={showApiTokenDialog} onOpenChange={setShowApiTokenDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  {hasValidToken ? "Update API Token" : "Set API Token"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>MCUBE API Token</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="apiToken" className="text-right">
                      API Token
                    </Label>
                    <Input
                      id="apiToken"
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      placeholder="Enter your MCUBE API token"
                      className="col-span-3"
                      type="password"
                    />
                  </div>
                  <div className="col-span-full text-sm text-muted-foreground">
                    This token is required to authenticate with the MCUBE API for making outbound calls.
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowApiTokenDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSetApiToken} disabled={!apiToken.trim()}>
                    Save Token
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchCalls} 
              disabled={isLoading}
              title="Refresh Calls"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {!hasValidToken && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Key className="h-8 w-8 text-amber-500" />
                <div>
                  <h3 className="font-medium text-amber-800">MCUBE API Token Required</h3>
                  <p className="text-amber-700 text-sm mt-1">
                    Please set your MCUBE API token to enable outbound calling and real-time data synchronization.
                  </p>
                </div>
                <Button 
                  className="ml-auto" 
                  variant="outline" 
                  onClick={() => setShowApiTokenDialog(true)}
                >
                  Set API Token
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <MessageSquareText className="h-5 w-5 text-green-600" />
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
                  <Clock className="h-5 w-5 text-amber-600" />
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
                  <Users className="h-5 w-5 text-purple-600" />
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

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Calls</TabsTrigger>
              <TabsTrigger value="inbound" className="flex items-center gap-1">
                <PhoneIncoming className="h-3.5 w-3.5" />
                Inbound
              </TabsTrigger>
              <TabsTrigger value="outbound" className="flex items-center gap-1">
                <PhoneOutgoing className="h-3.5 w-3.5" />
                Outbound
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <TabsContent value="all" className="mt-0 lg:col-span-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center justify-between">
                    <span>Recent Calls</span>
                    <Badge variant="outline">{filteredCalls.length} calls</Badge>
                  </CardTitle>
                  <CardDescription>Browse and search through all call recordings</CardDescription>
                </CardHeader>
                <Separator className="mb-2" />
                <CardContent>
                  <McubeCallLogsList 
                    calls={filteredCalls} 
                    isLoading={isLoading}
                    onSelectCall={setSelectedCallId}
                    selectedCallId={selectedCallId || undefined}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="inbound" className="mt-0 lg:col-span-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center justify-between">
                    <span>Inbound Calls</span>
                    <Badge variant="outline">{filteredCalls.length} calls</Badge>
                  </CardTitle>
                  <CardDescription>Calls received from customers</CardDescription>
                </CardHeader>
                <Separator className="mb-2" />
                <CardContent>
                  <McubeCallLogsList 
                    calls={filteredCalls} 
                    isLoading={isLoading}
                    onSelectCall={setSelectedCallId}
                    selectedCallId={selectedCallId || undefined}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="outbound" className="mt-0 lg:col-span-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center justify-between">
                    <span>Outbound Calls</span>
                    <Badge variant="outline">{filteredCalls.length} calls</Badge>
                  </CardTitle>
                  <CardDescription>Calls made to prospects and customers</CardDescription>
                </CardHeader>
                <Separator className="mb-2" />
                <CardContent>
                  <McubeCallLogsList 
                    calls={filteredCalls} 
                    isLoading={isLoading}
                    onSelectCall={setSelectedCallId}
                    selectedCallId={selectedCallId || undefined}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <div className="lg:col-span-7">
              <McubeCallDetails 
                callId={selectedCallId || ""} 
                call={selectedCall}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default McubeDashboard;
