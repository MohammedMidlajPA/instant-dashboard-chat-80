
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Settings2, Key, Phone, BellRing, Moon, Sun } from "lucide-react";
import { mcubeService } from "@/services/mcube";
import { toast } from "sonner";
import { useTheme } from "@/components/ui/theme-provider";

const Settings = () => {
  const [mcubeApiToken, setMcubeApiToken] = useState(mcubeService.getToken() || "");
  const [saving, setSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSaveMcubeToken = () => {
    setSaving(true);
    try {
      if (mcubeApiToken) {
        mcubeService.setToken(mcubeApiToken);
        toast.success("MCUBE API token saved successfully");
      } else {
        mcubeService.clearToken();
        toast.info("MCUBE API token cleared");
      }
    } catch (error) {
      console.error("Error saving MCUBE token:", error);
      toast.error("Failed to save MCUBE API token");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings</p>
        </div>

        <Tabs defaultValue="mcube" className="w-full">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="mcube">
              <Phone className="h-4 w-4 mr-2" />
              MCUBE
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Settings2 className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <BellRing className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mcube" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  MCUBE API Configuration
                </CardTitle>
                <CardDescription>
                  Configure your MCUBE API credentials for call integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mcubeApiToken">MCUBE API Token</Label>
                  <Input
                    id="mcubeApiToken"
                    type="password"
                    placeholder="Enter your MCUBE API token"
                    value={mcubeApiToken}
                    onChange={(e) => setMcubeApiToken(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This token is used to authenticate with the MCUBE API for making calls
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button 
                  variant="outline" 
                  onClick={() => setMcubeApiToken(mcubeService.getToken() || "")}
                >
                  Reset
                </Button>
                <Button 
                  onClick={handleSaveMcubeToken}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="theme-mode">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <Switch 
                      id="theme-mode" 
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Use more condensed UI elements to fit more on screen
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Call Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications for incoming and missed calls
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive daily email summaries of call activities
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Desktop Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Show desktop notifications for important events
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
