
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Upload, 
  FilePlus, 
  FileSpreadsheet, 
  PlayCircle,
  PauseCircle, 
  Phone,
  Calendar,
  Clock,
  RefreshCw,
  Trash2,
  Settings,
  InfoIcon,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { VapiApiKeyForm } from "@/components/VapiApiKeyForm";
import { useVapiRealtime } from "@/hooks/useVapiRealtime";
import { vapiService } from "@/services/vapiService";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Papa from 'papaparse';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'scheduled';
  totalCalls: number;
  completedCalls: number;
  successRate: number;
  startDate?: string;
  endDate?: string;
}

const Campaigns = () => {
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [fileData, setFileData] = useState<any[]>([]);
  const [campaignName, setCampaignName] = useState("");
  const [campaignSchedule, setCampaignSchedule] = useState("");
  const [campaignTime, setCampaignTime] = useState("");
  const [maxConcurrentCalls, setMaxConcurrentCalls] = useState(5);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [phoneColumn, setPhoneColumn] = useState("");
  const [firstNameColumn, setFirstNameColumn] = useState("");
  const [lastNameColumn, setLastNameColumn] = useState("");

  // Use our real-time hook to fetch campaigns
  const { 
    isLoading, 
    isConnected,
    refetch 
  } = useVapiRealtime({
    fetchInterval: 30000, // 30 seconds
    initialFetchDelay: 1000, // 1 second initial delay
    enabled: isApiKeySet,
    onDataUpdate: (data) => {
      // This will be called when data is updated
      fetchCampaigns();
    }
  });

  const fetchCampaigns = async () => {
    try {
      const response = await vapiService.getCampaigns();
      if (response && response.campaigns) {
        const formattedCampaigns: Campaign[] = response.campaigns.map((campaign: any) => ({
          id: campaign.id,
          name: campaign.name || "Unnamed Campaign",
          status: campaign.status || "scheduled",
          totalCalls: campaign.total_calls || 0,
          completedCalls: campaign.completed_calls || 0,
          successRate: campaign.success_rate || 0,
          startDate: campaign.start_date,
          endDate: campaign.end_date
        }));
        setCampaigns(formattedCampaigns);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      // Use sample data for development if API fails
      setCampaigns([
        {
          id: "1",
          name: "Spring Semester Outreach",
          status: "active",
          totalCalls: 120,
          completedCalls: 78,
          successRate: 65,
          startDate: "2025-04-10",
          endDate: "2025-04-20"
        },
        {
          id: "2",
          name: "Open House Follow-up",
          status: "completed",
          totalCalls: 85,
          completedCalls: 85,
          successRate: 72,
          startDate: "2025-03-15",
          endDate: "2025-03-25"
        },
        {
          id: "3",
          name: "Financial Aid Reminder",
          status: "scheduled",
          totalCalls: 210,
          completedCalls: 0,
          successRate: 0,
          startDate: "2025-04-25",
        }
      ]);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Determine file type from name
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const isSheet = file.name.toLowerCase().endsWith('.xlsx') || 
                   file.name.toLowerCase().endsWith('.xls') ||
                   file.name.toLowerCase().endsWith('.ods');

    if (!isCSV && !isSheet) {
      toast.error("Please upload a CSV or spreadsheet file");
      return;
    }

    if (isCSV) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setFileData(results.data);
            
            // Get headers for mapping
            if (results.meta.fields) {
              setCsvHeaders(results.meta.fields);
              
              // Try to auto-detect common column names
              const lowerCaseFields = results.meta.fields.map(f => f.toLowerCase());
              const phoneIndex = lowerCaseFields.findIndex(f => 
                f.includes('phone') || f.includes('mobile') || f.includes('cell'));
              const firstNameIndex = lowerCaseFields.findIndex(f => 
                f.includes('first') || f.includes('fname') || f === 'name');
              const lastNameIndex = lowerCaseFields.findIndex(f => 
                f.includes('last') || f.includes('lname') || f.includes('surname'));
              
              if (phoneIndex !== -1) setPhoneColumn(results.meta.fields[phoneIndex]);
              if (firstNameIndex !== -1) setFirstNameColumn(results.meta.fields[firstNameIndex]);
              if (lastNameIndex !== -1) setLastNameColumn(results.meta.fields[lastNameIndex]);
            }
            
            toast.success(`Successfully loaded ${results.data.length} contacts`);
          } else {
            toast.error("No data found in the file");
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          toast.error("Error parsing file: " + error.message);
        }
      });
    } else {
      // For sheets, we would need to use a library like SheetJS
      toast.error("Sheet processing is not implemented yet. Please use CSV format.");
    }
  };

  const createCampaign = async () => {
    if (!campaignName) {
      toast.error("Campaign name is required");
      return;
    }

    if (!phoneColumn) {
      toast.error("Phone column mapping is required");
      return;
    }

    if (fileData.length === 0) {
      toast.error("No contact data loaded");
      return;
    }

    try {
      // Format contacts according to VAPI API requirements
      const contacts = fileData.map(row => {
        const contact: any = {
          phone_number: row[phoneColumn]
        };
        
        if (firstNameColumn && row[firstNameColumn]) {
          contact.first_name = row[firstNameColumn];
        }
        
        if (lastNameColumn && row[lastNameColumn]) {
          contact.last_name = row[lastNameColumn];
        }
        
        // Add all other data as custom fields
        Object.keys(row).forEach(key => {
          if (key !== phoneColumn && key !== firstNameColumn && key !== lastNameColumn) {
            contact[key] = row[key];
          }
        });
        
        return contact;
      });

      // Prepare scheduling if provided
      const scheduling: any = {};
      if (campaignSchedule) {
        let startDateTime = campaignSchedule;
        if (campaignTime) {
          startDateTime = `${campaignSchedule}T${campaignTime}:00`;
        }
        scheduling.start_time = startDateTime;
        scheduling.max_concurrent_calls = maxConcurrentCalls;
        scheduling.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }

      // Create campaign via API
      await vapiService.createCampaign({
        name: campaignName,
        contacts,
        ...(Object.keys(scheduling).length > 0 && { scheduling })
      });

      toast.success("Campaign created successfully!");
      setCampaignName("");
      setFileData([]);
      setCsvHeaders([]);
      setPhoneColumn("");
      setFirstNameColumn("");
      setLastNameColumn("");
      setCampaignSchedule("");
      setCampaignTime("");
      fetchCampaigns();
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Call Campaigns</h1>
            <p className="text-muted-foreground">Create and manage automated call campaigns</p>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Connected to VAPI
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Connecting to VAPI...
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch} 
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </div>

        <VapiApiKeyForm onApiKeySet={setIsApiKeySet} />

        {isApiKeySet && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-medium">Active Campaigns</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <FilePlus className="h-4 w-4 mr-2" />
                          New Campaign
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Create New Campaign</DialogTitle>
                          <DialogDescription>
                            Upload a list of contacts and schedule your outbound calls
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="upload" className="mt-4">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload">Upload Contacts</TabsTrigger>
                            <TabsTrigger value="settings">Campaign Settings</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="upload" className="space-y-4 py-4">
                            <div className="space-y-4">
                              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500 mb-2">
                                  Upload CSV or spreadsheet with contact information
                                </p>
                                <Input 
                                  type="file" 
                                  accept=".csv,.xlsx,.xls,.ods"
                                  className="hidden" 
                                  id="file-upload"
                                  onChange={handleFileUpload}
                                />
                                <label htmlFor="file-upload">
                                  <Button variant="outline" className="mt-2" asChild>
                                    <span>
                                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                                      Select File
                                    </span>
                                  </Button>
                                </label>
                              </div>
                              
                              {fileData.length > 0 && (
                                <div className="space-y-4">
                                  <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-green-800">
                                        File Loaded Successfully
                                      </p>
                                      <p className="text-xs text-green-700">
                                        {fileData.length} contacts found in the file. Please map the columns below.
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <Label htmlFor="phone-column" className="text-xs font-medium">
                                          Phone Number Column *
                                        </Label>
                                        <select 
                                          id="phone-column"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                          value={phoneColumn}
                                          onChange={(e) => setPhoneColumn(e.target.value)}
                                        >
                                          <option value="">Select Column</option>
                                          {csvHeaders.map(header => (
                                            <option key={header} value={header}>{header}</option>
                                          ))}
                                        </select>
                                      </div>

                                      <div className="space-y-1">
                                        <Label htmlFor="first-name-column" className="text-xs font-medium">
                                          First Name Column
                                        </Label>
                                        <select 
                                          id="first-name-column"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                          value={firstNameColumn}
                                          onChange={(e) => setFirstNameColumn(e.target.value)}
                                        >
                                          <option value="">Select Column</option>
                                          {csvHeaders.map(header => (
                                            <option key={header} value={header}>{header}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <Label htmlFor="last-name-column" className="text-xs font-medium">
                                          Last Name Column
                                        </Label>
                                        <select 
                                          id="last-name-column"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                          value={lastNameColumn}
                                          onChange={(e) => setLastNameColumn(e.target.value)}
                                        >
                                          <option value="">Select Column</option>
                                          {csvHeaders.map(header => (
                                            <option key={header} value={header}>{header}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="settings" className="space-y-4 py-4">
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <Label htmlFor="campaign-name">Campaign Name</Label>
                                <Input 
                                  id="campaign-name" 
                                  placeholder="e.g., Spring 2025 Outreach"
                                  value={campaignName}
                                  onChange={(e) => setCampaignName(e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <Label htmlFor="campaign-schedule">Start Date (Optional)</Label>
                                <Input 
                                  id="campaign-schedule" 
                                  type="date"
                                  value={campaignSchedule}
                                  onChange={(e) => setCampaignSchedule(e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <Label htmlFor="campaign-time">Start Time (Optional)</Label>
                                <Input 
                                  id="campaign-time" 
                                  type="time"
                                  value={campaignTime}
                                  onChange={(e) => setCampaignTime(e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <Label htmlFor="max-concurrent">Max Concurrent Calls</Label>
                                <Input 
                                  id="max-concurrent" 
                                  type="number"
                                  min={1}
                                  max={20}
                                  value={maxConcurrentCalls}
                                  onChange={(e) => setMaxConcurrentCalls(parseInt(e.target.value))}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                  Maximum number of simultaneous calls (1-20)
                                </p>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                        
                        <DialogFooter>
                          <Button variant="outline" className="w-full sm:w-auto" asChild>
                            <DialogTrigger>Cancel</DialogTrigger>
                          </Button>
                          <Button onClick={createCampaign} className="w-full sm:w-auto" disabled={!phoneColumn || !campaignName}>
                            Create Campaign
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                      </div>
                    ) : campaigns.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-center">
                        <InfoIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <h3 className="text-lg font-medium text-gray-900">No campaigns yet</h3>
                        <p className="text-gray-500 mt-1">
                          Create your first campaign to start making automated calls
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Campaign Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {campaigns.map((campaign) => (
                            <TableRow key={campaign.id}>
                              <TableCell className="font-medium">{campaign.name}</TableCell>
                              <TableCell>
                                {campaign.status === 'active' && (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                    Active
                                  </Badge>
                                )}
                                {campaign.status === 'paused' && (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
                                    Paused
                                  </Badge>
                                )}
                                {campaign.status === 'completed' && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100">
                                    Completed
                                  </Badge>
                                )}
                                {campaign.status === 'scheduled' && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100">
                                    Scheduled
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-full max-w-24 bg-gray-200 rounded-full h-2.5">
                                    <div 
                                      className="bg-blue-600 h-2.5 rounded-full" 
                                      style={{ 
                                        width: `${campaign.totalCalls > 0 ? (campaign.completedCalls / campaign.totalCalls * 100) : 0}%` 
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {campaign.completedCalls}/{campaign.totalCalls}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "Not scheduled"}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  {campaign.status === 'active' && (
                                    <Button size="sm" variant="outline">
                                      <PauseCircle className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  {campaign.status === 'paused' && (
                                    <Button size="sm" variant="outline">
                                      <PlayCircle className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline">
                                    <Settings className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-4 space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Campaign Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Phone className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Calls</p>
                        <p className="text-2xl font-semibold">
                          {campaigns.reduce((acc, camp) => acc + camp.completedCalls, 0)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Success Rate</p>
                        <p className="text-2xl font-semibold">
                          {campaigns.length > 0 
                            ? `${Math.round(campaigns.reduce((acc, camp) => acc + camp.successRate, 0) / campaigns.length)}%` 
                            : "0%"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Active Campaigns</p>
                        <p className="text-2xl font-semibold">
                          {campaigns.filter(c => c.status === 'active').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Quick Help</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium flex items-center gap-1 text-blue-800">
                        <InfoIcon className="h-4 w-4" />
                        Creating Campaigns
                      </h4>
                      <p className="text-sm mt-1 text-blue-700">
                        Upload a CSV file with contact details, map columns correctly, then schedule calls to reach out to prospective students.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Best Calling Times
                      </h4>
                      <p className="text-sm mt-1 text-gray-600">
                        For the best response rates, schedule campaigns on weekdays between 3pm-7pm when prospective students are most likely to answer.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;
