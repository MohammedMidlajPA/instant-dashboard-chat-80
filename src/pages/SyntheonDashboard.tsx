
import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart, PieChart } from "@/components/ui/custom-charts";
import { RefreshCw, CheckCircle, XCircle, BarChart2, Mic, Volume2 } from "lucide-react";
import { useMcubeCalls } from "@/hooks/useMcubeCalls";
import CallLogsList from "@/components/CallAnalysis/CallLogsList";
import CallDetailsView from "@/components/CallAnalysis/CallDetails";

const SyntheonDashboard = () => {
  const { calls, stats, isLoading, fetchCalls } = useMcubeCalls();
  const [selectedCallId, setSelectedCallId] = React.useState<string | null>(null);
  
  // Calculate Syntheon.ai metrics from calls
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Syntheon.ai Analytics</h1>
            <p className="text-muted-foreground">AI-powered call analytics and insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchCalls()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{successfulCalls} successful calls</p>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Script Adherence</p>
                  <p className="text-2xl font-bold">{avgScriptAdherence.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Average across calls</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <BarChart2 className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dead Air</p>
                  <p className="text-2xl font-bold">{avgDeadAir.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Average silence in calls</p>
                </div>
                <div className="bg-amber-100 p-2 rounded-full">
                  <Volume2 className="h-4 w-4 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Empathy Score</p>
                  <p className="text-2xl font-bold">{avgEmpathyScore.toFixed(1)}/100</p>
                  <p className="text-xs text-muted-foreground mt-1">Average empathy rating</p>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <Mic className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs defaultValue="adherence">
                <TabsList className="mb-4">
                  <TabsTrigger value="adherence">Script Adherence</TabsTrigger>
                  <TabsTrigger value="empathy">Empathy Score</TabsTrigger>
                </TabsList>
                <TabsContent value="adherence">
                  <BarChart
                    data={scriptAdherenceData}
                    categories={["adherence"]}
                    index="agent"
                    valueFormatter={(value) => `${value}%`}
                    height={250}
                  />
                </TabsContent>
                <TabsContent value="empathy">
                  <BarChart
                    data={empathyScoreData}
                    categories={["score"]}
                    index="agent"
                    valueFormatter={(value) => `${value}/100`}
                    height={250}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sentiment Distribution</CardTitle>
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
          {selectedCallId ? (
            <>
              <div className="lg:col-span-1 space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setSelectedCallId(null)}
                >
                  ← Back to Call List
                </Button>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Calls</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 max-h-[500px] overflow-y-auto">
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
              <CardHeader>
                <CardTitle>Recent Call Recordings</CardTitle>
              </CardHeader>
              <CardContent>
                <CallLogsList 
                  recordings={calls} 
                  isLoading={isLoading} 
                  onSelectCall={setSelectedCallId}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SyntheonDashboard;
