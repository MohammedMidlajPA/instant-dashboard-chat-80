
import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

// Define common props for all chart types
interface BaseChartProps {
  data: any[];
  height?: number | string;
  className?: string;
}

// LineChart component
interface LineChartProps extends BaseChartProps {
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  categories,
  index,
  colors = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa"],
  valueFormatter = (value) => value.toString(),
  height = 300,
  className
}) => {
  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={index} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" fontSize={12} tickFormatter={valueFormatter} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value: number) => [valueFormatter(value), ""]}
            labelFormatter={(value) => `${value}`}
            contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}
          />
          <Legend
            formatter={(value) => <span style={{ color: "#374151", fontSize: "12px" }}>{value}</span>}
          />
          {categories.map((category, i) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={{ r: 3 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

// BarChart component
interface BarChartProps extends BaseChartProps {
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  categories,
  index,
  colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"],
  valueFormatter = (value) => value.toString(),
  height = 300,
  className
}) => {
  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey={index} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" fontSize={12} tickFormatter={valueFormatter} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value: number) => [valueFormatter(value), ""]}
            labelFormatter={(value) => `${value}`}
            contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}
          />
          <Legend
            formatter={(value) => <span style={{ color: "#374151", fontSize: "12px" }}>{value}</span>}
          />
          {categories.map((category, i) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colors[i % colors.length]}
              radius={[4, 4, 0, 0]}
              name={category}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// PieChart component
interface PieChartProps extends BaseChartProps {
  category: string;
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  category,
  index,
  colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe", "#eff6ff"],
  valueFormatter = (value) => value.toString(),
  height = 300,
  className
}) => {
  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            dataKey={category}
            nameKey={index}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [valueFormatter(value), ""]}
            contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}
          />
          <Legend
            formatter={(value) => <span style={{ color: "#374151", fontSize: "12px" }}>{value}</span>}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Custom Progress component that supports different indicator colors
interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  className = "h-2 bg-gray-100", 
  indicatorClassName = "bg-primary"
}) => {
  return (
    <div className={`relative overflow-hidden rounded-full ${className}`}>
      <div 
        className={`h-full ${indicatorClassName}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};
