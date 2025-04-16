
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

import { 
  LayoutDashboard, 
  Megaphone,
  BarChart3,
  CalendarClock,
  UserCircle,
  Settings2,
  FileBarChart,
  Users,
  PieChart,
  Phone,
  GraduationCap,
  PhoneOutgoing,
  Loader2
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

  return (
    <Sidebar>
      <div className="flex h-full flex-col bg-slate-50">
        <div className="flex h-14 items-center px-5 lg:h-[60px] bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <Link 
            to="/" 
            className="flex items-center gap-2 font-medium transition-colors"
          >
            <GraduationCap className="h-5 w-5" />
            <span className="text-lg font-semibold tracking-tight">CollegeAI</span>
          </Link>
          <SidebarTrigger className="ml-auto h-8 w-8 text-white hover:bg-blue-700 hover:text-white" />
        </div>
        
        <Card className="m-3 border shadow-sm">
          <CardHeader className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
              <PhoneOutgoing className="h-4 w-4" />
              Quick Outbound Call
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-3 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="agentPhone" className="text-xs font-medium text-gray-700">
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
              <Label htmlFor="customerPhone" className="text-xs font-medium text-gray-700">
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
              className="w-full bg-blue-600 hover:bg-blue-700" 
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
            <Link to="/">
              <Button
                variant={isActive("/") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
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
            <Link to="/enrollment-analytics">
              <Button
                variant={isActive("/enrollment-analytics") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Enrollment</span>
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
            <Link to="/sales-dashboard">
              <Button
                variant={isActive("/sales-dashboard") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <PieChart className="mr-2 h-4 w-4" />
                <span>Admissions KPIs</span>
              </Button>
            </Link>
            <Link to="/call-analytics">
              <Button
                variant={isActive("/call-analytics") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <FileBarChart className="mr-2 h-4 w-4" />
                <span>Call Analytics</span>
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
        <div className="mt-auto p-4 border-t bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="grid gap-1">
            <div className="text-xs text-blue-600 font-medium">
              College Voice AI Platform
            </div>
            <div className="text-xs text-gray-500">v1.0.0</div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
