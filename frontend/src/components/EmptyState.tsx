import { Card } from "@/components/ui";
import { Inbox, LucideIcon } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <Card className="py-10">
      <div className="flex flex-col items-center text-center">
        <div className="rounded-2xl bg-slate-50 p-3 text-slate-600">
          <Icon className="h-6 w-6" />
        </div>
        <div className="mt-4 text-base font-semibold">{title}</div>
        <div className="mt-1 max-w-sm text-sm text-slate-600">{description}</div>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </Card>
  );
}
