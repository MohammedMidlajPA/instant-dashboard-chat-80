
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart, PieChart } from "@/components/ui/custom-charts";
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  BarChart2, 
  Mic, 
  Volume2, 
  UserCheck, 
  Timer, 
  PhoneCall, 
  Phone, 
  MessageSquare,
  User,
  ChevronDown,
  Download,
  Share2,
  Filter
} from 'lucide-react';
import { useMcubeCalls } from "@/hooks/useMcubeCalls";
import CallLogsList from "@/components/CallAnalysis/CallLogsList";
import CallDetailsView from "@/components/CallAnalysis/CallDetails";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

const SyntheonDashboard = () => {
  const { calls, stats, isLoading, fetchCalls } = useMcubeCalls();
  const [selectedCallId, setSelectedCallId] = React.useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [showMultiChannelPanel, setShowMultiChannelPanel] = useState(false);
  
  // Calculate Huerize AI metrics from calls
  const analyzedCalls = calls.filter(call => call.analysis);
  const totalAnalyzed = analyzedCalls.length;
  
  const avgScriptAdherence = totalAnalyzed > 0 ? 
    analyzedCalls.reduce((sum, call) => sum + (call.analysis?.scriptAdherence || 0), 0) / totalAnalyzed : 0;
  
  const avgEmpathyScore = totalAnalyzed > 0 ?
    analyzedCalls.reduce((sum, call) => sum + (call.analysis?.agentMetrics?.empathyScore || 0), 0) / totalAnalyzed : 0;
  
  const avgDeadAir = totalAnalyzed > 0 ?
    analyzedCalls.reduce((sum, call) => sum + (call.analysis?.deadAirPercentage || 0), 0) / totalAnalyzed : 0;
  
  const successfulCalls = analyzedCalls.filter(call => 
    call.analysis?.successEvaluation || call.analysis?.success_evaluation).length;
  const successRate = totalAnalyzed > 0 ? (successfulCalls / totalAnalyzed) * 100 : 0;

  // Prepare chart data
  const sentimentData = [
    { name: "Positive", value: calls.filter(call => call.sentiment?.toLowerCase() === "positive").length },
    { name: "Neutral", value: calls.filter(call => call.sentiment?.toLowerCase() === "neutral").length },
    { name: "Negative", value: calls.filter(call => call.sentiment?.toLowerCase() === "negative").length },
  ];

  const scriptAdherenceData = analyzedCalls.map(call => ({
    agent: call.agentName || "Unknown",
    adherence: call.analysis?.scriptAdherence || 0
  })).slice(0, 5);
  
  const empathyScoreData = analyzedCalls.map(call => ({
    agent: call.agentName || "Unknown",
    score: call.analysis?.agentMetrics?.empathyScore || 0
  })).slice(0, 5);

  // Call Volumes by Day of Week
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const callVolumeByDay = daysOfWeek.map(day => ({
    day,
    calls: Math.floor(Math.random() * 50) + 10, // Random data for demonstration
    analyzed: Math.floor(Math.random() * 30) + 5
  }));

  // Topic Distribution
  const topicDistribution = [
    { topic: "Admissions", count: 45 },
    { topic: "Financial Aid", count: 32 },
    { topic: "Course Info", count: 28 },
    { topic: "Technical Support", count: 15 },
    { topic: "Other", count: 10 }
  ];

  // Time Trends
  const timeData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    calls: Math.floor(Math.random() * 10) + 1, // Random data for demonstration
    success: Math.random() * 100
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Huerize AI Analytics</h1>
            <p className="text-muted-foreground">AI-powered conversation intelligence and insights</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tabs 
              value={timeRange} 
              onValueChange={(v) => setTimeRange(v as any)} 
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All Calls</DropdownMenuItem>
                <DropdownMenuItem>Inbound Only</DropdownMenuItem>
                <DropdownMenuItem>Outbound Only</DropdownMenuItem>
                <DropdownMenuItem>Positive Sentiment</DropdownMenuItem>
                <DropdownMenuItem>Negative Sentiment</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={() => fetchCalls()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button variant="default" size="sm" onClick={() => setShowMultiChannelPanel(!showMultiChannelPanel)}>
              <PhoneCall className="h-4 w-4 mr-2" />
              Multi-Channel
            </Button>
          </div>
        </div>

        {showMultiChannelPanel && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Multi-Channel Communication</h3>
                  <p className="text-sm text-muted-foreground">Connect with students across multiple channels</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="bg-white">
                    <Phone className="h-4 w-4 mr-2" />
                    Phone
                  </Button>
                  <Button variant="outline" className="bg-white">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    SMS
                  </Button>
                  <Button variant="outline" className="bg-white">
                    <User className="h-4 w-4 mr-2" />
                    Video
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard
            title="Success Rate"
            value={`${successRate.toFixed(1)}%`}
            description={`${successfulCalls} successful calls`}
            icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            trend={{ value: 5.2, isPositive: true }}
          />

          <AnalyticsCard
            title="Script Adherence"
            value={`${avgScriptAdherence.toFixed(1)}%`}
            description="Average across calls"
            icon={<BarChart2 className="h-4 w-4 text-blue-600" />}
            trend={{ value: 2.8, isPositive: true }}
          />

          <AnalyticsCard
            title="Dead Air"
            value={`${avgDeadAir.toFixed(1)}%`}
            description="Average silence in calls"
            icon={<Volume2 className="h-4 w-4 text-amber-600" />}
            trend={{ value: 1.5, isPositive: false }}
          />

          <AnalyticsCard
            title="Empathy Score"
            value={`${avgEmpathyScore.toFixed(1)}/100`}
            description="Average empathy rating"
            icon={<Mic className="h-4 w-4 text-purple-600" />}
            trend={{ value: 3.2, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Call Volume by Day</CardTitle>
                <CardDescription>Number of calls throughout the week</CardDescription>
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
            <CardContent className="p-4">
              <BarChart
                data={callVolumeByDay}
                categories={["calls", "analyzed"]}
                index="day"
                valueFormatter={(value) => `${value}`}
                height={250}
                colors={["#3b82f6", "#60a5fa"]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>Emotion analysis across all calls</CardDescription>
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
            <CardContent className="p-4">
              <PieChart
                data={sentimentData}
                category="value"
                index="name"
                colors={["#10b981", "#94a3b8", "#ef4444"]}
                height={250}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Topic Distribution</CardTitle>
                <CardDescription>Common discussion topics</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <BarChart
                data={topicDistribution}
                categories={["count"]}
                index="topic"
                valueFormatter={(value) => `${value}`}
                height={250}
                colors={["#8b5cf6"]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Call Success by Hour</CardTitle>
                <CardDescription>Success rate throughout the day</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <LineChart
                data={timeData}
                categories={["success"]}
                index="hour"
                valueFormatter={(value) => `${value.toFixed(1)}%`}
                height={250}
                colors={["#10b981"]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Top performer metrics</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs defaultValue="adherence">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="adherence" className="flex-1">Script Adherence</TabsTrigger>
                  <TabsTrigger value="empathy" className="flex-1">Empathy Score</TabsTrigger>
                </TabsList>
                <TabsContent value="adherence">
                  <BarChart
                    data={scriptAdherenceData}
                    categories={["adherence"]}
                    index="agent"
                    valueFormatter={(value) => `${value}%`}
                    height={200}
                    colors={["#3b82f6"]}
                  />
                </TabsContent>
                <TabsContent value="empathy">
                  <BarChart
                    data={empathyScoreData}
                    categories={["score"]}
                    index="agent"
                    valueFormatter={(value) => `${value}/100`}
                    height={200}
                    colors={["#8b5cf6"]}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {selectedCallId ? (
            <>
              <div className="lg:col-span-1 space-y-4">
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4">
                    <Button 
                      variant="outline" 
                      className="w-full mb-2" 
                      onClick={() => setSelectedCallId(null)}
                    >
                      ← Back to Call List
                    </Button>
                    <p className="text-sm text-muted-foreground mb-2">
                      {format(new Date(), "PPP")} · Call Details
                    </p>
                    <h3 className="font-semibold">Call Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      View detailed AI analysis and transcripts for this call
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Calls</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 max-h-[400px] overflow-y-auto">
                    <CallLogsList 
                      recordings={calls.slice(0, 5)} 
                      isLoading={isLoading}
                      onSelectCall={setSelectedCallId}
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2">
                <CallDetailsView callId={selectedCallId} />
              </div>
            </>
          ) : (
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Call Recordings</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <CallLogsList 
                    recordings={calls} 
                    isLoading={isLoading} 
                    onSelectCall={setSelectedCallId}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SyntheonDashboard;
