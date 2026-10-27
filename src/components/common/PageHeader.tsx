import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">

      {actions && <div className="flex shrink-0 items-center gap-2 w-full sm:w-auto">{actions}</div>}
    </div>
  );
}
