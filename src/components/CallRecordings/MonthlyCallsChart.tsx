
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MonthlyCallsChartProps {
  data?: any[];
}

// Sample data - in a real implementation, this would come from the API
const sampleData = [
  { month: 'Jan', admissions: 65, financialAid: 28, housing: 15, academic: 23, support: 10 },
  { month: 'Feb', admissions: 59, financialAid: 32, housing: 12, academic: 27, support: 8 },
  { month: 'Mar', admissions: 80, financialAid: 45, housing: 25, academic: 30, support: 12 },
  { month: 'Apr', admissions: 81, financialAid: 40, housing: 30, academic: 25, support: 15 },
  { month: 'May', admissions: 56, financialAid: 36, housing: 22, academic: 18, support: 9 },
  { month: 'Jun', admissions: 55, financialAid: 30, housing: 18, academic: 20, support: 7 },
];

export const MonthlyCallsChart: React.FC<MonthlyCallsChartProps> = ({ data = sampleData }) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Monthly Call Volume by Inquiry Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="admissions" name="Admissions" fill="#818cf8" />
              <Bar dataKey="financialAid" name="Financial Aid" fill="#10b981" />
              <Bar dataKey="housing" name="Housing" fill="#f59e0b" />
              <Bar dataKey="academic" name="Academic" fill="#3b82f6" />
              <Bar dataKey="support" name="Support" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
