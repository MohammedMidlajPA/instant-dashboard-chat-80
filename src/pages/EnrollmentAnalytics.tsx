
import { DashboardLayout } from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { BookOpen, GraduationCap, School, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { vapiService } from "@/services/vapiService";

export default function EnrollmentAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrollmentRate: "82.5%",
    retentionRate: "94.2%",
    graduationRate: "76.3%",
    avgGPA: "3.42"
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Get the assistant ID from the service
        const assistantId = vapiService.getAssistantId();
        
        if (!assistantId) {
          toast.error("Assistant ID not configured. Using sample data.");
          setLoading(false);
          return;
        }
        
        // In a real implementation, we would fetch enrollment analytics data from an API
        // For now, we're just simulating it with a timeout
        setTimeout(() => {
          setLoading(false);
          toast.success("Analytics data loaded successfully");
        }, 1500);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast.error("Could not fetch analytics data. Using sample data instead.");
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, []);

  return (
    <DashboardLayout>
      <div className="container p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-poppins">Enrollment Analytics</h1>
          <p className="text-muted-foreground">Deep insights into enrollment trends and performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard 
            title="Enrollment Rate" 
            value={stats.enrollmentRate}
            description="Admitted to enrolled" 
            icon={<School size={18} />}
            trend={{ value: 3.2, isPositive: true }}
            isLoading={loading}
          />
          <AnalyticsCard 
            title="Retention Rate" 
            value={stats.retentionRate}
            description="Year-over-year" 
            icon={<Users size={18} />}
            trend={{ value: 1.5, isPositive: true }}
            isLoading={loading}
          />
          <AnalyticsCard 
            title="Graduation Rate" 
            value={stats.graduationRate}
            description="4-year completion" 
            icon={<GraduationCap size={18} />}
            trend={{ value: 2.1, isPositive: true }}
            isLoading={loading}
          />
          <AnalyticsCard 
            title="Average GPA" 
            value={stats.avgGPA}
            description="Current students" 
            icon={<BookOpen size={18} />}
            trend={{ value: 0.2, isPositive: true }}
            isLoading={loading}
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
