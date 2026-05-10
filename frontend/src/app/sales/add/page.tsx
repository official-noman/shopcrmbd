"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2, ShoppingCart, User, Calendar, DollarSign, Package } from "lucide-react";

import { api } from "@/lib/api";
import { Customer, Product } from "@/lib/types";
import { AppShell } from "@/components/AppShell";
import { Button, Card, Input, Label } from "@/components/ui";

type SaleForm = {
  customer: string;
  sale_date: string;
  paid_amount: string;
  items: {
    product: string;
    quantity: number;
    unit_price: number;
  }[];
};

export default function NewSalePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { register, control, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<SaleForm>({
    defaultValues: {
      sale_date: new Date().toISOString().split("T")[0],
      items: [{ product: "", quantity: 1, unit_price: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  useEffect(() => {
    Promise.all([
      api.get<Customer[]>("customers/"),
      api.get<Product[]>("products/")
    ]).then(([cRes, pRes]) => {
      setCustomers(cRes.data);
      setProducts(pRes.data);
      setLoading(false);
    });
  }, []);

  const watchedItems = watch("items");
  const totalAmount = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const onProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id.toString() === productId);
    if (product) {
      setValue(`items.${index}.unit_price`, parseFloat(product.sale_price));
    }
  };

  const onSubmit = async (values: SaleForm) => {
    if (values.items.some(item => !item.product)) {
      toast.error("Please select a product for all items");
      return;
    }

    try {
      await api.post("sales/", {
        ...values,
        total_amount: totalAmount,
        customer: values.customer || null,
        paid_amount: values.paid_amount === "" ? null : values.paid_amount
      });
      toast.success("Sale completed successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to complete sale");
    }
  };

  if (loading) return <AppShell title="New Sale"><div className="py-10 text-center text-slate-400">Loading...</div></AppShell>;

  return (
    <AppShell title="Create New Sale">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
        <Card className="p-6 space-y-4 rounded-2xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="flex items-center gap-2"><User size={14}/> Customer (Optional)</Label>
              <select 
                {...register("customer")} 
                className="w-full h-11 px-3 border border-slate-200 rounded-xl bg-slate-50/30 outline-none focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">Cash Sale (Walking Customer)</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-2"><Calendar size={14}/> Date</Label>
              <Input type="date" {...register("sale_date", { required: true })} className="rounded-xl h-11" />
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Package size={16} className="text-indigo-600"/> Items
            </h3>
            <Button type="button" variant="secondary" size="sm" className="rounded-xl h-8" onClick={() => append({ product: "", quantity: 1, unit_price: 0 })}>
                <Plus size={14} className="mr-1"/> Add Item
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id} className="p-4 rounded-2xl border-slate-100 group">
              <div className="grid gap-3 sm:grid-cols-[1fr_80px_100px_40px]">
                <div className="space-y-1">
                  <select 
                    {...register(`items.${index}.product` as const, { required: true })}
                    onChange={(e) => onProductChange(index, e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>
                        {p.name} ({p.stock_quantity} left) - ৳{p.sale_price}
                      </option>
                    ))}
                  </select>
                </div>
                <Input 
                    type="number" 
                    placeholder="Qty" 
                    {...register(`items.${index}.quantity` as const, { required: true, min: 1 })} 
                    className="h-10 rounded-lg"
                />
                <div className="h-10 flex items-center justify-center font-bold text-slate-900 bg-slate-50 rounded-lg">
                    ৳{watchedItems[index]?.quantity * watchedItems[index]?.unit_price || 0}
                </div>
                <button 
                  type="button" 
                  onClick={() => remove(index)} 
                  className="flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 rounded-2xl bg-indigo-50 border-indigo-100 shadow-xl shadow-indigo-100/50">
            <div className="flex items-center justify-between border-b border-indigo-200/60 pb-4 mb-4">
                <span className="text-slate-600 text-sm font-medium">Grand Total</span>
                <span className="text-3xl font-bold text-indigo-900">৳{totalAmount.toLocaleString()}</span>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <Label className="text-slate-600">Paid Amount (Leave blank for full payment)</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            type="number" 
                            {...register("paid_amount")} 
                            placeholder={totalAmount.toString()}
                            className="bg-white border-slate-200 text-slate-900 pl-9 h-11 rounded-xl focus:ring-indigo-500/50" 
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20" loading={isSubmitting}>
                    <ShoppingCart size={20} className="mr-2" /> Complete Sale
                </Button>
            </div>
        </Card>

      </form>
    </AppShell>
  );
}
