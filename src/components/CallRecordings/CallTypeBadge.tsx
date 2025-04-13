
import React from "react";

interface CallTypeBadgeProps {
  type: string;
}

export const CallTypeBadge: React.FC<CallTypeBadgeProps> = ({ type }) => {
  const styles = {
    'Inbound': "bg-purple-100 text-purple-800",
    'Outbound': "bg-blue-100 text-blue-800",
    'Transfer': "bg-amber-100 text-amber-800",
    'Follow-up': "bg-green-100 text-green-800",
    'Admissions': "bg-indigo-100 text-indigo-800",
    'Financial Aid': "bg-emerald-100 text-emerald-800",
    'Academic': "bg-cyan-100 text-cyan-800"
  };
  
  const color = styles[type as keyof typeof styles] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {type}
    </span>
  );
};
