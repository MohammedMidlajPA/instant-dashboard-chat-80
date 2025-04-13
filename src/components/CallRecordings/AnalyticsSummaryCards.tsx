
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneIcon, ClockIcon, UserIcon, GraduationCapIcon } from "lucide-react";

interface AnalyticsSummaryCardsProps {
  totalCalls: number;
  totalTalkTime: string;
  uniqueContacts: number;
  admissionsInquiries: number;
}

export const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({
  totalCalls = 127,
  totalTalkTime = "43h 12m",
  uniqueContacts = 84,
  admissionsInquiries = 58
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <PhoneIcon className="h-6 w-6 text-blue-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Calls</p>
              <h3 className="text-2xl font-bold">{totalCalls}</h3>
              <p className="text-xs text-green-500">+12% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <ClockIcon className="h-6 w-6 text-green-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Talk Time</p>
              <h3 className="text-2xl font-bold">{totalTalkTime}</h3>
              <p className="text-xs text-green-500">+8% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="bg-amber-100 p-3 rounded-full">
              <UserIcon className="h-6 w-6 text-amber-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Unique Students</p>
              <h3 className="text-2xl font-bold">{uniqueContacts}</h3>
              <p className="text-xs text-green-500">+15% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <GraduationCapIcon className="h-6 w-6 text-purple-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Admissions Inquiries</p>
              <h3 className="text-2xl font-bold">{admissionsInquiries}</h3>
              <p className="text-xs text-green-500">+20% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
