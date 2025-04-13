
import React from "react";

interface InquiryTypeBadgeProps {
  type: string;
}

export const InquiryTypeBadge: React.FC<InquiryTypeBadgeProps> = ({ type }) => {
  const styles = {
    'Admissions': "bg-indigo-100 text-indigo-800",
    'Financial Aid': "bg-green-100 text-green-800",
    'Housing': "bg-amber-100 text-amber-800",
    'Academic': "bg-blue-100 text-blue-800",
    'Support': "bg-red-100 text-red-800",
    'General Inquiry': "bg-gray-100 text-gray-800"
  };
  
  const color = styles[type as keyof typeof styles] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {type}
    </span>
  );
};
