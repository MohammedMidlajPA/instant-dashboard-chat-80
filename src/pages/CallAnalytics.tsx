
import React from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";

const CallAnalytics: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="container p-6 space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Call Analytics</h1>
            <p className="text-muted-foreground">Analyze your call data and performance</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            The Call Analytics feature is being updated. Please check back later.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CallAnalytics;
