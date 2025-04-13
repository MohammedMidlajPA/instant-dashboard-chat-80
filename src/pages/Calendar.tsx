
import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Calendar events
const events = [
  {
    id: 1,
    title: "Call with John",
    date: new Date(2025, 3, 14, 10, 0),
    type: "call",
    duration: 30,
  },
  {
    id: 2,
    title: "Follow-up with Sarah",
    date: new Date(2025, 3, 14, 14, 0),
    type: "call",
    duration: 15,
  },
  {
    id: 3,
    title: "Pitch to ABC Corp",
    date: new Date(2025, 3, 15, 11, 0),
    type: "meeting",
    duration: 60,
  },
  {
    id: 4,
    title: "Review Q2 Targets",
    date: new Date(2025, 3, 16, 9, 0),
    type: "meeting",
    duration: 45,
  },
  {
    id: 5,
    title: "Demo for XYZ Inc",
    date: new Date(2025, 3, 16, 15, 30),
    type: "demo",
    duration: 60,
  },
  {
    id: 6,
    title: "Training Session",
    date: new Date(2025, 3, 17, 13, 0),
    type: "training",
    duration: 120,
  },
];

// Helper for calendar days
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Helper to get days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper to get day of week for first day of month
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// Get event color based on type
const getEventColor = (type: string) => {
  switch (type) {
    case "call":
      return "bg-blue-100 text-blue-800";
    case "meeting":
      return "bg-purple-100 text-purple-800";
    case "demo":
      return "bg-green-100 text-green-800";
    case "training":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "call",
    duration: 30,
  });

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return events.filter(event => 
      event.date.getDate() === day && 
      event.date.getMonth() === currentMonth && 
      event.date.getFullYear() === currentYear
    );
  };

  // Select a date
  const handleSelectDate = (day: number) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
  };

  // Add new event
  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title) return;
    
    // In a real app, you would add the event to your data store
    console.log("Adding event:", {
      ...newEvent,
      date: selectedDate,
    });
    
    setIsAddingEvent(false);
    setNewEvent({
      title: "",
      type: "call",
      duration: 30,
    });
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 border border-gray-200 bg-gray-50"></div>
      );
    }
    
    // Add cells for days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = 
        day === new Date().getDate() && 
        currentMonth === new Date().getMonth() && 
        currentYear === new Date().getFullYear();
      
      const isSelected = selectedDate && 
        day === selectedDate.getDate() && 
        currentMonth === selectedDate.getMonth() && 
        currentYear === selectedDate.getFullYear();
      
      days.push(
        <div 
          key={day} 
          className={`h-24 border border-gray-200 p-1 overflow-hidden transition-colors cursor-pointer
            ${isToday ? "bg-blue-50" : ""}
            ${isSelected ? "ring-2 ring-inset ring-blue-500" : ""}
            hover:bg-gray-50`}
          onClick={() => handleSelectDate(day)}
        >
          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${isToday ? "text-blue-700" : ""}`}>{day}</span>
            {dayEvents.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-1.5 py-0.5">
                {dayEvents.length}
              </span>
            )}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map((event, idx) => (
              <div key={idx} className={`text-xs truncate rounded px-1.5 py-0.5 ${getEventColor(event.type)}`}>
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">Schedule and manage your calls and meetings</p>
          </div>
          <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Create a new event for {selectedDate ? selectedDate.toLocaleDateString() : "the selected date"}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Select
                    value={newEvent.type}
                    onValueChange={(value) => setNewEvent({...newEvent, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="demo">Demo</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    max="240"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent({...newEvent, duration: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingEvent(false)}>Cancel</Button>
                <Button onClick={handleAddEvent}>Add Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center mb-4">
                <CardTitle className="text-xl">
                  {monthNames[currentMonth]} {currentYear}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-px">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-7 gap-px">
                {renderCalendarDays()}
              </div>
            </CardContent>
          </Card>

          {selectedDate && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  Events for {selectedDate.toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getEventsForDay(selectedDate.getDate()).length > 0 ? (
                    getEventsForDay(selectedDate.getDate()).map((event, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50">
                        <div className="flex-shrink-0">
                          <div className="p-2 rounded-full bg-blue-100">
                            <CalendarIcon className="h-5 w-5 text-blue-700" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium">{event.title}</h4>
                          <p className="text-xs text-gray-500">
                            {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {event.duration} min
                          </p>
                        </div>
                        <Badge className={getEventColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No events scheduled for this day.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
