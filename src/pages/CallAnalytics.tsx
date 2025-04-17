
import { useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { Phone, UserCheck, Clock, CalendarDays, TrendingUp, Mic, Users } from 'lucide-react';
import { useMcubeCalls } from '@/hooks/useMcubeCalls';
import { format } from 'date-fns';

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
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Call Analytics</h1>
            <p className="text-muted-foreground">Analyze your call data and performance metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <Tabs 
              value={timeRange} 
              onValueChange={(v) => setTimeRange(v as any)} 
              className="w-[400px]"
            >
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Calls" 
            value={stats.totalCalls.toString()} 
            description="All time"
            icon={<Phone className="h-4 w-4" />}
          />
          <StatsCard 
            title="Avg. Call Duration" 
            value={formatTime(stats.avgCallDuration)}
            description="Per call" 
            icon={<Clock className="h-4 w-4" />}
          />
          <StatsCard 
            title="Active Agents" 
            value={Object.keys(calls.reduce((acc, call) => {
              if (call.agentPhone) acc[call.agentPhone] = true;
              return acc;
            }, {} as Record<string, boolean>)).length.toString()}
            description="Unique agents" 
            icon={<UserCheck className="h-4 w-4" />}
          />
          <StatsCard 
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
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Volume Trend</CardTitle>
              <CardDescription>Total calls by day</CardDescription>
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
                  colors={["blue", "green", "gray"]}
                  valueFormatter={(value) => value.toString()}
                  className="h-[300px]"
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Call Outcomes</CardTitle>
              <CardDescription>Distribution of call outcomes</CardDescription>
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
                  colors={["green", "red", "amber"]}
                  valueFormatter={(value) => value.toString()}
                  className="h-[300px]"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Call handling metrics by agent</CardDescription>
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
                  colors={["purple"]}
                  valueFormatter={(value) => value.toString()}
                  className="h-[250px]"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Call Duration</CardTitle>
              <CardDescription>Average duration by call direction</CardDescription>
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
                  colors={["blue"]}
                  valueFormatter={(value) => `${value} min`}
                  className="h-[250px]"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Call Distribution</CardTitle>
              <CardDescription>Calls by group</CardDescription>
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
                  colors={["blue", "green", "purple", "amber"]}
                  valueFormatter={(value) => value.toString()}
                  className="h-[250px]"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Stats card component
interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const StatsCard = ({ title, value, description, icon }: StatsCardProps) => {
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

export default CallAnalytics;
