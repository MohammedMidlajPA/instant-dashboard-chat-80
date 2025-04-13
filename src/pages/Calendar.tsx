
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data for upcoming calls
const upcomingCalls = [
  { 
    id: 1, 
    contact: 'John Smith', 
    company: 'ABC Corporation', 
    date: '2023-05-16', 
    time: '10:00 AM', 
    duration: '30 min',
    type: 'Demo Call'
  },
  { 
    id: 2, 
    contact: 'Sarah Johnson', 
    company: 'XYZ Industries', 
    date: '2023-05-16', 
    time: '02:30 PM', 
    duration: '45 min',
    type: 'Follow-up'
  },
  { 
    id: 3, 
    contact: 'Michael Brown', 
    company: 'Acme Inc.', 
    date: '2023-05-17', 
    time: '11:15 AM', 
    duration: '30 min',
    type: 'Initial Consultation'
  },
  { 
    id: 4, 
    contact: 'Emily Wilson', 
    company: 'Tech Solutions', 
    date: '2023-05-18', 
    time: '09:00 AM', 
    duration: '60 min',
    type: 'Product Demo'
  },
  { 
    id: 5, 
    contact: 'David Lee', 
    company: 'Global Enterprises', 
    date: '2023-05-19', 
    time: '03:45 PM', 
    duration: '30 min',
    type: 'Follow-up'
  }
];

const Calendar = () => {
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();
  
  // Generate days for the current month's calendar
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  
  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDay + 1;
    if (dayNumber <= 0 || dayNumber > daysInMonth) {
      return { day: '', date: null, isCurrentMonth: false };
    }
    
    const date = new Date(today.getFullYear(), today.getMonth(), dayNumber);
    const isToday = dayNumber === today.getDate();
    
    // Find events for this day
    const events = upcomingCalls.filter(call => {
      const callDate = new Date(call.date);
      return callDate.getDate() === dayNumber && 
             callDate.getMonth() === today.getMonth() && 
             callDate.getFullYear() === today.getFullYear();
    });
    
    return { 
      day: dayNumber.toString(), 
      date, 
      isCurrentMonth: true, 
      isToday,
      events 
    };
  });
  
  const weeks = [];
  for (let i = 0; i < 6; i++) {
    weeks.push(days.slice(i * 7, (i + 1) * 7));
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">Manage your calls and meetings</p>
          </div>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Schedule Call
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{`${currentMonth} ${currentYear}`}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-px bg-gray-200">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center font-medium text-sm bg-white">
                      {day}
                    </div>
                  ))}
                  
                  {weeks.map((week, weekIndex) => (
                    <React.Fragment key={weekIndex}>
                      {week.map((day, dayIndex) => (
                        <div 
                          key={`${weekIndex}-${dayIndex}`}
                          className={`min-h-[100px] p-2 bg-white ${day.isToday ? 'border-2 border-blue-500' : ''} ${!day.isCurrentMonth ? 'text-gray-400' : ''}`}
                        >
                          {day.day && (
                            <>
                              <div className="text-right">
                                {day.day}
                              </div>
                              <div className="mt-1 space-y-1">
                                {day.events?.map((event) => (
                                  <div 
                                    key={event.id}
                                    className="bg-blue-100 text-blue-800 p-1 text-xs rounded truncate"
                                  >
                                    {event.time} - {event.contact}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Upcoming Calls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingCalls.map((call) => (
                  <div key={call.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex flex-col items-center justify-center bg-blue-100 rounded-lg p-2 h-16 w-16 text-blue-800">
                      <span className="text-sm font-bold">{new Date(call.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-xl font-bold">{new Date(call.date).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{call.contact}</h4>
                      <p className="text-sm text-gray-500">{call.company}</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                          {call.time} ({call.duration})
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {call.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
