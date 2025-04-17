
import { useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, BarChart, PieChart } from "@/components/ui/custom-charts";
import { 
  Phone, 
  UserCheck, 
  Clock, 
  CalendarDays, 
  TrendingUp, 
  Mic, 
  Users, 
  ChevronDown,
  Download,
  FileText,
  Filter,
  Share2
} from 'lucide-react';
import { useMcubeCalls } from '@/hooks/useMcubeCalls';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AnalyticsCard } from '@/components/AnalyticsCard';

const CallAnalytics = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const { stats, calls, isLoading } = useMcubeCalls();

  // Format call data for charts
  const formatCallsForCharts = () => {
    // Group calls by day
    const callsByDay: Record<string, { total: number, inbound: number, outbound: number }> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();

    // Initialize with zero counts
    last7Days.forEach(day => {
      callsByDay[day] = { total: 0, inbound: 0, outbound: 0 };
    });

    // Count calls per day
    calls.forEach(call => {
      const day = format(new Date(call.startTime), 'yyyy-MM-dd');
      if (callsByDay[day]) {
        callsByDay[day].total += 1;
        if (call.direction === 'inbound') {
          callsByDay[day].inbound += 1;
        } else {
          callsByDay[day].outbound += 1;
        }
      }
    });

    // Prepare data for charts
    const callVolumeData = last7Days.map(day => ({
      name: format(new Date(day), 'MMM dd'),
      Total: callsByDay[day].total,
      Inbound: callsByDay[day].inbound,
      Outbound: callsByDay[day].outbound,
    }));

    // Duration by call direction
    const avgDurationByDirection = {
      Inbound: calls.filter(c => c.direction === 'inbound' && c.duration)
        .reduce((sum, call) => sum + (call.duration || 0), 0) / 
        (calls.filter(c => c.direction === 'inbound' && c.duration).length || 1),
      Outbound: calls.filter(c => c.direction === 'outbound' && c.duration)
        .reduce((sum, call) => sum + (call.duration || 0), 0) / 
        (calls.filter(c => c.direction === 'outbound' && c.duration).length || 1)
    };

    // Call outcome distribution
    const outcomeDistribution = {
      Answered: Object.entries(stats.callsByStatus)
        .filter(([status]) => status.toLowerCase() === 'answer' || status.toLowerCase() === 'completed')
        .reduce((sum, [_, count]) => sum + count, 0),
      Missed: Object.entries(stats.callsByStatus)
        .filter(([status]) => status.toLowerCase() === 'cancel' || status.toLowerCase() === 'noresponse' || 
          status.toLowerCase() === 'no-answer' || status.toLowerCase() === 'missed')
        .reduce((sum, [_, count]) => sum + count, 0),
      Busy: Object.entries(stats.callsByStatus)
        .filter(([status]) => status.toLowerCase().includes('busy'))
        .reduce((sum, [_, count]) => sum + count, 0)
    };

    return {
      callVolumeData,
      avgDurationByDirection,
      outcomeDistribution
    };
  };

  const chartData = formatCallsForCharts();

  // Format time as minutes:seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Call Analytics</h1>
            <p className="text-muted-foreground">Analyze your call data and performance metrics</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tabs 
              value={timeRange} 
              onValueChange={(v) => setTimeRange(v as any)} 
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>All Calls</DropdownMenuItem>
                <DropdownMenuItem>Inbound Only</DropdownMenuItem>
                <DropdownMenuItem>Outbound Only</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AnalyticsCard
            title="Total Calls"
            value={stats.totalCalls.toString()}
            description="All time"
            icon={<Phone className="h-4 w-4" />}
            trend={{ value: 12, isPositive: true }}
          />
          <AnalyticsCard
            title="Avg. Call Duration"
            value={formatTime(stats.avgCallDuration)}
            description="Per call"
            icon={<Clock className="h-4 w-4" />}
            trend={{ value: 5, isPositive: true }}
          />
          <AnalyticsCard
            title="Active Agents"
            value={Object.keys(calls.reduce((acc, call) => {
              if (call.agentPhone) acc[call.agentPhone] = true;
              return acc;
            }, {} as Record<string, boolean>)).length.toString()}
            description="Unique agents"
            icon={<UserCheck className="h-4 w-4" />}
          />
          <AnalyticsCard
            title="Recent Calls"
            value={calls.filter(c => {
              const callDate = new Date(c.startTime);
              const today = new Date();
              return callDate.getDate() === today.getDate() && 
                     callDate.getMonth() === today.getMonth() &&
                     callDate.getFullYear() === today.getFullYear();
            }).length.toString()}
            description="Today"
            icon={<CalendarDays className="h-4 w-4" />}
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Call Volume Trend</CardTitle>
                <CardDescription>Total calls by day</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <LineChart 
                  data={chartData.callVolumeData}
                  categories={["Inbound", "Outbound", "Total"]}
                  index="name"
                  colors={["#3b82f6", "#10b981", "#6b7280"]}
                  valueFormatter={(value) => value.toString()}
                  className="h-[300px]"
                />
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
              Updated {format(new Date(), 'MMM d, yyyy h:mm a')}
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Call Outcomes</CardTitle>
                <CardDescription>Distribution of call outcomes</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <PieChart
                  data={[
                    { name: "Answered", value: chartData.outcomeDistribution.Answered },
                    { name: "Missed", value: chartData.outcomeDistribution.Missed },
                    { name: "Busy", value: chartData.outcomeDistribution.Busy }
                  ]}
                  index="name"
                  category="value"
                  colors={["#10b981", "#ef4444", "#f59e0b"]}
                  valueFormatter={(value) => value.toString()}
                  className="h-[300px]"
                />
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
              Based on {stats.totalCalls} total calls
            </CardFooter>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Call handling metrics by agent</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <BarChart
                  data={Object.entries(calls.reduce((acc, call) => {
                    if (call.agentName) {
                      acc[call.agentName] = (acc[call.agentName] || 0) + 1;
                    }
                    return acc;
                  }, {} as Record<string, number>)).map(([name, count]) => ({
                    name, count
                  }))}
                  index="name"
                  categories={["count"]}
                  colors={["#8b5cf6"]}
                  valueFormatter={(value) => value.toString()}
                  className="h-[250px]"
                />
              )}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="link" size="sm" className="text-xs">
                View Detailed Agent Reports
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Call Duration</CardTitle>
                <CardDescription>Average duration by call direction</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <BarChart
                  data={[
                    { 
                      direction: "Inbound", 
                      duration: Math.round(chartData.avgDurationByDirection.Inbound / 60 * 10) / 10 
                    },
                    { 
                      direction: "Outbound", 
                      duration: Math.round(chartData.avgDurationByDirection.Outbound / 60 * 10) / 10 
                    }
                  ]}
                  index="direction"
                  categories={["duration"]}
                  colors={["#3b82f6"]}
                  valueFormatter={(value) => `${value} min`}
                  className="h-[250px]"
                />
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
              Total talk time: {formatTime(stats.totalTalkTime)}
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Call Distribution</CardTitle>
                <CardDescription>Calls by group</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <PieChart
                  data={Object.entries(stats.callsByGroup).map(([group, count]) => ({
                    group, count
                  }))}
                  index="group"
                  category="count"
                  colors={["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"]}
                  valueFormatter={(value) => value.toString()}
                  className="h-[250px]"
                />
              )}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="link" size="sm" className="text-xs">
                View Group Details
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Call Time Distribution</CardTitle>
            <CardDescription>Number of calls by hour of day</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <BarChart
              data={Array.from({ length: 24 }, (_, i) => ({
                hour: `${i}:00`,
                calls: Math.floor(Math.random() * 20) + 1 // Random data for demonstration
              }))}
              index="hour"
              categories={["calls"]}
              colors={["#3b82f6"]}
              valueFormatter={(value) => value.toString()}
            />
          </CardContent>
          <CardFooter className="border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Peak call volume occurs between 9:00 AM and 11:00 AM
            </p>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CallAnalytics;
