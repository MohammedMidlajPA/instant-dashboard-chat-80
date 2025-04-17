
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Phone, Plus, Clock, User } from "lucide-react";
import { mcubeService } from "@/services/mcube";
import { format } from "date-fns";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [scheduledCalls] = useState<any[]>([
    {
      id: 1,
      title: "Call with John Smith",
      phone: "+15551234567",
      time: "10:00 AM",
      date: new Date(),
      duration: 30,
      notes: "Discuss new product features"
    },
    {
      id: 2,
      title: "Follow-up with Sarah Johnson",
      phone: "+15559876543",
      time: "2:30 PM",
      date: new Date(),
      duration: 15,
      notes: "Review proposal"
    }
  ]);

  // Handle making a call
  const handleMakeCall = async (phoneNumber: string) => {
    try {
      const agentPhone = localStorage.getItem("agent_phone") || prompt("Please enter your phone number:");
      
      if (!agentPhone) {
        return;
      }
      
      localStorage.setItem("agent_phone", agentPhone);
      await mcubeService.makeOutboundCall(agentPhone, phoneNumber);
      
    } catch (error) {
      console.error("Error making call:", error);
    }
  };

  // Get the selected date's scheduled calls
  const getScheduledCallsForDate = () => {
    if (!date) return [];
    
    return scheduledCalls.filter(call => {
      const callDate = new Date(call.date);
      return callDate.getDate() === date.getDate() &&
             callDate.getMonth() === date.getMonth() &&
             callDate.getFullYear() === date.getFullYear();
    });
  };

  const selectedDateCalls = getScheduledCallsForDate();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Call Calendar</h1>
            <p className="text-muted-foreground">Schedule and manage your calls</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Scheduled Call
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {date ? format(date, "EEEE, MMMM do, yyyy") : "Select a Date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateCalls.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateCalls.map((call) => (
                    <div key={call.id} className="flex justify-between items-start p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{call.title}</div>
                        <div className="flex space-x-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {call.time} ({call.duration} min)
                          </span>
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {call.phone}
                          </span>
                        </div>
                        {call.notes && (
                          <p className="text-sm mt-2">{call.notes}</p>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMakeCall(call.phone)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No scheduled calls for this date</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Call
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
