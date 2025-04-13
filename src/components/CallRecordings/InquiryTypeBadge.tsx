
import React from "react";

interface InquiryTypeBadgeProps {
  type: string;
}

export const InquiryTypeBadge: React.FC<InquiryTypeBadgeProps> = ({ type }) => {
  const styles = {
    'Admissions': "bg-indigo-100 text-indigo-800",
    'Financial Aid': "bg-emerald-100 text-emerald-800",
    'Housing': "bg-amber-100 text-amber-800",
    'Academic': "bg-cyan-100 text-cyan-800",
    'Support': "bg-purple-100 text-purple-800",
    'Career Services': "bg-rose-100 text-rose-800",
    'Scheduling': "bg-blue-100 text-blue-800",
    'General Inquiry': "bg-gray-100 text-gray-800",
  };
  
  const color = styles[type as keyof typeof styles] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {type}
    </span>
  );
};

export default InquiryTypeBadge;
