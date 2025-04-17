
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
  Brain
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
    title: "Syntheon.ai Analytics",
    href: "/syntheon-dashboard",
    icon: <Brain className="mr-2 h-4 w-4" />,
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
  
  return (
    <div className="pb-12 w-64 border-r min-h-screen relative">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            College CRM
          </h2>
          <div className="space-y-1">
            {sidebarNavItems.map((item) => (
              <Button
                key={item.href}
                variant={location.pathname === item.href ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
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
              className="w-full justify-start"
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
              className="w-full justify-start"
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
