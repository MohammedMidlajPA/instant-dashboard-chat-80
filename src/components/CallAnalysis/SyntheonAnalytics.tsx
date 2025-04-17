
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, BarChart, PieChart } from "@/components/ui/custom-charts";
import { CallRecord } from "@/services/mcube";

interface SyntheonAnalyticsProps {
  call: CallRecord;
}

const SyntheonAnalytics: React.FC<SyntheonAnalyticsProps> = ({ call }) => {
  if (!call || !call.analysis) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>No AI analysis data available for this call.</p>
        </CardContent>
      </Card>
    );
  }

  const { analysis } = call;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle>Syntheon.ai Call Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metrics">
          <TabsList className="mb-4">
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Script Adherence</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{analysis.scriptAdherence}%</span>
                      <span className="text-muted-foreground">Target: 90%</span>
                    </div>
                    <Progress value={analysis.scriptAdherence} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Dead Air</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{analysis.deadAirPercentage}% ({analysis.deadAirSeconds}s)</span>
                      <span className="text-muted-foreground">Target: &lt;3%</span>
                    </div>
                    <Progress 
                      value={Math.min(analysis.deadAirPercentage * 10, 100)} 
                      className={`h-2 ${analysis.deadAirPercentage > 3 ? 'bg-amber-100' : ''}`}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Talk Speed</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{analysis.agentMetrics?.talkSpeed || 0} WPM</span>
                      <span className="text-muted-foreground">Target: 120-160</span>
                    </div>
                    <Progress 
                      value={Math.min(((analysis.agentMetrics?.talkSpeed || 0) / 160) * 100, 100)} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Empathy Score</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{analysis.agentMetrics?.empathyScore || 0}/100</span>
                      <span className="text-muted-foreground">Target: ≥80</span>
                    </div>
                    <Progress 
                      value={analysis.agentMetrics?.empathyScore || 0} 
                      className={`h-2 ${(analysis.agentMetrics?.empathyScore || 0) < 70 ? 'bg-amber-100' : ''}`}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Conversation Flow</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Questions Asked</span>
                      <span className="font-semibold">{analysis.agentMetrics?.questionCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Interruptions</span>
                      <span className={`font-semibold ${(analysis.agentMetrics?.interruptionCount || 0) > 2 ? 'text-amber-600' : ''}`}>
                        {analysis.agentMetrics?.interruptionCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Call Duration</span>
                      <span className="font-semibold">{Math.floor((call.duration || 0) / 60)}m {(call.duration || 0) % 60}s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Key Insights</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {analysis.keyInsights?.map((insight, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="mr-2 text-primary">•</span> {insight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sentiment">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Sentiment Distribution</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <PieChart 
                    data={[
                      { name: 'Positive', value: analysis.sentimentBreakdown?.positive || 0 },
                      { name: 'Neutral', value: analysis.sentimentBreakdown?.neutral || 0 },
                      { name: 'Negative', value: analysis.sentimentBreakdown?.negative || 0 },
                    ]}
                    category="value"
                    index="name"
                    colors={['#4ade80', '#94a3b8', '#f87171']}
                    height={220}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Sentiment Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Positive Tone</span>
                        <span>{analysis.sentimentBreakdown?.positive || 0}%</span>
                      </div>
                      <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-green-500 rounded-full" 
                          style={{ width: `${analysis.sentimentBreakdown?.positive || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Neutral Tone</span>
                        <span>{analysis.sentimentBreakdown?.neutral || 0}%</span>
                      </div>
                      <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-slate-400 rounded-full" 
                          style={{ width: `${analysis.sentimentBreakdown?.neutral || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Negative Tone</span>
                        <span>{analysis.sentimentBreakdown?.negative || 0}%</span>
                      </div>
                      <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-red-400 rounded-full" 
                          style={{ width: `${analysis.sentimentBreakdown?.negative || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">Historical performance data will appear here as more calls are analyzed.</p>
                <LineChart
                  data={[
                    { date: 'Mon', Adherence: 85, Empathy: 76 },
                    { date: 'Tue', Adherence: 88, Empathy: 80 },
                    { date: 'Wed', Adherence: 91, Empathy: 84 },
                    { date: 'Thu', Adherence: 89, Empathy: 82 },
                    { date: 'Fri', Adherence: analysis.scriptAdherence || 90, Empathy: analysis.agentMetrics?.empathyScore || 85 },
                  ]}
                  categories={['Adherence', 'Empathy']}
                  index="date"
                  height={250}
                  valueFormatter={(value) => `${value}%`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SyntheonAnalytics;
