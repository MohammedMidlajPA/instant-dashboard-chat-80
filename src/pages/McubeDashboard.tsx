
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneCall, Clock, User, Calendar } from "lucide-react";
import { McubeCallLogsList } from "@/components/CallAnalysis/McubeCallLogsList";

const McubeDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">MCUBE Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your call center operations</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Calls"
            value="0"
            description="Past 30 days"
            icon={<PhoneCall className="h-4 w-4" />}
          />
          <StatsCard 
            title="Average Duration"
            value="00:00"
            description="Per call"
            icon={<Clock className="h-4 w-4" />}
          />
          <StatsCard 
            title="Active Agents"
            value="0"
            description="Currently online"
            icon={<User className="h-4 w-4" />}
          />
          <StatsCard 
            title="Scheduled Calls"
            value="0"
            description="For today"
            icon={<Calendar className="h-4 w-4" />}
          />
        </div>
        
        <Tabs defaultValue="calls">
          <TabsList>
            <TabsTrigger value="calls">Recent Calls</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          </TabsList>
          <TabsContent value="calls">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle>Call Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <McubeCallLogsList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Call Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-6 text-center">
                  <p className="text-muted-foreground">Analytics feature is coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-6 text-center">
                  <p className="text-muted-foreground">Agent performance tracking is coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Stats card component
const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon 
}: { 
  title: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode 
}) => {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            <div className="text-primary">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default McubeDashboard;
