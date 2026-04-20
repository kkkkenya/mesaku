import { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white rounded-xl border border-dashed border-slate-200">
      <div className="h-16 w-16 rounded-full bg-teal-soft flex items-center justify-center text-teal mb-4">
        {icon ?? <Inbox className="h-7 w-7" />}
      </div>
      <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
