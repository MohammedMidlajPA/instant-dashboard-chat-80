import { DashboardLayout } from "@/components/DashboardLayout";
import { ChatInterface } from "@/components/ChatInterface";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { Users, GraduationCap, TrendingUp, Activity, PhoneCall, BookOpen, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { vapiService } from "@/services/vapiService";
import { toast } from "sonner";
import { useVapiRealtime } from "@/hooks/useVapiRealtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [stats, setStats] = useState({
    totalStudents: "12,361",
    inquiries: "932",
    conversionRate: "3.24%",
    activeApplicants: "521"
  });

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
      const uniqueContacts = new Set(callData.map(call => call.contact_name || call.customer_phone)).size;
      const totalCalls = callData.length;
      
      const applicationKeywords = ["application", "apply", "applied", "submitted", "enrollment"];
      const applicationCalls = callData.filter(call => {
        const transcription = (call.transcription || "").toLowerCase();
        return applicationKeywords.some(keyword => transcription.includes(keyword));
      }).length;
      
      const conversionRate = totalCalls > 0 ? ((applicationCalls / totalCalls) * 100).toFixed(2) : "0.00";
      
      setStats({
        totalStudents: uniqueContacts.toString(),
        inquiries: totalCalls.toString(),
        conversionRate: `${conversionRate}%`,
        activeApplicants: applicationCalls.toString()
      });
      
      toast.success("Dashboard updated with real-time data");
    }
  }, [callData]);

  return (
    <DashboardLayout>
      <div className="container p-6 space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-poppins">College Dashboard</h1>
            <p className="text-muted-foreground">Student recruitment and enrollment insights</p>
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
            title="Total Students" 
            value={stats.totalStudents}
            description="All contacts in database" 
            icon={<Users size={18} />}
            trend={{ value: 12.5, isPositive: true }}
            isLoading={isLoading}
          />
          <AnalyticsCard 
            title="Student Inquiries" 
            value={stats.inquiries}
            description="Last 30 days" 
            icon={<PhoneCall size={18} />}
            trend={{ value: 8.2, isPositive: true }}
            isLoading={isLoading}
          />
          <AnalyticsCard 
            title="Inquiry to Application" 
            value={stats.conversionRate}
            description="Conversion rate" 
            icon={<TrendingUp size={18} />}
            trend={{ value: 1.1, isPositive: false }}
            isLoading={isLoading}
          />
          <AnalyticsCard 
            title="Active Applicants" 
            value={stats.activeApplicants}
            description="Current application cycle" 
            icon={<GraduationCap size={18} />}
            trend={{ value: 4.3, isPositive: true }}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AnalyticsChart 
              type="line"
              title="Enrollment Trends"
              description="Monthly inquiries and applications"
            />
          </div>
          <div>
            <AnalyticsChart 
              type="pie"
              title="Inquiry Distribution"
              description="By program of interest"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AnalyticsChart 
              type="bar"
              title="Program Popularity"
              description="Applications by academic program"
            />
          </div>
          <div className="lg:col-span-1 h-[500px]">
            <div className="bg-white rounded-lg shadow-card h-full overflow-hidden">
              <div className="border-b p-4">
                <h3 className="text-lg font-semibold">Chat with Admissions AI</h3>
                <p className="text-sm text-muted-foreground">Ask questions about student metrics</p>
              </div>
              <div className="h-[calc(100%-64px)]">
                <ChatInterface />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
