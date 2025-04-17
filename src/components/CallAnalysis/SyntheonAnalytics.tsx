import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, BarChart, PieChart } from "@/components/ui/custom-charts";
import { CallRecord } from "@/services/mcube";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";

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
  
  const talkRatio = analysis.agentTalkRatio || 
                   (analysis.agentMetrics?.talkRatio) || 0;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex justify-between items-center">
        <CardTitle>Huerize AI Call Analysis</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metrics" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="metrics" className="flex-1">Performance Metrics</TabsTrigger>
            <TabsTrigger value="sentiment" className="flex-1">Sentiment Analysis</TabsTrigger>
            <TabsTrigger value="trends" className="flex-1">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-md transition-shadow bg-slate-50">
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
                    <p className="text-xs text-muted-foreground mt-2">
                      {analysis.scriptAdherence >= 90 
                        ? "Excellent adherence to the script." 
                        : analysis.scriptAdherence >= 75 
                        ? "Good adherence, minor improvements needed."
                        : "Needs improvement in following the script."}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow bg-slate-50">
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
                    <p className="text-xs text-muted-foreground mt-2">
                      {analysis.deadAirPercentage <= 3 
                        ? "Minimal dead air, good conversation flow." 
                        : analysis.deadAirPercentage <= 7 
                        ? "Some silences detected, could improve conversation flow."
                        : "Significant dead air detected, conversation flow needs improvement."}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow bg-slate-50">
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
                    <p className="text-xs text-muted-foreground mt-2">
                      {(analysis.agentMetrics?.talkSpeed || 0) >= 120 && (analysis.agentMetrics?.talkSpeed || 0) <= 160
                        ? "Optimal speaking pace for clear communication." 
                        : (analysis.agentMetrics?.talkSpeed || 0) < 120
                        ? "Speech pace is slower than optimal, could be more engaging."
                        : "Speech pace is faster than optimal, could affect clarity."}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow bg-slate-50">
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
                    <p className="text-xs text-muted-foreground mt-2">
                      {(analysis.agentMetrics?.empathyScore || 0) >= 80 
                        ? "Excellent empathy shown throughout the call." 
                        : (analysis.agentMetrics?.empathyScore || 0) >= 60 
                        ? "Good empathy, with some room for improvement."
                        : "Needs improvement in showing empathy to callers."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-md transition-shadow bg-slate-50">
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Agent Talk Ratio</span>
                      <span className="font-semibold">{talkRatio}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow bg-slate-50">
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
                    {(!analysis.keyInsights || analysis.keyInsights.length === 0) && (
                      <li className="text-sm text-muted-foreground">No key insights available for this call.</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sentiment">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-md transition-shadow bg-slate-50">
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
              
              <Card className="hover:shadow-md transition-shadow bg-slate-50">
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
            
            <div className="mt-4">
              <Card className="hover:shadow-md transition-shadow bg-slate-50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Sentiment Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={[
                      { time: '0:00', sentiment: 50 },
                      { time: '1:00', sentiment: 60 },
                      { time: '2:00', sentiment: 45 },
                      { time: '3:00', sentiment: 70 },
                      { time: '4:00', sentiment: 55 },
                      { time: '5:00', sentiment: 80 },
                    ]}
                    categories={['sentiment']}
                    index="time"
                    valueFormatter={(value) => `${value}%`}
                    height={200}
                    colors={['#3b82f6']}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <Card className="hover:shadow-md transition-shadow bg-slate-50">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">Historical performance data for this agent compared to team average.</p>
                <LineChart
                  data={[
                    { date: 'Mon', Adherence: 85, Empathy: 76, TeamAvg: 80 },
                    { date: 'Tue', Adherence: 88, Empathy: 80, TeamAvg: 81 },
                    { date: 'Wed', Adherence: 91, Empathy: 84, TeamAvg: 82 },
                    { date: 'Thu', Adherence: 89, Empathy: 82, TeamAvg: 83 },
                    { date: 'Fri', Adherence: analysis.scriptAdherence || 90, Empathy: analysis.agentMetrics?.empathyScore || 85, TeamAvg: 84 },
                  ]}
                  categories={['Adherence', 'Empathy', 'TeamAvg']}
                  index="date"
                  height={250}
                  valueFormatter={(value) => `${value}%`}
                  colors={['#3b82f6', '#8b5cf6', '#94a3b8']}
                />
              </CardContent>
            </Card>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-md transition-shadow bg-slate-50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Word Cloud</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 text-center bg-slate-100 rounded-md h-[200px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Word cloud visualization would appear here in a production environment.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow bg-slate-50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Topic Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={[
                      { topic: 'Pricing', mentions: 5 },
                      { topic: 'Features', mentions: 8 },
                      { topic: 'Support', mentions: 3 },
                      { topic: 'Feedback', mentions: 6 },
                    ]}
                    categories={['mentions']}
                    index="topic"
                    height={200}
                    valueFormatter={(value) => `${value}`}
                    colors={['#8b5cf6']}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SyntheonAnalytics;
