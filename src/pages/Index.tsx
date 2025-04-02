
import { DashboardLayout } from "@/components/DashboardLayout";
import { ChatInterface } from "@/components/ChatInterface";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { Users, DollarSign, TrendingUp, Activity } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="container p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-poppins">Welcome to ChatDash</h1>
          <p className="text-muted-foreground">Analyze your data through conversation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard 
            title="Total Users" 
            value="12,361"
            description="Last 30 days" 
            icon={<Users size={18} />}
            trend={{ value: 12.5, isPositive: true }}
          />
          <AnalyticsCard 
            title="Revenue" 
            value="$48,294"
            description="Last 30 days" 
            icon={<DollarSign size={18} />}
            trend={{ value: 8.2, isPositive: true }}
          />
          <AnalyticsCard 
            title="Conversion Rate" 
            value="3.24%"
            description="Last 30 days" 
            icon={<TrendingUp size={18} />}
            trend={{ value: 1.1, isPositive: false }}
          />
          <AnalyticsCard 
            title="Active Users" 
            value="9,271"
            description="Last 30 days" 
            icon={<Activity size={18} />}
            trend={{ value: 4.3, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AnalyticsChart 
              type="line"
              title="Revenue Over Time"
              description="Monthly revenue in the last 7 months"
            />
          </div>
          <div>
            <AnalyticsChart 
              type="pie"
              title="Traffic Distribution"
              description="Device breakdown for visitors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AnalyticsChart 
              type="bar"
              title="Weekly Performance"
              description="Users and sales data for the past week"
            />
          </div>
          <div className="lg:col-span-1 h-[500px]">
            <div className="bg-white rounded-lg shadow-card h-full overflow-hidden">
              <div className="border-b p-4">
                <h3 className="text-lg font-semibold">Chat with Data</h3>
                <p className="text-sm text-muted-foreground">Ask questions about your metrics</p>
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
