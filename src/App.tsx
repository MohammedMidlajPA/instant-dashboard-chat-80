
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SalesDashboard from "./pages/SalesDashboard";
import SalesPipeline from "./pages/SalesPipeline";
import CallRecordings from "./pages/CallRecordings";
import Campaigns from "./pages/Campaigns";
import Contacts from "./pages/Contacts";
import OutboundCalling from "./pages/OutboundCalling";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import EnrollmentAnalytics from "./pages/EnrollmentAnalytics";
import Index from "./pages/Index";
import CallAnalytics from "./pages/CallAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sales-dashboard" element={<SalesDashboard />} />
          <Route path="/sales-pipeline" element={<SalesPipeline />} />
          <Route path="/call-recordings" element={<CallRecordings />} />
          <Route path="/call-analytics" element={<CallAnalytics />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/outbound-calling" element={<OutboundCalling />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/enrollment-analytics" element={<EnrollmentAnalytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
