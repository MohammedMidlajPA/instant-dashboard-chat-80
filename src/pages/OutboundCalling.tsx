
import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, User, Mail, Building2, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { vapiService } from "@/services/vapiService";
import { useNavigate } from "react-router-dom";
import { VapiApiKeyForm } from "@/components/VapiApiKeyForm";

const OutboundCalling = () => {
  const navigate = useNavigate();
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  // Form state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");

  // Error state
  const [phoneNumberError, setPhoneNumberError] = useState("");

  const validatePhoneNumber = (phone: string) => {
    // Simple validation for E.164 format
    const regex = /^\+[1-9]\d{1,14}$/;
    if (!regex.test(phone)) {
      setPhoneNumberError("Phone number must be in E.164 format (e.g., +12125551234)");
      return false;
    }
    setPhoneNumberError("");
    return true;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    // Clear error when user starts typing again
    if (phoneNumberError) {
      setPhoneNumberError("");
    }
  };

  const handleInitiateCall = async () => {
    // Validate before proceeding
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }

    try {
      setIsCalling(true);

      const callPayload = {
        phone_number: phoneNumber,
        first_name: contactName,
        metadata: {
          email: contactEmail,
          company: company,
          notes: notes
        }
      };

      const response = await vapiService.createOutboundCall(callPayload);

      toast.success("Call initiated successfully!");
      
      // Navigate to call recordings page to see the call
      navigate("/call-recordings");
    } catch (error) {
      console.error("Error initiating call:", error);
      toast.error("Failed to initiate call. Please try again.");
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Outbound Calling</h1>
          <p className="text-muted-foreground">
            Connect with prospective students through AI-assisted phone calls
          </p>
        </div>

        <VapiApiKeyForm onApiKeySet={setIsApiKeySet} />

        {isApiKeySet && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Make a Call</CardTitle>
                <CardDescription>
                  Provide contact details to initiate an outbound call
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone-number">
                      Phone Number (E.164 format) *
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="phone-number"
                        placeholder="+12125551234"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        className={`pl-10 ${
                          phoneNumberError ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                    {phoneNumberError && (
                      <p className="text-sm text-red-500">{phoneNumberError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Contact Name</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="contact-name"
                        placeholder="John Doe"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="john.doe@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">School/Organization</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Building2 className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="company"
                        placeholder="High School / Organization"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any context or notes for this call..."
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleInitiateCall}
                    disabled={isCalling || !phoneNumber}
                  >
                    {isCalling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initiating Call...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Initiate Call
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>
                  Our AI-powered calling system helps you connect with prospective students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                      <span className="text-blue-800 text-lg font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Enter Contact Details</h3>
                      <p className="text-sm text-gray-600">
                        Provide the student's phone number and any additional context
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                      <span className="text-blue-800 text-lg font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium">AI Makes the Call</h3>
                      <p className="text-sm text-gray-600">
                        Our assistant calls the student and introduces your institution
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                      <span className="text-blue-800 text-lg font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Answers Questions</h3>
                      <p className="text-sm text-gray-600">
                        The AI answers common questions about admissions, programs, and campus life
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                      <span className="text-blue-800 text-lg font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Review Call Recording</h3>
                      <p className="text-sm text-gray-600">
                        Access transcripts and recordings to follow up with interested students
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      For bulk outreach, use our <a href="/campaigns" className="text-blue-600 hover:underline">Campaign feature</a> to upload lists of students.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OutboundCalling;
