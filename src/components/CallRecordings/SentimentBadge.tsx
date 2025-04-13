
import React from "react";

interface SentimentBadgeProps {
  type: string;
}

export const SentimentBadge: React.FC<SentimentBadgeProps> = ({ type }) => {
  const styles = {
    'Positive': "bg-green-100 text-green-800",
    'Neutral': "bg-blue-100 text-blue-800",
    'Negative': "bg-red-100 text-red-800",
    'Mixed': "bg-amber-100 text-amber-800",
    'Enthusiastic': "bg-purple-100 text-purple-800",
    'Confused': "bg-orange-100 text-orange-800",
  };
  
  const color = styles[type as keyof typeof styles] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {type}
    </span>
  );
};
