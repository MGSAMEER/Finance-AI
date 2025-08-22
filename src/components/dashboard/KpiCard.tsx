import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value?: string;
  delta?: string;
  loading?: boolean;
  className?: string;
}

export function KpiCard({ title, value, delta, loading, className }: KpiCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ) : (
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {delta && (
              <p className="text-xs text-muted-foreground mt-1">{delta}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
