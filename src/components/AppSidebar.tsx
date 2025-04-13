
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
  Briefcase
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
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/",
  },
  {
    title: "Sales Dashboard",
    icon: BarChart2,
    url: "/sales-dashboard",
  },
  {
    title: "Sales Pipeline",
    icon: Briefcase,
    url: "/sales-pipeline",
  },
  {
    title: "Call Recordings",
    icon: PhoneCall,
    url: "/call-recordings",
  },
  {
    title: "Contacts",
    icon: Contact,
    url: "/contacts",
  },
  {
    title: "Outbound Calling",
    icon: MessageSquare,
    url: "/outbound-calling",
  },
  {
    title: "Calendar",
    icon: Calendar,
    url: "/calendar",
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

export function AppSidebar() {
  const location = useLocation();
  
  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="pt-6 pl-6 font-poppins">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white">
            TA
          </div>
          <span className="text-blue-600">TailAdmin</span>
        </Link>
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
                        location.pathname === item.url && "text-blue-600 font-medium"
                      )}
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="py-4 pl-6 text-xs uppercase text-muted-foreground font-medium tracking-wider">
          OTHERS
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
                        location.pathname === item.url && "text-blue-600 font-medium"
                      )}
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
            <p className="text-sm font-medium leading-none truncate">Musharof</p>
            <p className="text-xs text-muted-foreground truncate">musharof@example.com</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
