
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { mcubeService } from "@/services/mcube";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useTheme } from "@/components/ui/theme-provider";

import { 
  Phone,
  Megaphone,
  CalendarClock,
  UserCircle,
  Settings2,
  Users,
  PhoneOutgoing,
  Loader2,
  SunMoon,
  Moon,
  Sun
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function AppSidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [collapsed, setCollapsed] = useState(isMobile);
  const [agentPhone, setAgentPhone] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setCollapsed(mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMakeCall = async () => {
    if (!agentPhone || !customerPhone) {
      toast.error("Agent and customer phone numbers are required");
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await mcubeService.makeOutboundCall(agentPhone, customerPhone);
      
      if (result.success) {
        toast.success("Call initiated successfully");
        setCustomerPhone(""); // Reset only customer phone
      } else {
        toast.error(result.message || "Failed to initiate call");
      }
    } catch (error) {
      console.error("Failed to make call:", error);
      toast.error("An error occurred while trying to initiate the call");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Sidebar>
      <div className="flex h-full flex-col bg-background border-r">
        <div className="flex h-14 items-center px-5 lg:h-[60px] bg-primary text-primary-foreground">
          <Link 
            to="/" 
            className="flex items-center gap-2 font-medium transition-colors"
          >
            <Phone className="h-5 w-5" />
            <span className="text-lg font-semibold tracking-tight">MCUBE Call Center</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="ml-auto text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <SidebarTrigger className="ml-2 h-8 w-8 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" />
        </div>
        
        <Card className="m-3 border shadow-sm">
          <CardHeader className="px-3 py-2 bg-muted/30 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
              <PhoneOutgoing className="h-4 w-4" />
              Quick Outbound Call
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-3 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="agentPhone" className="text-xs font-medium">
                Agent Phone
              </Label>
              <Input
                id="agentPhone"
                value={agentPhone}
                onChange={(e) => setAgentPhone(e.target.value)}
                placeholder="8767316316"
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="customerPhone" className="text-xs font-medium">
                Customer Phone
              </Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="5551234567"
                className="h-8 text-sm"
              />
            </div>
            
            <Button 
              className="w-full bg-primary hover:bg-primary/90" 
              size="sm" 
              disabled={isLoading || !agentPhone || !customerPhone}
              onClick={handleMakeCall}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Initiating...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Start Call
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <Separator className="my-2" />
        
        <ScrollArea className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center">
            <Link to="/mcube-dashboard">
              <Button
                variant={isActive("/mcube-dashboard") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Phone className="mr-2 h-4 w-4" />
                <span>Call Dashboard</span>
              </Button>
            </Link>
            <Link to="/campaigns">
              <Button
                variant={isActive("/campaigns") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Megaphone className="mr-2 h-4 w-4" />
                <span>Campaigns</span>
              </Button>
            </Link>
            <Link to="/calendar">
              <Button
                variant={isActive("/calendar") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <CalendarClock className="mr-2 h-4 w-4" />
                <span>Calendar</span>
              </Button>
            </Link>
            <Link to="/contacts">
              <Button
                variant={isActive("/contacts") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Contacts</span>
              </Button>
            </Link>
            <Link to="/profile">
              <Button
                variant={isActive("/profile") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Button>
            </Link>
            <Link to="/settings">
              <Button
                variant={isActive("/settings") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Settings2 className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Button>
            </Link>
          </nav>
        </ScrollArea>
        <div className="mt-auto p-4 border-t bg-muted/30">
          <div className="grid gap-1">
            <div className="text-xs text-primary font-medium">
              MCUBE Call Center
            </div>
            <div className="text-xs text-muted-foreground">v1.0.0</div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
