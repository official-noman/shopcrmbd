"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Product } from "@/lib/types";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Card, Input, Skeleton } from "@/components/ui";
import { Search, TrendingUp, Calendar, Package, Clock, User } from "lucide-react";

interface DateSummary {
  total_sales: string;
  total_benefit: string;
}

interface SaleDetail {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  unit_buy_price: string;
  customer_name: string | null;
  time: string;
}

interface ProductSaleRecord {
  id: number;
  date: string;
  time: string;
  quantity: number;
  unit_price: string;
  unit_buy_price: string;
  customer_name: string | null;
}

export default function BenefitPage() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateDetails, setDateDetails] = useState<SaleDetail[]>([]);
  const [dateSummary, setDateSummary] = useState<DateSummary | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSales, setProductSales] = useState<ProductSaleRecord[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(false);

  useEffect(() => {
    api.get<Product[]>("products/")
      .then(res => setProducts(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get(`reports/benefit/?date=${selectedDate}`)
      .then(res => {
        setDateDetails(res.data.details);
        setDateSummary(res.data.summary);
      })
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setLoadingProduct(true);
    api.get(`reports/benefit/?product_id=${product.id}`)
      .then(res => setProductSales(res.data.sales))
      .finally(() => setLoadingProduct(false));
  };

  const filteredProducts = searchQuery.length > 0 && !selectedProduct 
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  return (
    <RequireAuth>
      <AppShell title="Benefit & Detailed Analytics">
        <div className="space-y-6 pb-20">
          
          {/* Top Section: Date Picker & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1 flex flex-col justify-center gap-2 border-indigo-100 bg-indigo-50/20">
                <label className="text-xs font-bold text-indigo-600 uppercase">Select Date</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </Card>

            <Card className="flex flex-col justify-center border-emerald-100 bg-emerald-50/20">
                <div className="text-xs font-bold text-emerald-600 uppercase">Total Sales ({selectedDate})</div>
                <div className="text-2xl font-black text-slate-900">
                    ৳{dateSummary ? parseFloat(dateSummary.total_sales).toLocaleString() : "0"}
                </div>
            </Card>

            <Card className="flex flex-col justify-center border-blue-100 bg-blue-50/20">
                <div className="text-xs font-bold text-blue-600 uppercase">Total Benefit ({selectedDate})</div>
                <div className="text-2xl font-black text-slate-900">
                    ৳{dateSummary ? parseFloat(dateSummary.total_benefit).toLocaleString() : "0"}
                </div>
            </Card>
          </div>

          {/* Daily Detailed Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Clock size={18} className="text-indigo-600"/>
                    <span>Product-wise Sales for {selectedDate}</span>
                </div>
            </div>
            <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3 text-right">Revenue</th>
                        <th className="px-4 py-3 text-right">Benefit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {loading ? (
                        [1,2,3].map(i => (
                            <tr key={i}><td colSpan={6} className="px-4 py-4"><Skeleton className="h-4 w-full" /></td></tr>
                        ))
                        ) : dateDetails.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-20 text-center text-slate-400 font-medium">No sales recorded for this date.</td></tr>
                        ) : (
                        dateDetails.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{item.product_name}</td>
                            <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                            <td className="px-4 py-3 text-slate-600 flex items-center gap-1">
                                <User size={12} className="text-slate-400"/>
                                {item.customer_name || "Cash Sale"}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">৳{parseFloat(item.unit_price) * item.quantity}</td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600">৳{(parseFloat(item.unit_price) - parseFloat(item.unit_buy_price)) * item.quantity}</td>
                            </tr>
                        ))
                        )}
                    </tbody>
                    {dateSummary && dateDetails.length > 0 && (
                        <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                            <tr>
                                <td colSpan={4} className="px-4 py-3 text-right text-slate-600">TOTAL:</td>
                                <td className="px-4 py-3 text-right text-slate-900">৳{parseFloat(dateSummary.total_sales).toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-emerald-600">৳{parseFloat(dateSummary.total_benefit).toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    )}
                    </table>
                </div>
            </Card>
          </div>

          {/* Product Search Section */}
          <Card className="border-indigo-100 bg-indigo-50/30">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                <Search size={20} />
                <span>Product Search (Lifetime Sales)</span>
              </div>
              <div className="relative">
                <Input 
                  placeholder="Search product to see all historical sales..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedProduct) setSelectedProduct(null);
                  }}
                  className="bg-white border-indigo-200 focus:ring-indigo-500 h-12 text-base"
                />
                {filteredProducts.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                    {filteredProducts.map(p => (
                      <div 
                        key={p.id} 
                        className="px-4 py-3 hover:bg-indigo-50 cursor-pointer text-sm border-b last:border-0 border-slate-100 transition-colors"
                        onClick={() => handleProductSelect(p)}
                      >
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500">Current Stock: {p.stock_quantity} | Price: ৳{parseFloat(p.sale_price).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedProduct && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Package size={16} className="text-indigo-600"/>
                        All Sales Records for "{selectedProduct.name}"
                    </div>
                  </div>
                  {loadingProduct ? (
                     <Skeleton className="h-40 w-full rounded-xl" />
                  ) : productSales.length === 0 ? (
                    <div className="text-sm text-slate-500 py-10 text-center bg-white rounded-xl border border-slate-100">
                      This product hasn't been sold yet.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                            <tr>
                                <th className="px-4 py-3">Date & Time</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3 text-center">Qty</th>
                                <th className="px-4 py-3 text-right">Unit Price</th>
                                <th className="px-4 py-3 text-right">Total Sale</th>
                                <th className="px-4 py-3 text-right">Benefit</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {productSales.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-900">{s.date}</div>
                                    <div className="text-[10px] text-slate-400">{new Date(s.time).toLocaleTimeString()}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-600">{s.customer_name || "Cash Sale"}</td>
                                <td className="px-4 py-3 text-center font-bold text-indigo-600">{s.quantity}</td>
                                <td className="px-4 py-3 text-right font-medium">৳{parseFloat(s.unit_price).toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-bold text-slate-900">৳{(parseFloat(s.unit_price) * s.quantity).toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-bold text-emerald-600">৳{(parseFloat(s.unit_price) - parseFloat(s.unit_buy_price)) * s.quantity}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
