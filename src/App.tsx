
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Settings from "@/pages/Settings";
import Campaigns from "@/pages/Campaigns";
import CallRecordings from "@/pages/CallRecordings";
import OutboundCalling from "@/pages/OutboundCalling";
import NotFound from "@/pages/NotFound";
import Calendar from "@/pages/Calendar";
import Profile from "@/pages/Profile";
import Contacts from "@/pages/Contacts";
import McubeDashboard from "@/pages/McubeDashboard";

import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <McubeDashboard />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/campaigns",
    element: <Campaigns />,
  },
  {
    path: "/call-recordings",
    element: <CallRecordings />,
  },
  {
    path: "/outbound-calling",
    element: <OutboundCalling />,
  },
  {
    path: "/calendar",
    element: <Calendar />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/contacts",
    element: <Contacts />,
  },
  {
    path: "/mcube-dashboard",
    element: <McubeDashboard />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="mcube-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
