"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DollarSign, TriangleAlert, Users } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import { StatCard } from "@/components/StatCard";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get<DashboardStats>("dashboard/stats/");
        if (mounted) setStats(res.data);
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || "Failed to load dashboard stats");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <RequireAuth>
      <AppShell title="Dashboard">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Customers"
            value={stats ? stats.total_customers : <Skeleton className="mt-2 h-7 w-16" />}
            icon={Users}
            tone="indigo"
          />
          <StatCard
            label="Total Due"
            value={stats ? stats.total_due : <Skeleton className="mt-2 h-7 w-24" />}
            icon={TriangleAlert}
            tone="red"
          />
          <StatCard
            label="Today’s Sales"
            value={stats ? stats.sales_today : <Skeleton className="mt-2 h-7 w-24" />}
            icon={DollarSign}
            tone="green"
          />
        </div>
      </AppShell>
    </RequireAuth>
  );
}

