import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Phone, Users, CalendarClock } from "lucide-react";
import { useState } from "react";
import { CampaignForm } from "@/components/Campaigns/CampaignForm";

const Campaigns = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {!showForm ? (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Call Campaigns</h1>
                <p className="text-muted-foreground">Create and manage your outbound call campaigns</p>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    Active Campaigns
                  </CardTitle>
                  <CardDescription>Currently running</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">0</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    Total Contacts
                  </CardTitle>
                  <CardDescription>Across all campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">0</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <CalendarClock className="h-4 w-4 mr-2 text-primary" />
                    Scheduled Calls
                  </CardTitle>
                  <CardDescription>Upcoming today</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">0</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Campaigns</CardTitle>
                <CardDescription>Manage and monitor your outbound call campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You don't have any campaigns yet</p>
                  <Button onClick={() => setShowForm(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div>
            <Button 
              variant="outline" 
              onClick={() => setShowForm(false)}
              className="mb-4"
            >
              Back to Campaigns
            </Button>
            <CampaignForm
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;
