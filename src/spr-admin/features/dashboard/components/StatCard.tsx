import { ReactNode } from "react";
import { Card, CardContent } from "@/spr-admin/components/ui/Card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: "default" | "blue" | "purple" | "green" | "yellow" | "red" | "orange" | "pink";
}

export function StatCard({ title, value, subtitle, icon, variant = "default" }: StatCardProps) {
  // Colors matching the top border of your screenshot
  const borderColors = {
    default: "border-t-gray-200",
    blue: "border-t-blue-500",
    purple: "border-t-purple-500",
    green: "border-t-green-500",
    yellow: "border-t-yellow-500",
    red: "border-t-red-500",
    orange: "border-t-orange-500",
    pink: "border-t-pink-500",
  };

  const textColors = {
    default: "text-gray-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    orange: "text-orange-500",
    pink: "text-pink-500",
  };

  return (
    <Card className={`border-t-4 ${borderColors[variant]} shadow-sm rounded-xl bg-white`}>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">{title}</p>
          {icon && <div className={textColors[variant]}>{icon}</div>}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{value}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}