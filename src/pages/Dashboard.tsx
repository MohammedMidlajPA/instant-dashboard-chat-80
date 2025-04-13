
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DotsHorizontalIcon } from "@/components/icons/DotsHorizontalIcon";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

// Mock data for the charts
const monthlyData = [
  { name: "Jan", value: 180 },
  { name: "Feb", value: 400 },
  { name: "Mar", value: 250 },
  { name: "Apr", value: 320 },
  { name: "May", value: 200 },
  { name: "Jun", value: 220 },
  { name: "Jul", value: 300 },
  { name: "Aug", value: 100 },
  { name: "Sep", value: 220 },
  { name: "Oct", value: 400 },
  { name: "Nov", value: 320 },
  { name: "Dec", value: 140 },
];

const statisticsData = [
  { name: "Jan", value: 180 },
  { name: "Feb", value: 210 },
  { name: "Mar", value: 190 },
  { name: "Apr", value: 200 },
  { name: "May", value: 160 },
  { name: "Jun", value: 170 },
  { name: "Jul", value: 180 },
  { name: "Aug", value: 190 },
  { name: "Sep", value: 220 },
  { name: "Oct", value: 240 },
  { name: "Nov", value: 230 },
  { name: "Dec", value: 240 },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Row - Analytics Cards */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700">Customers</h3>
                  </div>
                  <div className="flex items-end gap-2">
                    <h2 className="text-3xl font-bold">3,782</h2>
                    <span className="flex items-center text-green-500 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>
                      11.01%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M5 8h14M5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M17 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M5 20h14"></path><path d="M5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M18 12H6a2 2 0 0 0-2 2v4"></path><path d="M18 12h2a2 2 0 0 1 2 2v4"></path></svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700">Orders</h3>
                  </div>
                  <div className="flex items-end gap-2">
                    <h2 className="text-3xl font-bold">5,359</h2>
                    <span className="flex items-center text-red-500 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m19 12-7 7-7-7"></path><path d="M12 5v14"></path></svg>
                      9.05%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Monthly Sales Chart */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Monthly Sales</CardTitle>
            <Button variant="ghost" size="icon">
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Monthly Target and Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="h-full shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Monthly Target</CardTitle>
                <Button variant="ghost" size="icon">
                  <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-6">
                <div className="relative h-48 w-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#e5e7eb" 
                      strokeWidth="10" 
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#4f46e5" 
                      strokeWidth="10" 
                      strokeDasharray="282.7" 
                      strokeDashoffset="70" 
                      strokeLinecap="round" 
                      transform="rotate(-90 50 50)" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">75.55%</span>
                    <span className="text-green-500 text-sm font-medium">+10%</span>
                  </div>
                </div>
                <p className="text-center mt-6 text-gray-600">
                  You earn $3287 today, it's higher than last month.
                  <br />Keep up your good work!
                </p>
                <div className="grid grid-cols-3 w-full gap-4 mt-6 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Target</p>
                    <p className="font-semibold flex items-center justify-center">
                      $20K
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-red-500"><path d="m19 12-7 7-7-7"></path><path d="M12 5v14"></path></svg>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="font-semibold flex items-center justify-center">
                      $20K
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-green-500"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Today</p>
                    <p className="font-semibold flex items-center justify-center">
                      $20K
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-green-500"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card className="h-full shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-medium">Statistics</CardTitle>
                  <p className="text-sm text-gray-500">Target you've set for each month</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-md">
                    Monthly
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 rounded-md">
                    Quarterly
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 rounded-md">
                    Annually
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[270px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={statisticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={false} axisLine={false} />
                      <YAxis tick={false} axisLine={false} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
