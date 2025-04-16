import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
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
  PhoneCall,
  Phone,
  GraduationCap
} from "lucide-react";

export function AppSidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [collapsed, setCollapsed] = React.useState(isMobile);

  React.useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  return (
    <Sidebar>
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-5 lg:h-[60px]">
          <Link 
            to="/" 
            className="flex items-center gap-2 font-medium transition-colors hover:text-foreground"
          >
            <GraduationCap className="h-5 w-5" />
            <span className="text-lg font-semibold tracking-tight">CollegeAI</span>
          </Link>
          <SidebarTrigger className="ml-auto h-8 w-8" />
        </div>
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
            <Link to="/call-recordings">
              <Button
                variant={isActive("/call-recordings") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <PhoneCall className="mr-2 h-4 w-4" />
                <span>Call Recordings</span>
              </Button>
            </Link>
            <Link to="/outbound-calling">
              <Button
                variant={isActive("/outbound-calling") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Phone className="mr-2 h-4 w-4" />
                <span>Voice Agent</span>
              </Button>
            </Link>
            <Link to="/mcube-dashboard">
              <Button
                variant={isActive("/mcube-dashboard") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Phone className="mr-2 h-4 w-4" />
                <span>MCUBE Dashboard</span>
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
        <div className="mt-auto border-t p-4">
          <div className="grid gap-1">
            <div className="text-xs text-muted-foreground">
              College Voice AI Platform
            </div>
            <div className="text-xs font-medium">v1.0.0</div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
