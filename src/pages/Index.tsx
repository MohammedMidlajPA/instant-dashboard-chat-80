
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LineChart } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { mcubeService, CallRecord } from '@/services/mcube';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Phone, PhoneIncoming, PhoneOutgoing, Calendar, Clock } from 'lucide-react';
import { McubeCallLogsList } from '@/components/CallAnalysis/McubeCallLogsList';

const IndexPage = () => {
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecentCalls = async () => {
    try {
      setIsLoading(true);
      const calls = await mcubeService.getCalls({ limit: 5 });
      setRecentCalls(calls);
    } catch (error) {
      console.error('Error fetching recent calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentCalls();
  }, []);

  // Calculate stats from the calls data
  const totalCalls = recentCalls.length;
  const inboundCalls = recentCalls.filter(call => call.direction === 'inbound').length;
  const outboundCalls = recentCalls.filter(call => call.direction === 'outbound').length;

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your call center dashboard</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold">{totalCalls}</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Phone className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inbound Calls</p>
                <p className="text-2xl font-bold">{inboundCalls}</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <PhoneIncoming className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outbound Calls</p>
                <p className="text-2xl font-bold">{outboundCalls}</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <PhoneOutgoing className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Call Duration</p>
                <p className="text-2xl font-bold">
                  {formatDuration(
                    totalCalls > 0 
                      ? recentCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / totalCalls 
                      : 0
                  )}
                </p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Call Volume</CardTitle>
              <CardDescription>Call trends over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {/* Call volume chart would go here */}
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Call volume chart visualization
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent Calls</CardTitle>
              <CardDescription>Latest call activity</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <McubeCallLogsList />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IndexPage;
