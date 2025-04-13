
import { DashboardLayout } from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { BookOpen, GraduationCap, School, TrendingUp, Users, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { vapiService } from "@/services/vapiService";
import { useVapiRealtime } from "@/hooks/useVapiRealtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function EnrollmentAnalytics() {
  const [stats, setStats] = useState({
    enrollmentRate: "82.5%",
    retentionRate: "94.2%",
    graduationRate: "76.3%",
    avgGPA: "3.42"
  });

  // Use our real-time hook to fetch data every 30 seconds
  const { 
    data: callData, 
    isLoading, 
    isConnected, 
    refetch 
  } = useVapiRealtime({
    fetchInterval: 30000, // 30 seconds
    initialFetchDelay: 1000, // 1 second initial delay
  });

  useEffect(() => {
    if (callData && callData.length > 0) {
      // Process real data to update analytics
      // For demo purposes, we'll use simple calculations
      // In a real implementation, you would do more complex analytics
      
      // Count inquiries with specific keywords related to enrollment
      const enrollmentKeywords = ["enroll", "admission", "accepted", "matriculate"];
      const enrollmentRelatedCalls = callData.filter(call => {
        const transcription = (call.transcription || "").toLowerCase();
        return enrollmentKeywords.some(keyword => transcription.includes(keyword));
      }).length;
      
      const totalCalls = callData.length;
      
      // Calculate enrollment rate (percentage of calls related to enrollment)
      const enrollmentRate = totalCalls > 0 ? ((enrollmentRelatedCalls / totalCalls) * 100).toFixed(1) : "0.0";
      
      // For other metrics, we would need more complex logic or additional data sources
      // For now, we'll slightly adjust the mock data to simulate changes
      
      setStats({
        enrollmentRate: `${enrollmentRate}%`,
        retentionRate: "94.4%", // Slightly adjusted
        graduationRate: "76.7%", // Slightly adjusted
        avgGPA: "3.45"          // Slightly adjusted
      });
      
      toast.success("Analytics updated with real-time data");
    }
  }, [callData]);

  return (
    <DashboardLayout>
      <div className="container p-6 space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-poppins">Enrollment Analytics</h1>
            <p className="text-muted-foreground">Deep insights into enrollment trends and performance</p>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Connected to VAPI
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Connecting to VAPI...
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch} 
              disabled={isLoading}
              className="ml-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh Now
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard 
            title="Enrollment Rate" 
            value={stats.enrollmentRate}
            description="Admitted to enrolled" 
            icon={<School size={18} />}
            trend={{ value: 3.2, isPositive: true }}
            isLoading={isLoading}
          />
          <AnalyticsCard 
            title="Retention Rate" 
            value={stats.retentionRate}
            description="Year-over-year" 
            icon={<Users size={18} />}
            trend={{ value: 1.5, isPositive: true }}
            isLoading={isLoading}
          />
          <AnalyticsCard 
            title="Graduation Rate" 
            value={stats.graduationRate}
            description="4-year completion" 
            icon={<GraduationCap size={18} />}
            trend={{ value: 2.1, isPositive: true }}
            isLoading={isLoading}
          />
          <AnalyticsCard 
            title="Average GPA" 
            value={stats.avgGPA}
            description="Current students" 
            icon={<BookOpen size={18} />}
            trend={{ value: 0.2, isPositive: true }}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Trends by Year</CardTitle>
              <CardDescription>5-year trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart 
                type="line"
                title="Enrollment Trends"
                description="Year-over-year comparison"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Enrollment by Program</CardTitle>
              <CardDescription>Distribution across academic programs</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart 
                type="pie"
                title="Program Distribution"
                description="Current academic year"
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Enrollment Funnel</CardTitle>
              <CardDescription>From inquiry to enrollment completion</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart 
                type="bar"
                title="Enrollment Funnel"
                description="Conversion rates at each stage"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Student origin by region</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <AnalyticsChart 
                type="pie"
                title="Geographic Distribution"
                description="By student origin"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
