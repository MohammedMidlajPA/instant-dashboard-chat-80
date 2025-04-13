
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  CartesianGrid
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data for the charts
const revenueData = [
  { name: "Jan", target: 25000, actual: 32000 },
  { name: "Feb", target: 30000, actual: 28000 },
  { name: "Mar", target: 35000, actual: 40000 },
  { name: "Apr", target: 40000, actual: 42000 },
  { name: "May", target: 35000, actual: 38000 },
  { name: "Jun", target: 40000, actual: 45000 },
];

const dealStageData = [
  { name: "Leads", value: 30 },
  { name: "Qualified", value: 25 },
  { name: "Proposal", value: 20 },
  { name: "Negotiation", value: 15 },
  { name: "Closed", value: 10 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const teamData = [
  { name: "John Smith", deals: 24, revenue: "$120,500", conversion: "68%" },
  { name: "Sarah Johnson", deals: 22, revenue: "$98,700", conversion: "62%" },
  { name: "Michael Brown", deals: 18, revenue: "$87,200", conversion: "55%" },
  { name: "Emma Wilson", deals: 17, revenue: "$76,900", conversion: "51%" },
  { name: "David Lee", deals: 15, revenue: "$65,300", conversion: "48%" },
];

const SalesDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <p className="text-sm text-gray-500">Revenue (MTD)</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-2xl font-bold">$184,593</h3>
                  <span className="text-green-500 text-sm">+15.3%</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Compared to $160,000 last month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <p className="text-sm text-gray-500">Deals Closed</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-2xl font-bold">94</h3>
                  <span className="text-green-500 text-sm">+9.6%</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Compared to 86 last month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <p className="text-sm text-gray-500">Avg. Deal Size</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-2xl font-bold">$16,423</h3>
                  <span className="text-green-500 text-sm">+4.3%</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Compared to $15,748 last month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <p className="text-sm text-gray-500">Conversion Rate</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-2xl font-bold">32.8%</h3>
                  <span className="text-red-500 text-sm">-2.1%</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Compared to 34.9% last month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Revenue vs. Target</CardTitle>
              <Button variant="ghost" size="icon">
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="target" fill="#94a3b8" name="Target" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" fill="#4f46e5" name="Actual" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Deal Stage Distribution</CardTitle>
              <Button variant="ghost" size="icon">
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dealStageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dealStageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Performance */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Team Performance</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salesperson</TableHead>
                  <TableHead>Deals Closed</TableHead>
                  <TableHead>Revenue Generated</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamData.map((person) => (
                  <TableRow key={person.name}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{person.deals}</TableCell>
                    <TableCell>{person.revenue}</TableCell>
                    <TableCell>{person.conversion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Revenue Forecast */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Revenue Forecast (Next 6 Months)</CardTitle>
            <Button variant="ghost" size="icon">
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Current"
                    stroke="#4f46e5"
                    activeDot={{ r: 8 }}
                  />
                  <Line type="monotone" dataKey="target" name="Projected" stroke="#ff7c43" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SalesDashboard;
