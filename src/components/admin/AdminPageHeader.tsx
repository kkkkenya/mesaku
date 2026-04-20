import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  action?: ReactNode;
}

export default function AdminPageHeader({ title, subtitle, breadcrumb, action }: Props) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <nav className="flex items-center gap-1 text-xs text-slate-500 mb-2" aria-label="Breadcrumb">
            <span>Admin</span>
            {breadcrumb && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-slate-700">{breadcrumb}</span>
              </>
            )}
          </nav>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
