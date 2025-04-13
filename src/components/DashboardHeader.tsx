
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Moon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-white px-6">
      <SidebarTrigger />
      <div className="relative flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search or type command..."
            className="w-full rounded-lg bg-gray-50 pl-10 pr-4 py-2 border-gray-200"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-200 px-1.5 py-0.5 rounded text-xs text-gray-600">
            ⌘K
          </div>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
          <Moon className="h-5 w-5 text-gray-600" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="sr-only">Notifications</span>
        </Button>
        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
          <AvatarFallback>MF</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
