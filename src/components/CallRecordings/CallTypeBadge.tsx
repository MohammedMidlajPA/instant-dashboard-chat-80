
import React from "react";

interface CallTypeBadgeProps {
  type: string;
}

export const CallTypeBadge: React.FC<CallTypeBadgeProps> = ({ type }) => {
  const color = type === 'Inbound' 
    ? "bg-purple-100 text-purple-800" 
    : "bg-blue-100 text-blue-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {type}
    </span>
  );
};
