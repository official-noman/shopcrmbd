"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SuperAdminShop } from "@/lib/types";
import { Card, Button, Skeleton } from "@/components/ui";
import { Search, Filter, MoreHorizontal, User, Phone, MapPin, TrendingUp, ShoppingBag } from "lucide-react";

export default function AllShops() {
  const [shops, setShops] = useState<SuperAdminShop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("superadmin/shops/")
      .then((res) => setShops(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Registered Shops</h1>
          <p className="text-sm text-slate-500">A total of {shops.length} shops are currently registered.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search shops..."
              className="h-10 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all"
            />
          </div>
          <Button variant="secondary" className="h-10 rounded-xl">
            <Filter size={18} className="mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-none p-0 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Shop Info</th>
                <th className="px-6 py-4">Owner Info</th>
                <th className="px-6 py-4 text-center">Metrics</th>
                <th className="px-6 py-4 text-center">Business Activity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <Skeleton className="h-12 w-full" />
                    </td>
                  </tr>
                ))
              ) : (
                shops.map((shop) => (
                  <tr key={shop.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{shop.name}</span>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {shop.address || "No address"}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-600">
                            {shop.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <User size={14} className="text-slate-400" />
                          {shop.owner_name}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone size={14} className="text-slate-400" />
                          {shop.owner_phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-4">
                        <div className="text-center">
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Users</div>
                          <div className="font-semibold text-slate-700">{shop.user_count}</div>
                        </div>
                        <div className="text-center border-l border-slate-100 pl-4">
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Customers</div>
                          <div className="font-semibold text-slate-700">{shop.customer_count}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                            <ShoppingBag size={14} className="text-slate-400" />
                            <span>{shop.total_sales_count} Sales</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <TrendingUp size={14} />
                            <span>৳{parseFloat(shop.total_revenue).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-400 w-2/3" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
