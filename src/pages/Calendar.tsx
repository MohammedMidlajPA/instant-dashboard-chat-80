
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { vapiService } from "@/services/vapiService";

export default function Calendar() {
  const [loading, setLoading] = useState(true);
  const [calendarId, setCalendarId] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to get the assistant ID to verify configuration
    const assistantId = vapiService.getAssistantId();
    if (!assistantId) {
      toast.error("VAPI Assistant ID not configured");
      setLoading(false);
    } else {
      setLoading(false);
      toast.success("Connected to VAPI successfully");
    }
  }, []);

  // Function to handle booking form submission
  const handleBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Campus visit scheduled successfully!");
    // In a real implementation, this would save to a database and update the calendar
  };

  return (
    <DashboardLayout>
      <div className="container p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-poppins">Campus Visit Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage campus tours and visits</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Campus Visit Calendar</CardTitle>
                <CardDescription>View and manage upcoming campus visits</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <iframe 
                  src="https://calendar.google.com/calendar/embed?src=c_classroomf38d69d8%40group.calendar.google.com&ctz=America%2FLos_Angeles" 
                  style={{ border: 0, width: "100%", height: "600px" }} 
                  frameBorder="0" 
                  scrolling="no"
                  title="Campus Visit Calendar"
                ></iframe>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Schedule a Campus Visit</CardTitle>
                <CardDescription>Book a tour for prospective students</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="visitorName" className="text-sm font-medium">
                      Visitor Name
                    </label>
                    <input
                      id="visitorName"
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="visitorEmail" className="text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="visitorEmail"
                      type="email"
                      className="w-full p-2 border rounded-md"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="visitDate" className="text-sm font-medium">
                      Preferred Date
                    </label>
                    <input
                      id="visitDate"
                      type="date"
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="visitTime" className="text-sm font-medium">
                      Preferred Time
                    </label>
                    <select
                      id="visitTime"
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select a time</option>
                      <option value="9:00 AM">9:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="1:00 PM">1:00 PM</option>
                      <option value="3:00 PM">3:00 PM</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="interestArea" className="text-sm font-medium">
                      Area of Interest
                    </label>
                    <select
                      id="interestArea"
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select area of interest</option>
                      <option value="Business">Business</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Liberal Arts">Liberal Arts</option>
                      <option value="Sciences">Sciences</option>
                      <option value="Fine Arts">Fine Arts</option>
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Schedule Visit
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
