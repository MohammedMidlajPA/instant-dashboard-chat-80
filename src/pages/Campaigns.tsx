
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { vapiService } from "@/services/vapiService";
import { VapiApiKeyForm } from "@/components/VapiApiKeyForm";
import { CampaignList } from "@/components/Campaigns/CampaignList";
import { CampaignForm } from "@/components/Campaigns/CampaignForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Campaigns = () => {
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("existing");

  const fetchCampaigns = async () => {
    if (!isApiKeySet) return;
    
    try {
      setIsLoading(true);
      const response = await vapiService.getCampaigns();
      setCampaigns(response.campaigns || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isApiKeySet) {
      fetchCampaigns();
    }
  }, [isApiKeySet]);

  const handleCampaignCreated = () => {
    toast.success("Campaign created successfully!");
    fetchCampaigns();
    setActiveTab("existing");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Student Outreach Campaigns</h1>
          <p className="text-muted-foreground">Create and manage automated call campaigns for student recruitment</p>
        </div>

        <VapiApiKeyForm onApiKeySet={setIsApiKeySet} />

        {isApiKeySet && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="existing">Existing Campaigns</TabsTrigger>
              <TabsTrigger value="new">Create New Campaign</TabsTrigger>
            </TabsList>
            
            <TabsContent value="existing" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Active Campaigns</CardTitle>
                    <CardDescription>
                      View and manage your ongoing outreach campaigns
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchCampaigns}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </CardHeader>
                <CardContent>
                  <CampaignList 
                    campaigns={campaigns} 
                    isLoading={isLoading}
                    onRefresh={fetchCampaigns}
                    onSelect={(campaign) => {
                      setActiveCampaign(campaign);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="new" className="mt-4">
              <CampaignForm 
                onSuccess={handleCampaignCreated}
                onCancel={() => setActiveTab("existing")}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;
