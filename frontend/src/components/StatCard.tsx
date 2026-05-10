import { Card } from "@/components/ui";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "indigo"
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "indigo" | "green" | "red";
}) {
  const toneStyles =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "red"
        ? "bg-rose-50 text-rose-700"
        : "bg-indigo-50 text-indigo-700";

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-slate-600">{label}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
        </div>
        <div className={`rounded-2xl p-3 ${toneStyles}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

