
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon, FilterIcon, DownloadIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const contacts = [
  { 
    id: 1, 
    name: 'John Smith', 
    company: 'ABC Corporation', 
    position: 'CTO',
    email: 'john.smith@abccorp.com',
    phone: '+1 (555) 123-4567',
    lastContact: '2023-05-15',
    score: 85,
  },
  { 
    id: 2, 
    name: 'Sarah Johnson', 
    company: 'XYZ Industries', 
    position: 'VP of Sales',
    email: 'sarah.johnson@xyzind.com',
    phone: '+1 (555) 234-5678',
    lastContact: '2023-05-10',
    score: 92,
  },
  { 
    id: 3, 
    name: 'Michael Brown', 
    company: 'Acme Inc.', 
    position: 'IT Director',
    email: 'mbrown@acmeinc.com',
    phone: '+1 (555) 345-6789',
    lastContact: '2023-05-08',
    score: 78,
  },
  { 
    id: 4, 
    name: 'Emily Wilson', 
    company: 'Tech Solutions', 
    position: 'CEO',
    email: 'emily.wilson@techsolutions.com',
    phone: '+1 (555) 456-7890',
    lastContact: '2023-05-05',
    score: 90,
  },
  { 
    id: 5, 
    name: 'David Lee', 
    company: 'Global Enterprises', 
    position: 'CFO',
    email: 'david.lee@globalent.com',
    phone: '+1 (555) 567-8901',
    lastContact: '2023-05-02',
    score: 76,
  }
];

const LeadScoreBadge = ({ score }: { score: number }) => {
  let color = "bg-red-100 text-red-800";
  
  if (score >= 90) {
    color = "bg-green-100 text-green-800";
  } else if (score >= 80) {
    color = "bg-blue-100 text-blue-800";
  } else if (score >= 70) {
    color = "bg-amber-100 text-amber-800";
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {score}
    </span>
  );
};

const Contacts = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Contacts</h1>
            <p className="text-muted-foreground">Manage your contacts and leads</p>
          </div>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium text-gray-500">Total Contacts</h3>
              <p className="text-2xl font-bold mt-1">547</p>
              <p className="text-xs text-green-500 mt-1">+24 this month</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium text-gray-500">High-Value Leads</h3>
              <p className="text-2xl font-bold mt-1">128</p>
              <p className="text-xs text-green-500 mt-1">+12 this month</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium text-gray-500">New Contacts</h3>
              <p className="text-2xl font-bold mt-1">38</p>
              <p className="text-xs text-green-500 mt-1">+15% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search contacts..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Contacts Table */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Lead Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.company}</TableCell>
                    <TableCell>{contact.position}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{new Date(contact.lastContact).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <LeadScoreBadge score={contact.score} />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Contacts;
