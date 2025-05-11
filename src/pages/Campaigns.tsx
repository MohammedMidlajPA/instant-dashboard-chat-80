
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Phone, Users, CalendarClock, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { CampaignForm } from "@/components/Campaigns/CampaignForm";
import { CampaignList } from "@/components/Campaigns/CampaignList";
import { mcubeService } from "@/services/mcube";
import { toast } from "sonner";

const Campaigns = () => {
  const [showForm, setShowForm] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  useEffect(() => {
    if (!showForm) {
      loadCampaigns();
    }
  }, [showForm]);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await mcubeService.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadCampaigns();
  };

  const handleSelectCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {!showForm && !selectedCampaign ? (
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
                  <p className="text-3xl font-bold">
                    {isLoading ? 
                      <Loader className="h-6 w-6 animate-spin text-muted-foreground" /> : 
                      campaigns.filter(c => c.status === 'active').length}
                  </p>
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
                  <p className="text-3xl font-bold">
                    {isLoading ? 
                      <Loader className="h-6 w-6 animate-spin text-muted-foreground" /> : 
                      campaigns.reduce((sum, campaign) => sum + (campaign.contacts_count || 0), 0)}
                  </p>
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
                  <p className="text-3xl font-bold">
                    {isLoading ? 
                      <Loader className="h-6 w-6 animate-spin text-muted-foreground" /> : 
                      campaigns.filter(c => c.status === 'scheduled').reduce((sum, campaign) => sum + (campaign.contacts_count || 0), 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Campaigns</CardTitle>
                <CardDescription>Manage and monitor your outbound call campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                {campaigns.length > 0 ? (
                  <CampaignList
                    campaigns={campaigns}
                    isLoading={isLoading}
                    onRefresh={handleRefresh}
                    onSelect={handleSelectCampaign}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You don't have any campaigns yet</p>
                    <Button onClick={() => setShowForm(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Your First Campaign
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : selectedCampaign ? (
          <div>
            <Button 
              variant="outline" 
              onClick={() => setSelectedCampaign(null)}
              className="mb-4"
            >
              Back to Campaigns
            </Button>
            <Card>
              <CardHeader>
                <CardTitle>{selectedCampaign.name}</CardTitle>
                <CardDescription>Campaign Details & Analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-blue-800 mb-1">Total Calls</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedCampaign.contacts_count || 0}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-sm text-green-800 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{selectedCampaign.completed_count || 0}</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-md">
                    <p className="text-sm text-amber-800 mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {selectedCampaign.contacts_count ? 
                        Math.round(((selectedCampaign.completed_count || 0) / selectedCampaign.contacts_count) * 100) + '%' : 
                        '0%'}
                    </p>
                  </div>
                </div>

                {/* Placeholder for campaign details and charts - would be implemented with real data */}
                <div className="p-6 border rounded-md flex items-center justify-center bg-gray-50">
                  <p className="text-muted-foreground">Campaign analytics will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
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
