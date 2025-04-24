
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import CallRecordings from './pages/CallRecordings';
import CallAnalytics from './pages/CallAnalytics';
import SalesDashboard from './pages/SalesDashboard';
import SalesPipeline from './pages/SalesPipeline';
import Calendar from './pages/Calendar';
import Contacts from './pages/Contacts';
import Campaigns from './pages/Campaigns';
import OutboundCalling from './pages/OutboundCalling';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import McubeDashboard from './pages/McubeDashboard';
import SyntheonDashboard from './pages/SyntheonDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/call-recordings" element={<CallRecordings />} />
        <Route path="/call-analytics" element={<CallAnalytics />} />
        <Route path="/sales-dashboard" element={<SalesDashboard />} />
        <Route path="/sales-pipeline" element={<SalesPipeline />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/outbound-calling" element={<OutboundCalling />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/mcube-dashboard" element={<McubeDashboard />} />
        <Route path="/syntheon-dashboard" element={<SyntheonDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
