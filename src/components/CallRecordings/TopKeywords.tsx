
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopKeywordsProps {
  keywords?: Array<{keyword: string, count: number}>;
}

// Sample data - in a real implementation, this would come from the API
const sampleKeywords = [
  { keyword: "application deadline", count: 42 },
  { keyword: "financial aid", count: 38 },
  { keyword: "campus housing", count: 35 },
  { keyword: "transcript", count: 29 },
  { keyword: "transfer credits", count: 27 },
  { keyword: "scholarship", count: 24 },
  { keyword: "admission requirements", count: 22 },
  { keyword: "campus tour", count: 20 },
];

export const TopKeywords: React.FC<TopKeywordsProps> = ({ keywords = sampleKeywords }) => {
  // Calculate the maximum count to determine the relative width of bars
  const maxCount = Math.max(...keywords.map(k => k.count));

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Top Discussion Topics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {keywords.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>{item.keyword}</span>
                <span className="font-medium">{item.count}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
