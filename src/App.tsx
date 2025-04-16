
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Index from "@/pages/Index";
import Settings from "@/pages/Settings";
import Campaigns from "@/pages/Campaigns";
import Dashboard from "@/pages/Dashboard";
import SalesDashboard from "@/pages/SalesDashboard";
import CallRecordings from "@/pages/CallRecordings";
import OutboundCalling from "@/pages/OutboundCalling";
import NotFound from "@/pages/NotFound";
import Calendar from "@/pages/Calendar";
import Profile from "@/pages/Profile";
import EnrollmentAnalytics from "@/pages/EnrollmentAnalytics";
import Contacts from "@/pages/Contacts";
import SalesPipeline from "@/pages/SalesPipeline";
import CallAnalytics from "@/pages/CallAnalytics";
import McubeDashboard from "@/pages/McubeDashboard";

import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
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
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/sales-dashboard",
    element: <SalesDashboard />,
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
    path: "/enrollment-analytics",
    element: <EnrollmentAnalytics />,
  },
  {
    path: "/contacts",
    element: <Contacts />,
  },
  {
    path: "/sales-pipeline",
    element: <SalesPipeline />,
  },
  {
    path: "/call-analytics",
    element: <CallAnalytics />,
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
    <ThemeProvider defaultTheme="light" storageKey="lovable-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
