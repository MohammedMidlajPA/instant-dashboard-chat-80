
import { DashboardLayout } from "@/components/DashboardLayout";

export default function EnrollmentAnalytics() {
  return (
    <DashboardLayout>
      <div className="container p-6 space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-poppins">Enrollment Analytics</h1>
            <p className="text-muted-foreground">Deep insights into enrollment trends and performance</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            The Enrollment Analytics feature is being updated. Please check back later.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
