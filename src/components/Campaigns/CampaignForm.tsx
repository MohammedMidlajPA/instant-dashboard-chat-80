
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, ChevronLeft, Calendar, Clock, FileText, Upload, Mic, Database, Settings, Globe } from "lucide-react";
import { CsvUploader } from "./CsvUploader";
import { ManualContactForm } from "./ManualContactForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { mcubeService } from "@/services/mcube";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface CampaignFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface Contact {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

const voiceOptions = {
  azure: [
    { id: "en-US-AriaNeural", name: "Aria (Female)" },
    { id: "en-US-GuyNeural", name: "Guy (Male)" },
    { id: "en-US-JennyNeural", name: "Jenny (Female)" },
  ],
  sarvam: [
    { id: "indic-female-1", name: "Priya (Female)" },
    { id: "indic-male-1", name: "Rahul (Male)" },
  ],
  elevenlabs: [
    { id: "9BWtsMINqrJLrRacOk9x", name: "Aria (Female)" },
    { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte (Female)" },
    { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam (Male)" },
    { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura (Female)" }
  ]
};

const providerConfigs = {
  mcube: {
    name: "MCUBE",
    apiKeyLabel: "API Key",
    apiKeyPlaceholder: "Enter your MCUBE API key"
  },
  twilio: {
    name: "Twilio",
    apiKeyLabel: "Account SID",
    apiKeyPlaceholder: "Enter your Twilio Account SID",
    apiSecretLabel: "Auth Token",
    apiSecretPlaceholder: "Enter your Twilio Auth Token"
  },
  telecmi: {
    name: "TeleCMI",
    apiKeyLabel: "API Key",
    apiKeyPlaceholder: "Enter your TeleCMI API key"
  }
};

export const CampaignForm: React.FC<CampaignFormProps> = ({ 
  onSuccess,
  onCancel
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [manualContacts, setManualContacts] = useState<Contact[]>([]);
  const [contactMethod, setContactMethod] = useState<'csv' | 'manual'>('csv');
  
  // Campaign details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  // Column mapping
  const [phoneColumn, setPhoneColumn] = useState("");
  const [firstNameColumn, setFirstNameColumn] = useState("");
  const [lastNameColumn, setLastNameColumn] = useState("");
  const [emailColumn, setEmailColumn] = useState("");
  
  // Scheduling
  const [schedule, setSchedule] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [maxConcurrentCalls, setMaxConcurrentCalls] = useState(5);

  // Voice agent settings
  const [useVoiceAgent, setUseVoiceAgent] = useState(true);
  const [voiceProvider, setVoiceProvider] = useState<string>("mcube");
  const [voicePrompt, setVoicePrompt] = useState<string>("You are a friendly sales assistant for [College Name]. Introduce yourself as an AI assistant for the college. Ask if they're interested in learning about our programs. Listen attentively and answer their questions about courses, admissions, campus life, financial aid, and application deadlines.");
  const [firstMessage, setFirstMessage] = useState<string>("Hello! This is an AI assistant calling from [College Name]. I'm reaching out to prospective students who've expressed interest in our programs. Do you have a moment to chat about your educational interests?");
  const [voiceModel, setVoiceModel] = useState<string>("azure");
  const [voiceId, setVoiceId] = useState<string>("en-US-AriaNeural");
  const [knowledgeBase, setKnowledgeBase] = useState<File | null>(null);
  
  // Telecom provider settings
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [telecomApiKey, setTelecomApiKey] = useState("");
  const [telecomApiSecret, setTelecomApiSecret] = useState("");

  const handleManualContactAdd = (contact: Contact) => {
    setManualContacts(prev => [...prev, contact]);
    toast.success("Contact added successfully");
  };
  
  const handleCsvUpload = (data: any[]) => {
    setCsvData(data);
  };
  
  const handleColumnsDetected = (columns: string[]) => {
    setCsvColumns(columns);
    // Try to auto-detect column mappings
    const phoneCol = columns.find(col => 
      col.toLowerCase().includes('phone') || 
      col.toLowerCase() === 'mobile' || 
      col.toLowerCase() === 'cell') ||
      columns.find(col =>
      col.toLowerCase().includes('number') ||
      col.toLowerCase().includes('contact')
    );
    
    const firstNameCol = columns.find(col => 
      col.toLowerCase().includes('first') || 
      col.toLowerCase() === 'firstname' || 
      col.toLowerCase() === 'fname') ||
      columns.find(col =>
      col.toLowerCase().includes('name') && !col.toLowerCase().includes('last')
    );
    
    const lastNameCol = columns.find(col => 
      col.toLowerCase().includes('last') || 
      col.toLowerCase() === 'lastname' || 
      col.toLowerCase() === 'lname') ||
      columns.find(col =>
      col.toLowerCase().includes('surname')
    );
    
    const emailCol = columns.find(col => 
      col.toLowerCase().includes('email') || 
      col.toLowerCase() === 'e-mail') ||
      columns.find(col =>
      col.toLowerCase().includes('mail')
    );
    
    if (phoneCol) setPhoneColumn(phoneCol);
    if (firstNameCol) setFirstNameColumn(firstNameCol);
    if (lastNameCol) setLastNameColumn(lastNameCol);
    if (emailCol) setEmailColumn(emailCol);
  };

  const handleKnowledgeBaseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setKnowledgeBase(e.target.files[0]);
      toast.success("Knowledge base file selected");
    }
  };

  const processContacts = () => {
    if (contactMethod === 'csv') {
      return csvData.map(row => {
        const contact: any = {
          phone_number: row[phoneColumn],
        };
        
        if (firstNameColumn) contact.first_name = row[firstNameColumn];
        if (lastNameColumn) contact.last_name = row[lastNameColumn];
        if (emailColumn) contact.email = row[emailColumn];
        
        const metadata: any = {};
        Object.keys(row).forEach(key => {
          if (key !== phoneColumn && key !== firstNameColumn && key !== lastNameColumn && key !== emailColumn) {
            metadata[key] = row[key];
          }
        });
        
        if (Object.keys(metadata).length > 0) {
          contact.metadata = metadata;
        }
        
        return contact;
      });
    } else {
      return manualContacts.map(contact => ({
        phone_number: contact.phoneNumber,
        first_name: contact.firstName,
        last_name: contact.lastName,
        email: contact.email
      }));
    }
  };

  const handleTelecomApiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telecomApiKey) {
      toast.error("API Key is required");
      return;
    }
    
    try {
      // Store the API key in localStorage
      localStorage.setItem(`${voiceProvider}_api_key`, telecomApiKey);
      if (telecomApiSecret) {
        localStorage.setItem(`${voiceProvider}_api_secret`, telecomApiSecret);
      }
      
      // Update the service with the new API key
      mcubeService.setToken(telecomApiKey);
      
      toast.success(`${providerConfigs[voiceProvider as keyof typeof providerConfigs].name} API key saved`);
      setShowApiKeyDialog(false);
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key");
    }
  };

  const handleSubmit = async () => {
    if (!name || (!phoneColumn && contactMethod === 'csv') || (manualContacts.length === 0 && contactMethod === 'manual')) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const contacts = processContacts();
      
      if (contacts.length === 0) {
        toast.error("Please add at least one contact");
        return;
      }
      
      // Check if API key is set for the selected provider
      const providerApiKey = localStorage.getItem(`${voiceProvider}_api_key`);
      if (!providerApiKey) {
        toast.error(`Please set up your ${providerConfigs[voiceProvider as keyof typeof providerConfigs].name} API key`);
        setShowApiKeyDialog(true);
        setIsSubmitting(false);
        return;
      }
      
      // Create payload
      const payload: any = {
        name,
        description,
        contacts,
        provider: voiceProvider
      };
      
      // Add voice agent settings if enabled
      if (useVoiceAgent) {
        payload.voice_agent = {
          prompt: voicePrompt,
          first_message: firstMessage,
          model: voiceModel,
          voice_id: voiceId,
          has_knowledge_base: knowledgeBase !== null
        };
      }
      
      // Add scheduling if enabled
      if (schedule && startDate && startTime) {
        const dateTime = new Date(`${startDate}T${startTime}`);
        payload.scheduling = {
          start_time: dateTime.toISOString(),
          max_concurrent_calls: maxConcurrentCalls,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
      }
      
      // Call API to create campaign
      const response = await mcubeService.createCampaign(payload);
      
      // If knowledge base is selected, upload it
      if (knowledgeBase && response.id) {
        // Mock implementation
        toast.success("Knowledge base uploaded successfully");
      }
      
      toast.success("Campaign created successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Set up {providerConfigs[voiceProvider as keyof typeof providerConfigs]?.name || "Provider"} API Key
            </DialogTitle>
            <DialogDescription>
              Enter your API credentials to connect with {providerConfigs[voiceProvider as keyof typeof providerConfigs]?.name || "the provider"}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTelecomApiSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey">
                  {providerConfigs[voiceProvider as keyof typeof providerConfigs]?.apiKeyLabel || "API Key"}
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder={providerConfigs[voiceProvider as keyof typeof providerConfigs]?.apiKeyPlaceholder || "Enter your API key"}
                  value={telecomApiKey}
                  onChange={(e) => setTelecomApiKey(e.target.value)}
                  required
                />
              </div>
              
              {providerConfigs[voiceProvider as keyof typeof providerConfigs]?.apiSecretLabel && (
                <div className="grid gap-2">
                  <Label htmlFor="apiSecret">
                    {providerConfigs[voiceProvider as keyof typeof providerConfigs]?.apiSecretLabel}
                  </Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    placeholder={providerConfigs[voiceProvider as keyof typeof providerConfigs]?.apiSecretPlaceholder}
                    value={telecomApiSecret}
                    onChange={(e) => setTelecomApiSecret(e.target.value)}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowApiKeyDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Save API Key</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
          <CardDescription>
            Set up an automated call campaign to reach out to prospective students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-8">
            <div className={`rounded-full w-10 h-10 flex items-center justify-center border-2 ${step === 1 ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400'}`}>1</div>
            <div className="h-1 flex-1 bg-gray-200 self-center mx-2">
              <div className={`h-full bg-blue-600 ${step >= 2 ? 'w-full' : 'w-0'} transition-all duration-300`}></div>
            </div>
            <div className={`rounded-full w-10 h-10 flex items-center justify-center border-2 ${step === 2 ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400'}`}>2</div>
            <div className="h-1 flex-1 bg-gray-200 self-center mx-2">
              <div className={`h-full bg-blue-600 ${step >= 3 ? 'w-full' : 'w-0'} transition-all duration-300`}></div>
            </div>
            <div className={`rounded-full w-10 h-10 flex items-center justify-center border-2 ${step === 3 ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400'}`}>3</div>
            <div className="h-1 flex-1 bg-gray-200 self-center mx-2">
              <div className={`h-full bg-blue-600 ${step >= 4 ? 'w-full' : 'w-0'} transition-all duration-300`}></div>
            </div>
            <div className={`rounded-full w-10 h-10 flex items-center justify-center border-2 ${step === 4 ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400'}`}>4</div>
          </div>
          
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Campaign Details</h3>
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name *</Label>
                <Input 
                  id="campaign-name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Fall 2025 Admissions Outreach"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-description">Description</Label>
                <Textarea 
                  id="campaign-description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Automated calls to prospective students who have shown interest in our programs."
                  rows={3}
                />
              </div>
              
              <Tabs value={contactMethod} onValueChange={(value) => setContactMethod(value as 'csv' | 'manual')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="csv">Upload CSV/Excel/Google Sheet</TabsTrigger>
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                </TabsList>
                <TabsContent value="csv" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Contact List</Label>
                    <CsvUploader 
                      onUpload={handleCsvUpload}
                      onColumnsDetected={handleColumnsDetected}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="manual">
                  <ManualContactForm 
                    onAdd={handleManualContactAdd}
                    contacts={manualContacts}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {step === 2 && contactMethod === 'csv' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Map CSV Columns</h3>
              <div className="space-y-2">
                <Label htmlFor="phone-column">Phone Number Column *</Label>
                <Select value={phoneColumn} onValueChange={setPhoneColumn}>
                  <SelectTrigger id="phone-column">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvColumns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="first-name-column">First Name Column</Label>
                <Select value={firstNameColumn} onValueChange={setFirstNameColumn}>
                  <SelectTrigger id="first-name-column">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {csvColumns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name-column">Last Name Column</Label>
                <Select value={lastNameColumn} onValueChange={setLastNameColumn}>
                  <SelectTrigger id="last-name-column">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {csvColumns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-column">Email Column</Label>
                <Select value={emailColumn} onValueChange={setEmailColumn}>
                  <SelectTrigger id="email-column">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {csvColumns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator className="my-4" />
              
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Column Mapping Info</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Phone Number is required for all contacts</li>
                        <li>First and Last Name will personalize the call</li>
                        <li>All other columns will be stored as additional data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Voice Agent Configuration</h3>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="use-voice-agent" className="text-sm">Use Voice Agent</Label>
                  <Switch 
                    id="use-voice-agent" 
                    checked={useVoiceAgent}
                    onCheckedChange={setUseVoiceAgent}
                  />
                </div>
              </div>
              
              {useVoiceAgent && (
                <div className="space-y-6 mt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="voice-provider" className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-gray-500" />
                          Telecom Provider
                        </Label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowApiKeyDialog(true)}
                          className="h-8"
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                      </div>
                      <Select value={voiceProvider} onValueChange={setVoiceProvider}>
                        <SelectTrigger id="voice-provider">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcube">MCUBE</SelectItem>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="telecmi">TeleCMI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="voice-model" className="flex items-center">
                        <Mic className="h-4 w-4 mr-2 text-gray-500" />
                        TTS Service
                      </Label>
                      <Select value={voiceModel} onValueChange={(value) => {
                        setVoiceModel(value);
                        // Reset voice ID when model changes
                        if (voiceOptions[value as keyof typeof voiceOptions]) {
                          setVoiceId(voiceOptions[value as keyof typeof voiceOptions][0].id);
                        }
                      }}>
                        <SelectTrigger id="voice-model">
                          <SelectValue placeholder="Select voice model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="azure">Azure Text-to-Speech</SelectItem>
                          <SelectItem value="sarvam">Sarvam AI Voice</SelectItem>
                          <SelectItem value="elevenlabs">ElevenLabs Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="voice-id" className="flex items-center">
                      <Mic className="h-4 w-4 mr-2 text-gray-500" />
                      Voice Selection
                    </Label>
                    <Select value={voiceId} onValueChange={setVoiceId}>
                      <SelectTrigger id="voice-id">
                        <SelectValue placeholder="Select voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceOptions[voiceModel as keyof typeof voiceOptions]?.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select the voice that will be used for the voice agent
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="first-message" className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      First Message
                    </Label>
                    <Textarea 
                      id="first-message" 
                      value={firstMessage} 
                      onChange={(e) => setFirstMessage(e.target.value)}
                      placeholder="Hello! This is an AI assistant calling from [College Name]. I'm reaching out to prospective students who've expressed interest in our programs. Do you have a moment to chat?"
                      rows={3}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      This is the first message the AI agent will say when the call is answered
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="voice-prompt" className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      Agent Prompt / Script
                    </Label>
                    <Textarea 
                      id="voice-prompt" 
                      value={voicePrompt} 
                      onChange={(e) => setVoicePrompt(e.target.value)}
                      placeholder="You are a friendly sales assistant. Introduce yourself and ask how you can help the prospect today."
                      rows={5}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Define how the voice agent should interact with contacts
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="knowledge-base" className="flex items-center">
                      <Database className="h-4 w-4 mr-2 text-gray-500" />
                      Knowledge Base (Optional)
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="knowledge-base"
                        type="file"
                        onChange={handleKnowledgeBaseUpload}
                        className="hidden"
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => document.getElementById("knowledge-base")?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {knowledgeBase ? knowledgeBase.name : "Upload Knowledge Base"}
                      </Button>
                      {knowledgeBase && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setKnowledgeBase(null)}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Upload PDF, Word or text files with information that the agent can reference
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Schedule Campaign</h3>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="schedule-toggle"
                  checked={schedule}
                  onChange={(e) => setSchedule(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="schedule-toggle">Schedule this campaign for a future date/time</Label>
              </div>
              
              {schedule && (
                <div className="space-y-4 pl-6 border-l-2 border-blue-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Start Date
                      </Label>
                      <Input 
                        id="start-date" 
                        type="date"
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start-time" className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Start Time
                      </Label>
                      <Input 
                        id="start-time" 
                        type="time"
                        value={startTime} 
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-concurrent">Maximum Concurrent Calls</Label>
                    <Input 
                      id="max-concurrent" 
                      type="number"
                      min={1}
                      max={20}
                      value={maxConcurrentCalls} 
                      onChange={(e) => setMaxConcurrentCalls(parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">
                      The maximum number of calls that can be placed simultaneously.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <h3 className="text-lg font-medium">Campaign Summary</h3>
                <div className="mt-2 bg-gray-50 p-4 rounded-md dark:bg-gray-900">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Campaign Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Contacts</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {contactMethod === 'csv' ? csvData.length : manualContacts.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Voice Agent</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {useVoiceAgent ? `${voiceModel} / ${voiceOptions[voiceModel as keyof typeof voiceOptions]?.find(v => v.id === voiceId)?.name || voiceId}` : "Not Used"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Telecom Provider</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {providerConfigs[voiceProvider as keyof typeof providerConfigs]?.name || voiceProvider}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Time</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {schedule && startDate && startTime ? 
                          new Date(`${startDate}T${startTime}`).toLocaleString() : 
                          "Immediately after creation"}
                      </dd>
                    </div>
                    {contactMethod === 'csv' && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Field Mappings</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                          <ul className="list-disc pl-5 space-y-0.5">
                            <li>Phone: {phoneColumn}</li>
                            {firstNameColumn && <li>First Name: {firstNameColumn}</li>}
                            {lastNameColumn && <li>Last Name: {lastNameColumn}</li>}
                            {emailColumn && <li>Email: {emailColumn}</li>}
                          </ul>
                        </dd>
                      </div>
                    )}
                    {knowledgeBase && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Knowledge Base</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                          {knowledgeBase.name}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button 
              variant="outline" 
              onClick={() => setStep(prev => prev - 1)}
              disabled={isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          
          {step < 4 ? (
            <Button 
              onClick={() => setStep(prev => prev + 1)}
              disabled={
                (step === 1 && ((contactMethod === 'csv' && csvData.length === 0) || 
                               (contactMethod === 'manual' && manualContacts.length === 0) || 
                               !name)) ||
                (step === 2 && contactMethod === 'csv' && !phoneColumn)
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Campaign"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </>
  );
};
