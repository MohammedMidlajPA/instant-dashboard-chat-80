
import { DashboardLayout } from "@/components/DashboardLayout";
import { ChatInterface } from "@/components/ChatInterface";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { Users, GraduationCap, TrendingUp, Activity, PhoneCall, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { vapiService } from "@/services/vapiService";
import { toast } from "sonner";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: "12,361",
    inquiries: "932",
    conversionRate: "3.24%",
    activeApplicants: "521"
  });

  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        setLoading(true);
        
        // Get the assistant ID from the service
        const assistantId = vapiService.getAssistantId();
        
        if (!assistantId) {
          toast.error("Assistant ID not configured. Using sample data.");
          setLoading(false);
          return;
        }
        
        // Attempt to fetch call data from VAPI with the proper assistantId
        const callData = await vapiService.getCallAnalysis({
          assistantId,
          limit: 100
        });
        
        if (callData && callData.length > 0) {
          // Calculate real stats from the data
          const uniqueContacts = new Set(callData.map(call => call.contact_name || call.customer_phone)).size;
          const totalCalls = callData.length;
          
          // Count inquiries that converted to applications
          const applicationKeywords = ["application", "apply", "applied", "submitted", "enrollment"];
          const applicationCalls = callData.filter(call => {
            const transcription = (call.transcription || "").toLowerCase();
            return applicationKeywords.some(keyword => transcription.includes(keyword));
          }).length;
          
          // Calculate conversion rate
          const conversionRate = totalCalls > 0 ? ((applicationCalls / totalCalls) * 100).toFixed(2) : "0.00";
          
          // Update stats with real data
          setStats({
            totalStudents: uniqueContacts.toString(),
            inquiries: totalCalls.toString(),
            conversionRate: `${conversionRate}%`,
            activeApplicants: applicationCalls.toString()
          });
          
          toast.success("Dashboard updated with real-time data");
        }
      } catch (error) {
        console.error("Error fetching real-time data:", error);
        toast.error("Could not fetch real-time data. Using sample data instead.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRealTimeData();
  }, []);

  return (
    <DashboardLayout>
      <div className="container p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-poppins">College Dashboard</h1>
          <p className="text-muted-foreground">Student recruitment and enrollment insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard 
            title="Total Students" 
            value={stats.totalStudents}
            description="All contacts in database" 
            icon={<Users size={18} />}
            trend={{ value: 12.5, isPositive: true }}
            isLoading={loading}
          />
          <AnalyticsCard 
            title="Student Inquiries" 
            value={stats.inquiries}
            description="Last 30 days" 
            icon={<PhoneCall size={18} />}
            trend={{ value: 8.2, isPositive: true }}
            isLoading={loading}
          />
          <AnalyticsCard 
            title="Inquiry to Application" 
            value={stats.conversionRate}
            description="Conversion rate" 
            icon={<TrendingUp size={18} />}
            trend={{ value: 1.1, isPositive: false }}
            isLoading={loading}
          />
          <AnalyticsCard 
            title="Active Applicants" 
            value={stats.activeApplicants}
            description="Current application cycle" 
            icon={<GraduationCap size={18} />}
            trend={{ value: 4.3, isPositive: true }}
            isLoading={loading}
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
