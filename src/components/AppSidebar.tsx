
import {
  BarChart2,
  Home,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  PlusSquare,
  FileText,
  Calendar,
  UserCircle,
  PhoneCall,
  Contact,
  Briefcase,
  Bell,
  CreditCard,
  LogOut,
  ChevronDown,
  ChevronRight
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/",
    notification: 0,
  },
  {
    title: "Sales Dashboard",
    icon: BarChart2,
    url: "/sales-dashboard",
    notification: 0,
  },
  {
    title: "Sales Pipeline",
    icon: Briefcase,
    url: "/sales-pipeline",
    notification: 3,
  },
  {
    title: "Call Recordings",
    icon: PhoneCall,
    url: "/call-recordings",
    notification: 0,
  },
  {
    title: "Contacts",
    icon: Contact,
    url: "/contacts",
    notification: 0,
  },
  {
    title: "Outbound Calling",
    icon: MessageSquare,
    url: "/outbound-calling",
    notification: 0,
  },
  {
    title: "Calendar",
    icon: Calendar,
    url: "/calendar",
    notification: 2,
  }
];

const utilityItems = [
  {
    title: "Profile",
    icon: UserCircle,
    url: "/profile",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
];

// User roles and permissions
const userRoles = [
  { id: "admin", name: "Administrator", color: "bg-purple-100 text-purple-800" },
  { id: "manager", name: "Manager", color: "bg-blue-100 text-blue-800" },
  { id: "agent", name: "Agent", color: "bg-green-100 text-green-800" },
  { id: "viewer", name: "Viewer", color: "bg-gray-100 text-gray-800" },
];

export function AppSidebar() {
  const location = useLocation();
  const [companyName, setCompanyName] = useState("VoiceFlowAI");
  const [userRole, setUserRole] = useState("admin");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(companyName);
  
  const handleNameEdit = () => {
    setTempName(companyName);
    setIsEditingName(true);
  };
  
  const handleNameSave = () => {
    if (tempName.trim()) {
      setCompanyName(tempName);
    }
    setIsEditingName(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
    }
  };
  
  const currentRole = userRoles.find(role => role.id === userRole);
  
  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="pt-6 pl-6 pr-6 font-poppins">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white">
            VA
          </div>
          
          {isEditingName ? (
            <div className="flex-1">
              <input
                type="text"
                className="text-lg font-bold w-full border border-purple-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-2 flex-1">
              <span className="text-xl font-bold text-purple-600">{companyName}</span>
            </Link>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={isEditingName ? handleNameSave : handleNameEdit}
          >
            {isEditingName ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <Settings className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 flex items-center gap-2 ml-1 mb-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${currentRole?.color}`}>
            {currentRole?.name}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-1">
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Change Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userRoles.map(role => (
                <DropdownMenuItem 
                  key={role.id}
                  className={`flex items-center gap-2 ${role.id === userRole ? 'bg-accent' : ''}`}
                  onClick={() => setUserRole(role.id)}
                >
                  <span className={`w-2 h-2 rounded-full ${role.color.split(' ')[0]}`} />
                  {role.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="py-4 pl-6 text-xs uppercase text-muted-foreground font-medium tracking-wider">
          MENU
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link
                      to={item.url}
                      className={cn(
                        "flex gap-2 items-center",
                        location.pathname === item.url && "text-purple-600 font-medium"
                      )}
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.notification > 0 && (
                    <SidebarMenuBadge className="bg-purple-100 text-purple-800">
                      {item.notification}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="py-4 pl-6 text-xs uppercase text-muted-foreground font-medium tracking-wider">
          ACCOUNT
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {utilityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link 
                      to={item.url} 
                      className={cn(
                        "flex gap-2 items-center",
                        location.pathname === item.url && "text-purple-600 font-medium"
                      )}
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button 
                    className="flex gap-2 items-center text-red-500 hover:text-red-600"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="py-4 border-t">
        <div className="px-4 flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
            <AvatarFallback>MF</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium leading-none truncate">Alex Morgan</p>
            <p className="text-xs text-muted-foreground truncate">alex@voiceflowai.com</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Account Settings</DropdownMenuItem>
              <DropdownMenuItem>Notifications</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
