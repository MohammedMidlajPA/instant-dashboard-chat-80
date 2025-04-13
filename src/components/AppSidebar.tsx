
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  GraduationCap,
  Users,
  MessagesSquare,
  FileText,
  Calendar,
  Settings,
  Home,
  PhoneCall,
  Phone,
  Megaphone
} from "lucide-react";

export const AppSidebar = () => {
  const location = useLocation();

  const navigationItems = [
    {
      name: "Dashboard",
      to: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Call Recordings",
      to: "/call-recordings",
      icon: <PhoneCall className="h-5 w-5" />,
    },
    {
      name: "Campaigns",
      to: "/campaigns",
      icon: <Megaphone className="h-5 w-5" />,
    },
    {
      name: "Outbound Calling",
      to: "/outbound-calling",
      icon: <Phone className="h-5 w-5" />,
    },
    {
      name: "Calendar",
      to: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Enrollment Analytics",
      to: "/enrollment-analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Settings",
      to: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <GraduationCap className="h-6 w-6 text-blue-600" />
        <h1 className="text-lg font-semibold">College CRM</h1>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navigationItems.map((item) => (
            <Button
              key={item.to}
              variant={location.pathname === item.to ? "secondary" : "ghost"}
              className="justify-start"
              asChild
            >
              <Link to={item.to}>
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
};
