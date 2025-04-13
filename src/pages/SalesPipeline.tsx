
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

const stages = [
  { id: 'prospect', name: 'Prospect', color: 'bg-blue-100 text-blue-800', count: 16, value: '$284,500' },
  { id: 'qualified', name: 'Qualified', color: 'bg-purple-100 text-purple-800', count: 12, value: '$195,200' },
  { id: 'proposal', name: 'Proposal', color: 'bg-orange-100 text-orange-800', count: 8, value: '$143,000' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-amber-100 text-amber-800', count: 5, value: '$97,500' },
  { id: 'closed', name: 'Closed Won', color: 'bg-green-100 text-green-800', count: 7, value: '$124,300' },
];

const deals = [
  { id: 1, name: 'Enterprise Solution for ABC Corp', value: '$42,500', company: 'ABC Corporation', probability: '60%', dueDate: '2023-06-15', stage: 'prospect' },
  { id: 2, name: 'Software License Renewal', value: '$28,000', company: 'XYZ Industries', probability: '90%', dueDate: '2023-05-30', stage: 'qualified' },
  { id: 3, name: 'Cloud Migration Project', value: '$65,000', company: 'Global Tech', probability: '75%', dueDate: '2023-07-10', stage: 'proposal' },
  { id: 4, name: 'Security Assessment', value: '$18,500', company: 'SecureNet Inc.', probability: '50%', dueDate: '2023-06-22', stage: 'prospect' },
  { id: 5, name: 'Data Analytics Platform', value: '$54,000', company: 'DataVision Co.', probability: '85%', dueDate: '2023-06-05', stage: 'negotiation' },
  { id: 6, name: 'Managed Services Contract', value: '$72,000', company: 'TechCare Solutions', probability: '95%', dueDate: '2023-05-28', stage: 'closed' },
];

const SalesPipeline = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Sales Pipeline</h1>
            <p className="text-muted-foreground">Track and manage your deals through the sales process</p>
          </div>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>

        {/* Pipeline Metrics */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Pipeline Value</h3>
                <p className="text-2xl font-bold mt-1">$844,500</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Weighted Pipeline Value</h3>
                <p className="text-2xl font-bold mt-1">$591,150</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Average Deal Size</h3>
                <p className="text-2xl font-bold mt-1">$40,214</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Close Rate</h3>
                <p className="text-2xl font-bold mt-1">28%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <div className="flex overflow-x-auto pb-4 gap-4">
          {stages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${stage.color}`}>{stage.name}</span>
                    <span className="ml-2 text-sm text-gray-500">{stage.count}</span>
                  </div>
                  <span className="text-sm font-medium">{stage.value}</span>
                </div>
                
                <div className="space-y-3">
                  {deals.filter(deal => deal.stage === stage.id).map((deal) => (
                    <Card key={deal.id} className="shadow-sm bg-white">
                      <CardContent className="p-4">
                        <h3 className="font-medium">{deal.name}</h3>
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-gray-500">{deal.company}</span>
                          <span className="font-medium">{deal.value}</span>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>Due: {new Date(deal.dueDate).toLocaleDateString()}</span>
                          <span>Prob: {deal.probability}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="ghost" className="w-full text-sm">
                    <PlusIcon className="h-3 w-3 mr-1" />
                    Add Deal
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalesPipeline;
