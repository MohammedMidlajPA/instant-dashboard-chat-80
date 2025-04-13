
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

const stages = [
  { id: 'inquiry', name: 'Initial Inquiry', color: 'bg-blue-100 text-blue-800', count: 16, value: '16 students' },
  { id: 'applied', name: 'Application Submitted', color: 'bg-purple-100 text-purple-800', count: 12, value: '12 students' },
  { id: 'interview', name: 'Interview Scheduled', color: 'bg-orange-100 text-orange-800', count: 8, value: '8 students' },
  { id: 'review', name: 'Under Review', color: 'bg-amber-100 text-amber-800', count: 5, value: '5 students' },
  { id: 'accepted', name: 'Accepted', color: 'bg-green-100 text-green-800', count: 7, value: '7 students' },
];

const prospectiveStudents = [
  { id: 1, name: 'Jason Smith', value: 'Computer Science', company: 'Lincoln High School', probability: '60%', dueDate: '2023-06-15', stage: 'inquiry' },
  { id: 2, name: 'Sarah Johnson', value: 'Biology', company: 'Transfer Student', probability: '90%', dueDate: '2023-05-30', stage: 'applied' },
  { id: 3, name: 'Michael Brown', value: 'Engineering', company: 'Community College', probability: '75%', dueDate: '2023-07-10', stage: 'interview' },
  { id: 4, name: 'Emily Wilson', value: 'Psychology', company: 'Wilson Family', probability: '50%', dueDate: '2023-06-22', stage: 'inquiry' },
  { id: 5, name: 'David Lee', value: 'Business', company: 'Graduate Applicant', probability: '85%', dueDate: '2023-06-05', stage: 'review' },
  { id: 6, name: 'Sophia Garcia', value: 'Education', company: 'Garcia Academy', probability: '95%', dueDate: '2023-05-28', stage: 'accepted' },
];

const SalesPipeline = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Recruitment Pipeline</h1>
            <p className="text-muted-foreground">Track and manage prospective students through the admissions process</p>
          </div>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Pipeline Metrics */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Prospects</h3>
                <p className="text-2xl font-bold mt-1">48 students</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Application Rate</h3>
                <p className="text-2xl font-bold mt-1">75%</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Average Response Time</h3>
                <p className="text-2xl font-bold mt-1">1.2 days</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Acceptance Rate</h3>
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
                  {prospectiveStudents.filter(student => student.stage === stage.id).map((student) => (
                    <Card key={student.id} className="shadow-sm bg-white">
                      <CardContent className="p-4">
                        <h3 className="font-medium">{student.name}</h3>
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-gray-500">{student.company}</span>
                          <span className="font-medium">{student.value}</span>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>Due: {new Date(student.dueDate).toLocaleDateString()}</span>
                          <span>Interest: {student.probability}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="ghost" className="w-full text-sm">
                    <PlusIcon className="h-3 w-3 mr-1" />
                    Add Student
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
