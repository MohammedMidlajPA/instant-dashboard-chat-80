
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Calendar,
  Contact,
  LayoutDashboard,
  Phone,
  Settings,
  User,
  PhoneCall,
  MessageCircle,
  Brain,
  Users,
  PieChart,
  LineChart,
  BarChart,
  GraduationCap,
  Sparkles
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
  },
  {
    title: "Call Recordings",
    href: "/call-recordings",
    icon: <Phone className="mr-2 h-4 w-4" />,
  },
  {
    title: "Call Analytics",
    href: "/call-analytics",
    icon: <BarChart3 className="mr-2 h-4 w-4" />,
  },
  {
    title: "MCUBE Dashboard",
    href: "/mcube-dashboard",
    icon: <PhoneCall className="mr-2 h-4 w-4" />,
  },
  {
    title: "Huerize AI Analytics",
    href: "/syntheon-dashboard",
    icon: <Sparkles className="mr-2 h-4 w-4" />,
  },
  {
    title: "Enrollment Analytics",
    href: "/enrollment-analytics",
    icon: <BookOpen className="mr-2 h-4 w-4" />,
  },
  {
    title: "Contacts",
    href: "/contacts",
    icon: <Contact className="mr-2 h-4 w-4" />,
  },
  {
    title: "Campaigns",
    href: "/campaigns",
    icon: <MessageCircle className="mr-2 h-4 w-4" />,
  },
  {
    title: "Outbound Calling",
    href: "/outbound-calling",
    icon: <PhoneCall className="mr-2 h-4 w-4" />,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: <Calendar className="mr-2 h-4 w-4" />,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const [brandName, setBrandName] = useState("College CRM");
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="pb-12 w-64 border-r min-h-screen relative bg-gradient-to-b from-slate-50 to-white shadow-sm">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          {isEditing ? (
            <div className="flex items-center mb-2 px-2">
              <Input 
                value={brandName} 
                onChange={(e) => setBrandName(e.target.value)}
                className="text-lg font-semibold"
                autoFocus
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              />
            </div>
          ) : (
            <h2 
              className="mb-2 px-2 text-lg font-semibold tracking-tight cursor-pointer hover:text-primary transition-colors flex items-center"
              onClick={() => setIsEditing(true)}
            >
              {brandName}
              <Settings className="ml-2 h-3 w-3 opacity-50" />
            </h2>
          )}
          <div className="space-y-1">
            {sidebarNavItems.map((item) => (
              <Button
                key={item.href}
                variant={location.pathname === item.href ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start",
                  location.pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-slate-100"
                )}
                asChild
              >
                <Link to={item.href}>
                  {item.icon}
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <Separator />
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Account
          </h2>
          <div className="space-y-1">
            <Button
              variant={location.pathname === "/profile" ? "default" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start",
                location.pathname === "/profile" ? "bg-primary text-primary-foreground" : "hover:bg-slate-100"
              )}
              asChild
            >
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
            <Button
              variant={location.pathname === "/settings" ? "default" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start",
                location.pathname === "/settings" ? "bg-primary text-primary-foreground" : "hover:bg-slate-100"
              )}
              asChild
            >
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppSidebar;
