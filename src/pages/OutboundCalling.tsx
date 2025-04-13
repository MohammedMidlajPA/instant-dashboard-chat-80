
import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UploadIcon, 
  PhoneIcon, 
  ClockIcon, 
  PauseIcon, 
  UserIcon, 
  MicIcon, 
  CheckIcon, 
  FileTextIcon, 
  AlertCircleIcon,
  PlayIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";

// Sample contact list
const contactList = [
  { id: 1, name: 'John Smith', company: 'ABC Corporation', phone: '+1 (555) 123-4567', status: 'Ready', email: 'john.smith@abccorp.com' },
  { id: 2, name: 'Sarah Johnson', company: 'XYZ Industries', phone: '+1 (555) 234-5678', status: 'Ready', email: 'sarah.j@xyzind.com' },
  { id: 3, name: 'Michael Brown', company: 'Acme Inc.', phone: '+1 (555) 345-6789', status: 'Ready', email: 'mbrown@acme.co' },
  { id: 4, name: 'Emily Wilson', company: 'Tech Solutions', phone: '+1 (555) 456-7890', status: 'Ready', email: 'emily@techsolutions.com' },
  { id: 5, name: 'David Lee', company: 'Global Enterprises', phone: '+1 (555) 567-8901', status: 'Ready', email: 'dlee@globalent.com' },
];

// Sample campaign analytics
const campaignAnalytics = {
  totalCalls: 48,
  answered: 32,
  voicemail: 8,
  notAnswered: 8,
  averageCallTime: '2m 15s',
  totalCallTime: '3h 45m',
  callsToday: 18,
  successRate: 67,
};

// Sample call recordings
const callRecordings = [
  { id: 1, contact: 'John Smith', duration: '3:24', date: '2025-04-12', sentiment: 'positive', transcription: 'Hi John, this is Alex from VoiceFlowAI. I wanted to follow up on our previous conversation about our sales automation software...' },
  { id: 2, contact: 'Sarah Johnson', duration: '4:12', date: '2025-04-11', sentiment: 'neutral', transcription: 'Hello Sarah, I\'m calling from VoiceFlowAI regarding the proposal we sent last week. I wanted to see if you had any questions...' },
  { id: 3, contact: 'Michael Brown', duration: '2:45', date: '2025-04-10', sentiment: 'positive', transcription: 'Michael, it\'s Alex here. I appreciate you taking the time to review our product demo last week. I wanted to discuss the next steps...' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    'Ready': "bg-blue-100 text-blue-800",
    'In Progress': "bg-amber-100 text-amber-800",
    'Completed': "bg-green-100 text-green-800",
    'Failed': "bg-red-100 text-red-800",
    'Scheduled': "bg-purple-100 text-purple-800",
  };
  
  const color = styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
};

const SentimentBadge = ({ sentiment }: { sentiment: string }) => {
  const styles = {
    'positive': "bg-green-100 text-green-800",
    'neutral': "bg-blue-100 text-blue-800",
    'negative': "bg-red-100 text-red-800",
  };
  
  const color = styles[sentiment as keyof typeof styles] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </span>
  );
};

const OutboundCalling = () => {
  const [activeCall, setActiveCall] = useState<{id: number, name: string, company: string, phone: string, email: string} | null>(null);
  const [callTime, setCallTime] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [activeTab, setActiveTab] = useState("contacts");
  const [vapiApiKey, setVapiApiKey] = useState("");
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignScript, setCampaignScript] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<number | null>(null);
  
  const timerRef = useRef<number | null>(null);

  // Handle starting a call
  const startCall = (contact: typeof contactList[0]) => {
    if (!isApiKeySet) {
      toast.error("Please set your VAPI API key first");
      return;
    }
    
    setActiveCall(contact);
    setCallTime(0);
    setIsCallActive(true);
    
    // Start the timer
    const timer = window.setInterval(() => {
      setCallTime(prevTime => prevTime + 1);
    }, 1000);
    
    timerRef.current = timer;
    
    toast.success(`Calling ${contact.name}...`);
  };

  // Handle ending a call
  const endCall = () => {
    // Clear the timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setActiveCall(null);
    setIsCallActive(false);
    toast.info("Call ended");
  };
  
  // Clean up the timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Handle API key submission
  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vapiApiKey.trim()) {
      setIsApiKeySet(true);
      toast.success("VAPI API key has been set successfully");
    } else {
      toast.error("Please enter a valid API key");
    }
  };
  
  // Handle creating a new campaign
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }
    
    if (!campaignScript.trim()) {
      toast.error("Please enter a call script");
      return;
    }
    
    if (selectedContacts.length === 0) {
      toast.error("Please select at least one contact");
      return;
    }
    
    toast.success(`Campaign "${campaignName}" created successfully`);
    setIsCreatingCampaign(false);
    setCampaignName("");
    setCampaignScript("");
    setSelectedContacts([]);
  };
  
  // Handle contact selection for campaign
  const toggleContactSelection = (id: number) => {
    setSelectedContacts(prev => 
      prev.includes(id) 
        ? prev.filter(contactId => contactId !== id) 
        : [...prev, id]
    );
  };
  
  // Handle file upload for contacts
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // In a real app, you would parse the CSV file
      // For this demo, we'll just show a success toast
      toast.success(`File "${file.name}" uploaded successfully`);
      
      // Reset the input
      e.target.value = '';
    }
  };
  
  // Format time for display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Outbound Calling</h1>
            <p className="text-muted-foreground">Manage your outbound calls and campaigns</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {!isApiKeySet ? (
              <Card className="w-full sm:w-auto">
                <CardContent className="p-3">
                  <form onSubmit={handleApiKeySubmit} className="flex items-center gap-2">
                    <Input
                      type="password"
                      placeholder="Enter VAPI API Key"
                      value={vapiApiKey}
                      onChange={(e) => setVapiApiKey(e.target.value)}
                      className="max-w-[220px]"
                    />
                    <Button type="submit" size="sm">
                      Set Key
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsCreatingCampaign(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
                
                <Button>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload List
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <PhoneIcon className="h-5 w-5 text-purple-700" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Calls</p>
                  <h3 className="text-2xl font-bold">{campaignAnalytics.totalCalls}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-green-600">+12%</span>
                    <span className="text-xs text-gray-500">vs last week</span>
                  </div>
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
                  <h3 className="text-2xl font-bold">{campaignAnalytics.totalCallTime}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Avg: {campaignAnalytics.averageCallTime}/call</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <CheckIcon className="h-5 w-5 text-blue-700" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <h3 className="text-2xl font-bold">{campaignAnalytics.successRate}%</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-green-600">+4%</span>
                    <span className="text-xs text-gray-500">vs last week</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-amber-100 p-3 rounded-full">
                  <UserIcon className="h-5 w-5 text-amber-700" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Call Distribution</p>
                  <div className="mt-2 space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Answered</span>
                        <span className="font-medium">{campaignAnalytics.answered}</span>
                      </div>
                      <Progress value={67} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Voicemail</span>
                        <span className="font-medium">{campaignAnalytics.voicemail}</span>
                      </div>
                      <Progress value={17} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>No Answer</span>
                        <span className="font-medium">{campaignAnalytics.notAnswered}</span>
                      </div>
                      <Progress value={16} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contacts" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {/* Contact List */}
                <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg font-medium">Contact List</CardTitle>
                      <CardDescription>Manage and call your contacts</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Input 
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept=".csv,.txt"
                          onChange={handleFileUpload}
                        />
                        <Label 
                          htmlFor="file-upload"
                          className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                        >
                          <UploadIcon className="h-4 w-4 mr-2" />
                          Import CSV
                        </Label>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead className="hidden md:table-cell">Email</TableHead>
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
                              <TableCell className="hidden md:table-cell">{contact.email}</TableCell>
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
                    </div>
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
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-10 w-10 text-purple-700" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-xl font-bold">{activeCall.name}</h3>
                          <p className="text-gray-500">{activeCall.company}</p>
                          <p className="text-sm text-gray-500">{activeCall.email}</p>
                          <p className="text-lg font-medium mt-2">{activeCall.phone}</p>
                        </div>
                        <div className="bg-gray-100 px-4 py-2 rounded-full text-lg font-medium">
                          {formatTime(callTime)}
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
                        
                        <div className="w-full mt-4">
                          <div className="bg-gray-50 p-3 rounded-md border text-sm">
                            <p className="font-medium text-gray-700 mb-1">Suggested Script:</p>
                            <p className="text-gray-600">
                              Hello {activeCall.name}, this is Alex from VoiceFlowAI. I'm calling to follow up on our previous conversation about our AI-powered sales automation tools. Do you have a moment to chat about how this could benefit {activeCall.company}?
                            </p>
                          </div>
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
          </TabsContent>
          
          <TabsContent value="campaigns" className="mt-4">
            <div className="grid grid-cols-1 gap-6">
              {isCreatingCampaign ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Campaign</CardTitle>
                    <CardDescription>Set up an automated outbound calling campaign</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateCampaign} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="campaign-name">Campaign Name</Label>
                            <Input 
                              id="campaign-name" 
                              placeholder="Enter campaign name"
                              value={campaignName}
                              onChange={(e) => setCampaignName(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="campaign-script">Call Script</Label>
                            <Textarea 
                              id="campaign-script" 
                              placeholder="Enter the script for your AI agent to follow..."
                              value={campaignScript}
                              onChange={(e) => setCampaignScript(e.target.value)}
                              className="mt-1 min-h-[150px]"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Start Date</Label>
                              <Input type="date" className="mt-1" />
                            </div>
                            <div>
                              <Label>Schedule Time</Label>
                              <Input type="time" className="mt-1" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <Label>Select Contacts</Label>
                          <div className="border rounded-md max-h-[300px] overflow-y-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-12">
                                    <Input 
                                      type="checkbox" 
                                      className="w-4 h-4"
                                      onChange={() => {
                                        const allIds = contactList.map(c => c.id);
                                        setSelectedContacts(
                                          selectedContacts.length === contactList.length ? [] : allIds
                                        );
                                      }}
                                      checked={selectedContacts.length === contactList.length}
                                    />
                                  </TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Company</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {contactList.map((contact) => (
                                  <TableRow key={contact.id}>
                                    <TableCell>
                                      <Input 
                                        type="checkbox" 
                                        className="w-4 h-4"
                                        onChange={() => toggleContactSelection(contact.id)}
                                        checked={selectedContacts.includes(contact.id)}
                                      />
                                    </TableCell>
                                    <TableCell className="font-medium">{contact.name}</TableCell>
                                    <TableCell>{contact.company}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm font-medium text-gray-700">Selected: {selectedContacts.length} contacts</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreatingCampaign(false)}>Cancel</Button>
                        <Button type="submit">Create Campaign</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Calling Campaigns</CardTitle>
                        <CardDescription>Manage your active and scheduled campaigns</CardDescription>
                      </div>
                      <Button onClick={() => setIsCreatingCampaign(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Campaign
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Campaign Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Contacts</TableHead>
                            <TableHead>Completed</TableHead>
                            <TableHead>Success Rate</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Q2 Follow-up Campaign</TableCell>
                            <TableCell><StatusBadge status="In Progress" /></TableCell>
                            <TableCell>50</TableCell>
                            <TableCell>32 (64%)</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={70} className="h-2 w-16" />
                                <span>70%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">Pause</Button>
                                <Button variant="outline" size="sm">View</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">New Product Announcement</TableCell>
                            <TableCell><StatusBadge status="Scheduled" /></TableCell>
                            <TableCell>75</TableCell>
                            <TableCell>0 (0%)</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={0} className="h-2 w-16" />
                                <span>0%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="outline" size="sm">View</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Q1 Customer Check-in</TableCell>
                            <TableCell><StatusBadge status="Completed" /></TableCell>
                            <TableCell>100</TableCell>
                            <TableCell>98 (98%)</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={85} className="h-2 w-16" />
                                <span>85%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">Report</Button>
                                <Button variant="outline" size="sm">View</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="recordings" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Recent Call Recordings</CardTitle>
                    <CardDescription>AI-analyzed call recordings from your campaigns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Contact</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Sentiment</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {callRecordings.map((recording) => (
                            <TableRow 
                              key={recording.id}
                              className={cn(selectedRecording === recording.id && "bg-accent")}
                            >
                              <TableCell className="font-medium">{recording.contact}</TableCell>
                              <TableCell>{recording.duration}</TableCell>
                              <TableCell>{recording.date}</TableCell>
                              <TableCell>
                                <SentimentBadge sentiment={recording.sentiment} />
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedRecording(recording.id)}
                                  >
                                    <PlayIcon className="h-3 w-3 mr-1" />
                                    Play
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Call Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRecording ? (
                      <>
                        {(() => {
                          const recording = callRecordings.find(r => r.id === selectedRecording);
                          if (!recording) return null;
                          
                          return (
                            <div className="space-y-6">
                              <div className="bg-gray-50 p-3 rounded-md flex flex-col gap-1">
                                <p className="text-sm text-gray-500">Call with</p>
                                <p className="font-medium">{recording.contact}</p>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                  <span>{recording.date}</span>
                                  <span>{recording.duration}</span>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between mb-2">
                                  <p className="text-sm font-medium">Sentiment Analysis</p>
                                  <SentimentBadge sentiment={recording.sentiment} />
                                </div>
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <div className="space-y-2">
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>Positive</span>
                                        <span className="font-medium">72%</span>
                                      </div>
                                      <Progress value={72} className="h-1.5" />
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>Neutral</span>
                                        <span className="font-medium">18%</span>
                                      </div>
                                      <Progress value={18} className="h-1.5" />
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>Negative</span>
                                        <span className="font-medium">10%</span>
                                      </div>
                                      <Progress value={10} className="h-1.5" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium mb-2">Extracted Keywords</p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="inline-flex bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">pricing</span>
                                  <span className="inline-flex bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">demo</span>
                                  <span className="inline-flex bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">follow-up</span>
                                  <span className="inline-flex bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">implementation</span>
                                  <span className="inline-flex bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">timeline</span>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium mb-2">Transcription</p>
                                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 max-h-48 overflow-y-auto">
                                  {recording.transcription}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <FileTextIcon className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">Select a recording to view analysis</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default OutboundCalling;
