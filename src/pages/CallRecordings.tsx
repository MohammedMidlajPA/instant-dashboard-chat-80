
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Calendar, 
  Clock, 
  Search, 
  RefreshCw, 
  Download,
  CheckCircle, 
  XCircle, 
  Volume2 
} from "lucide-react";
import { useMcubeCalls } from "@/hooks/useMcubeCalls";
import { formatDistanceToNow } from "date-fns";

const CallRecordings = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { calls, stats, isLoading, fetchCalls } = useMcubeCalls({
    filters: activeTab !== "all" ? { direction: activeTab as "inbound" | "outbound" } : undefined
  });

  const formatCallTime = (timeString: string) => {
    try {
      return formatDistanceToNow(new Date(timeString), { addSuffix: true });
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

  const getStatusBadgeClass = (status: string) => {
    if (!status) return "bg-gray-200 text-gray-800";
    
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
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Call Recordings</h1>
            <p className="text-muted-foreground">View and manage your call recordings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchCalls()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                  <p className="text-2xl font-bold">{stats.totalCalls}</p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inbound Calls</p>
                  <p className="text-2xl font-bold">{stats.inboundCalls}</p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <PhoneIncoming className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Outbound Calls</p>
                  <p className="text-2xl font-bold">{stats.outboundCalls}</p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <PhoneOutgoing className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Duration</p>
                  <p className="text-2xl font-bold">{formatDuration(stats.avgCallDuration)}</p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Calls</TabsTrigger>
            <TabsTrigger value="inbound">Inbound</TabsTrigger>
            <TabsTrigger value="outbound">Outbound</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <CallRecordingsTable 
              calls={calls} 
              isLoading={isLoading}
              formatCallTime={formatCallTime}
              formatDuration={formatDuration}
              getStatusBadgeClass={getStatusBadgeClass}
            />
          </TabsContent>
          
          <TabsContent value="inbound" className="mt-4">
            <CallRecordingsTable 
              calls={calls} 
              isLoading={isLoading}
              formatCallTime={formatCallTime}
              formatDuration={formatDuration}
              getStatusBadgeClass={getStatusBadgeClass}
            />
          </TabsContent>
          
          <TabsContent value="outbound" className="mt-4">
            <CallRecordingsTable 
              calls={calls} 
              isLoading={isLoading}
              formatCallTime={formatCallTime}
              formatDuration={formatDuration}
              getStatusBadgeClass={getStatusBadgeClass}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

interface CallRecordingsTableProps {
  calls: any[];
  isLoading: boolean;
  formatCallTime: (time: string) => string;
  formatDuration: (seconds?: number) => string;
  getStatusBadgeClass: (status: string) => string;
}

const CallRecordingsTable = ({ 
  calls, 
  isLoading,
  formatCallTime,
  formatDuration,
  getStatusBadgeClass
}: CallRecordingsTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (!calls.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No call recordings found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Call Recordings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Direction</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Recording</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.map((call) => (
              <TableRow key={call.id}>
                <TableCell className="font-medium">
                  {call.direction === 'inbound' ? (
                    <PhoneIncoming className="h-4 w-4 text-blue-500" />
                  ) : (
                    <PhoneOutgoing className="h-4 w-4 text-green-500" />
                  )}
                </TableCell>
                <TableCell>{call.customerPhone}</TableCell>
                <TableCell>{call.agentName || 'Unknown'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(call.status)}`}>
                    {call.status}
                  </span>
                </TableCell>
                <TableCell>{formatDuration(call.duration)}</TableCell>
                <TableCell>{formatCallTime(call.startTime)}</TableCell>
                <TableCell>
                  {call.recordingUrl ? (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span className="text-muted-foreground text-xs">No recording</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <PhoneOutgoing className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CallRecordings;
