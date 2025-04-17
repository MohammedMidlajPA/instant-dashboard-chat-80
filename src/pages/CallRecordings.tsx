
import { DashboardLayout } from "@/components/DashboardLayout";

const CallRecordings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Call Recordings</h1>
            <p className="text-muted-foreground">View and manage your call recordings</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            The Call Recordings feature is being updated. Please check back later.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CallRecordings;
