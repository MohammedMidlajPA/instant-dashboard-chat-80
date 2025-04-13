
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadIcon, PhoneIcon, ClockIcon, PauseIcon, UserIcon, MicIcon, CheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const contactList = [
  { id: 1, name: 'John Smith', company: 'ABC Corporation', phone: '+1 (555) 123-4567', status: 'Ready' },
  { id: 2, name: 'Sarah Johnson', company: 'XYZ Industries', phone: '+1 (555) 234-5678', status: 'Ready' },
  { id: 3, name: 'Michael Brown', company: 'Acme Inc.', phone: '+1 (555) 345-6789', status: 'Ready' },
  { id: 4, name: 'Emily Wilson', company: 'Tech Solutions', phone: '+1 (555) 456-7890', status: 'Ready' },
  { id: 5, name: 'David Lee', company: 'Global Enterprises', phone: '+1 (555) 567-8901', status: 'Ready' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    'Ready': "bg-blue-100 text-blue-800",
    'In Progress': "bg-amber-100 text-amber-800",
    'Completed': "bg-green-100 text-green-800",
    'Failed': "bg-red-100 text-red-800",
  };
  
  const color = styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
};

const OutboundCalling = () => {
  const [activeCall, setActiveCall] = useState<{id: number, name: string, company: string, phone: string} | null>(null);
  const [callTime, setCallTime] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);

  const startCall = (contact: typeof contactList[0]) => {
    setActiveCall(contact);
    setCallTime(0);
    setIsCallActive(true);
  };

  const endCall = () => {
    setActiveCall(null);
    setIsCallActive(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Outbound Calling</h1>
            <p className="text-muted-foreground">Make calls to your contacts</p>
          </div>
          <Button>
            <UploadIcon className="h-4 w-4 mr-2" />
            Upload List
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <PhoneIcon className="h-5 w-5 text-blue-700" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Calls</p>
                  <h3 className="text-2xl font-bold">48</h3>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <ClockIcon className="h-5 w-5 text-green-700" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Call Time</p>
                  <h3 className="text-2xl font-bold">3h 45m</h3>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <CheckIcon className="h-5 w-5 text-purple-700" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Completed Contacts</p>
                  <h3 className="text-2xl font-bold">32</h3>
                  <p className="text-xs text-gray-500">Out of 50</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Contact List */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Contact List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactList.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.company}</TableCell>
                        <TableCell>{contact.phone}</TableCell>
                        <TableCell>
                          <StatusBadge status={contact.status} />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startCall(contact)}
                            disabled={isCallActive}
                          >
                            <PhoneIcon className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            {/* Current Call Card */}
            <Card className="shadow-sm h-full">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Current Call</CardTitle>
              </CardHeader>
              <CardContent>
                {activeCall ? (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-10 w-10 text-blue-700" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold">{activeCall.name}</h3>
                      <p className="text-gray-500">{activeCall.company}</p>
                      <p className="text-lg font-medium mt-2">{activeCall.phone}</p>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-full text-lg font-medium">
                      {`${Math.floor(callTime / 60).toString().padStart(2, '0')}:${(callTime % 60).toString().padStart(2, '0')}`}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                        <MicIcon className="h-5 w-5" />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                        <PauseIcon className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="rounded-full h-12 w-12"
                        onClick={endCall}
                      >
                        <PhoneIcon className="h-5 w-5 rotate-135" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                      <PhoneIcon className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No active call</p>
                    <p className="text-sm text-gray-400">Select a contact from the list to start a call</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OutboundCalling;
