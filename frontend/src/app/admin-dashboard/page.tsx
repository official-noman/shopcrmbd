"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SuperAdminStats } from "@/lib/types";
import { Card } from "@/components/ui";
import { Store, Users, UserRound, ArrowUpRight, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("superadmin/stats/")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-slate-100" />
          ))}
        </div>
        <Card className="h-64 animate-pulse bg-slate-100" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Shops",
      value: stats?.total_shops ?? 0,
      icon: Store,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Users",
      value: stats?.total_users ?? 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Total Customers",
      value: stats?.total_customers ?? 0,
      icon: UserRound,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-slate-500">Manage your SaaS platform metrics and shops.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.title} className="group relative overflow-hidden transition-all hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h3 className="mt-1 text-3xl font-bold text-slate-900">
                  {card.value.toLocaleString()}
                </h3>
              </div>
              <div className={`rounded-xl p-3 ${card.bg} ${card.color} transition-transform group-hover:scale-110`}>
                <card.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
              <ArrowUpRight size={14} className="mr-1" />
              <span>Platform wide data</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-indigo-600" />
              Shops by Category
            </h2>
          </div>
          <div className="space-y-4">
            {stats?.shops_by_type.map((item) => (
              <div key={item.type} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-700">{item.type || "Uncategorized"}</span>
                  <span className="text-slate-900">{item.count}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${(item.count / (stats.total_shops || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {(!stats?.shops_by_type || stats.shops_by_type.length === 0) && (
              <p className="text-center text-slate-400 py-8 italic">No shop data available yet.</p>
            )}
          </div>
        </Card>

        <Card className="flex h-full flex-col justify-center border-dashed bg-transparent p-6 text-center">
          <p className="text-sm text-slate-400 mb-2 font-medium">Revenue Insights</p>
          <p className="text-xs text-slate-400 italic">Detailed analytics coming soon in the next update.</p>
        </Card>
      </div>
    </div>
  );
}
