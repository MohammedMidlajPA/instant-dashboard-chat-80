
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ui/theme-provider";

import { 
  Phone,
  Megaphone,
  CalendarClock,
  UserCircle,
  Settings2,
  Users,
  PhoneOutgoing,
  SunMoon,
  Moon,
  Sun,
  LogOut,
  Home
} from "lucide-react";

export function AppSidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Sidebar>
      <div className="flex h-full flex-col border-r border-border sidebar-gradient dark:bg-sidebar">
        <div className="flex h-16 items-center px-5 bg-primary text-primary-foreground dark:header-gradient">
          <Link 
            to="/" 
            className="flex items-center gap-2 font-medium transition-colors"
          >
            <Phone className="h-5 w-5" />
            <span className="text-lg font-semibold tracking-tight">MCUBE Call Center</span>
          </Link>
          <SidebarTrigger className="ml-auto h-8 w-8 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" />
        </div>
        
        <Separator className="my-2" />
        
        <ScrollArea className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center">
            <Link to="/mcube-dashboard">
              <Button
                variant={isActive("/mcube-dashboard") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            
            <Link to="/outbound-calling">
              <Button
                variant={isActive("/outbound-calling") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <PhoneOutgoing className="mr-2 h-4 w-4" />
                <span>Outbound Calls</span>
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
        
        <div className="mt-auto p-4 border-t border-border bg-muted/10 dark:bg-sidebar-accent/20">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs text-foreground font-medium">
              MCUBE Call Center
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>MC</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Jason Matthews</p>
              <p className="text-xs text-muted-foreground truncate">Support Agent</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}

// Import components used in the sidebar
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
