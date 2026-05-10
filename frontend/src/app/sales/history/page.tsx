"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Sale } from "@/lib/types";
import { AppShell } from "@/components/AppShell";
import { Card, Skeleton } from "@/components/ui";
import { Clock, User, Package, ChevronDown, ChevronUp } from "lucide-react";

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    api.get<Sale[]>("sales/")
      .then(res => setSales(res.data))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id: number) => {
    setEditingId(expandedId === id ? null : id);
  };

  return (
    <AppShell title="Sales History">
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
        ) : sales.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No sales recorded yet.</div>
        ) : (
          sales.map(sale => (
            <Card key={sale.id} className="overflow-hidden border-slate-100 rounded-2xl">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleExpand(sale.id)}
              >
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        #{sale.id}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900">৳{parseFloat(sale.total_amount).toLocaleString()}</div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1"><Clock size={12}/> {new Date(sale.created_at).toLocaleString()}</span>
                            <span className="flex items-center gap-1"><User size={12}/> {sale.customer_name || "Cash Sale"}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${parseFloat(sale.due_amount) > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {parseFloat(sale.due_amount) > 0 ? 'Due' : 'Paid'}
                    </span>
                    {expandedId === sale.id ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
                </div>
              </div>
              
              {expandedId === sale.id && (
                <div className="bg-slate-50/50 border-t border-slate-100 p-4 space-y-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Items Sold</div>
                    {sale.items?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Package size={14} className="text-slate-400"/>
                                <span className="font-medium text-slate-700">{item.product_name}</span>
                                <span className="text-slate-400">x{item.quantity}</span>
                            </div>
                            <span className="font-bold text-slate-900">৳{(parseFloat(item.unit_price) * item.quantity).toLocaleString()}</span>
                        </div>
                    ))}
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                        <span className="text-slate-500">Paid: ৳{parseFloat(sale.paid_amount).toLocaleString()}</span>
                        {parseFloat(sale.due_amount) > 0 && <span className="text-rose-600 font-bold">Due: ৳{parseFloat(sale.due_amount).toLocaleString()}</span>}
                    </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
