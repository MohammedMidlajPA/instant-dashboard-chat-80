
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Phone, Plus, Clock, User, Calendar as CalendarIcon, Video, BookOpen, ArrowUpRight } from "lucide-react";
import { mcubeService } from "@/services/mcube";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  id: string;
  title: string;
  phone: string;
  time: string;
  date: Date;
  duration: number;
  notes?: string;
  type: 'call' | 'video' | 'in-person';
  bookedBy: 'voice-agent' | 'manual' | 'self-service';
  status: 'confirmed' | 'tentative' | 'canceled';
  googleCalendarId?: string;
  contactName?: string;
}

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load appointments
  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would come from an API
        // For now, we'll use mock data
        setAppointments([
          {
            id: "appt-1",
            title: "Call with John Smith",
            phone: "+15551234567",
            time: "10:00 AM",
            date: new Date(),
            duration: 30,
            notes: "Discuss enrollment options for Fall 2025",
            type: 'call',
            bookedBy: 'voice-agent',
            status: 'confirmed',
            googleCalendarId: "evt_123456",
            contactName: "John Smith"
          },
          {
            id: "appt-2",
            title: "Follow-up with Sarah Johnson",
            phone: "+15559876543",
            time: "2:30 PM",
            date: new Date(),
            duration: 15,
            notes: "Review scholarship information",
            type: 'call',
            bookedBy: 'manual',
            status: 'confirmed',
            contactName: "Sarah Johnson"
          },
          {
            id: "appt-3",
            title: "Virtual campus tour for David Lee",
            phone: "+15557654321",
            time: "4:00 PM",
            date: new Date(Date.now() + 86400000), // Tomorrow
            duration: 45,
            type: 'video',
            bookedBy: 'voice-agent',
            status: 'confirmed',
            googleCalendarId: "evt_123457",
            contactName: "David Lee"
          }
        ]);
      } catch (error) {
        console.error("Error loading appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAppointments();
  }, []);

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

  // Get the selected date's appointments
  const getAppointmentsForDate = () => {
    if (!date) return [];
    
    return appointments.filter(appointment => {
      const apptDate = new Date(appointment.date);
      return apptDate.getDate() === date.getDate() &&
             apptDate.getMonth() === date.getMonth() &&
             apptDate.getFullYear() === date.getFullYear();
    });
  };

  // Open a meeting URL
  const openMeetingUrl = (id: string) => {
    // In a real app, this would use the actual meeting URL
    window.open(`https://meet.google.com/${id}`, '_blank');
  };

  // Get badge color based on appointment type
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'call':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200"><Phone className="h-3 w-3 mr-1" /> Phone</Badge>;
      case 'video':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200"><Video className="h-3 w-3 mr-1" /> Video</Badge>;
      case 'in-person':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200"><User className="h-3 w-3 mr-1" /> In-Person</Badge>;
      default:
        return null;
    }
  };

  // Get badge for how appointment was booked
  const getBookedByBadge = (bookedBy: string) => {
    switch (bookedBy) {
      case 'voice-agent':
        return <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">AI Voice Agent</Badge>;
      case 'manual':
        return <Badge variant="outline" className="bg-slate-50 text-slate-800 border-slate-200">Manual Entry</Badge>;
      case 'self-service':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">Self-Service</Badge>;
      default:
        return null;
    }
  };

  const selectedDateAppointments = getAppointmentsForDate();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Call Calendar</h1>
            <p className="text-muted-foreground">Schedule and manage your appointments</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
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
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Legend</h3>
                <div className="flex flex-col space-y-2">
                  {getTypeBadge('call')}
                  {getTypeBadge('video')}
                  {getTypeBadge('in-person')}
                </div>
                <Separator className="my-2" />
                <div className="flex flex-col space-y-2">
                  {getBookedByBadge('voice-agent')}
                  {getBookedByBadge('manual')}
                  {getBookedByBadge('self-service')}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {date ? format(date, "EEEE, MMMM do, yyyy") : "Select a Date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : selectedDateAppointments.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex justify-between items-start p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="font-medium">{appointment.title}</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {getTypeBadge(appointment.type)}
                          {getBookedByBadge(appointment.bookedBy)}
                          {appointment.status === 'confirmed' && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>
                          )}
                        </div>
                        <div className="flex space-x-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {appointment.time} ({appointment.duration} min)
                          </span>
                          {appointment.contactName && (
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {appointment.contactName}
                            </span>
                          )}
                          {appointment.phone && (
                            <span className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {appointment.phone}
                            </span>
                          )}
                        </div>
                        {appointment.googleCalendarId && (
                          <div className="flex items-center text-sm text-blue-600">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Added to Google Calendar
                          </div>
                        )}
                        {appointment.notes && (
                          <p className="text-sm mt-2 text-gray-600">{appointment.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        {appointment.type === 'call' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMakeCall(appointment.phone)}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                        )}
                        {appointment.type === 'video' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openMeetingUrl(appointment.id)}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join Meeting
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                        >
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No scheduled appointments for this date</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
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

import { Separator } from "@/components/ui/separator";
export default Calendar;
