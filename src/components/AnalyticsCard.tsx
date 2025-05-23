
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  isLoading?: boolean;
}

export function AnalyticsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  isLoading = false,
}: AnalyticsCardProps) {
  return (
    <Card className={cn("dashboard-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {(description || trend) && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {trend && (
                  <span
                    className={cn(
                      "inline-flex items-center",
                      trend.isPositive ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                  </span>
                )}
                {description && <span>{description}</span>}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
