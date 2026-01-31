import { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
  trend?: string;
}

export const StatsCard = ({ icon, value, label, trend }: StatsCardProps) => {
  return (
    <div className="stats-card card-hover">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {trend && (
        <div className="text-xs text-success mt-2">{trend}</div>
      )}
    </div>
  );
};
