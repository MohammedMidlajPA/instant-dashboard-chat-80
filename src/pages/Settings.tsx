
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
  const [compactMode, setCompactMode] = useState(false);
  const [notifications, setNotifications] = useState({
    calls: true,
    email: false,
    desktop: true
  });
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

  const handleToggleNotification = (type: keyof typeof notifications) => {
    setNotifications(prev => {
      const newState = { ...prev, [type]: !prev[type] };
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} notifications ${newState[type] ? 'enabled' : 'disabled'}`);
      return newState;
    });
  };

  return (
    <DashboardLayout>
      <div className="container max-w-5xl p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your application preferences and configurations</p>
          </div>
        </div>

        <Tabs defaultValue="mcube" className="w-full">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="mcube" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              MCUBE
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <BellRing className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mcube" className="space-y-4 mt-4">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  MCUBE API Configuration
                </CardTitle>
                <CardDescription>
                  Configure your MCUBE API credentials for call integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="mcubeApiToken">MCUBE API Token</Label>
                  <Input
                    id="mcubeApiToken"
                    type="password"
                    placeholder="Enter your MCUBE API token"
                    value={mcubeApiToken}
                    onChange={(e) => setMcubeApiToken(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
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
                  className="min-w-[100px]"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>Interface Preferences</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="theme-mode" className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
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
                
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 space-y-1">
                    <Label className="text-base">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Use more condensed UI elements to fit more on screen
                    </p>
                  </div>
                  <Switch 
                    checked={compactMode}
                    onCheckedChange={setCompactMode}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 space-y-1">
                    <Label className="text-base">Call Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for incoming and missed calls
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.calls}
                    onCheckedChange={() => handleToggleNotification('calls')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 space-y-1">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily email summaries of call activities
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={() => handleToggleNotification('email')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 space-y-1">
                    <Label className="text-base">Desktop Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show desktop notifications for important events
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.desktop}
                    onCheckedChange={() => handleToggleNotification('desktop')}
                  />
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
