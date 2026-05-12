"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { 
  Plus, 
  Trash2, 
  ShoppingCart, 
  User, 
  Calendar, 
  Package, 
  Printer, 
  Check, 
  X,
  CreditCard,
  ReceiptText,
  ChevronRight,
  Search,
  Store
} from "lucide-react";

import { api } from "@/lib/api";
import { Customer, Product } from "@/lib/types";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Button, Card, Input, Label, TakaIcon } from "@/components/ui";

type SaleForm = {
  customer: string;
  sale_date: string;
  paid_amount: string;
  should_print: boolean;
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
      should_print: true,
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
  const shouldPrint = watch("should_print");
  const totalAmount = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const onProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id.toString() === productId);
    if (product) {
      setValue(`items.${index}.unit_price`, parseFloat(product.sale_price));
    }
  };

  const handlePrint = (saleData: any) => {
    const customer = customers.find(c => c.id.toString() === saleData.customer);
    const date = new Date(saleData.sale_date).toLocaleDateString();
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const itemsHtml = saleData.items.map((item: any) => {
      const product = products.find(p => p.id.toString() === item.product);
      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px dashed #eee; font-size: 13px;">
            <div style="font-weight: 600;">${product?.name || "Product"}</div>
            <div style="font-size: 11px; color: #666;">${item.quantity} x ৳${parseFloat(item.unit_price).toLocaleString()}</div>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px dashed #eee; text-align: right; font-weight: 700; font-size: 13px;">৳${(item.quantity * item.unit_price).toLocaleString()}</td>
        </tr>`;
    }).join("");

    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { font-family: sans-serif; padding: 15px; width: 70mm; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .total-section { margin-top: 15px; border-top: 2px solid #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header"><strong>ShopCRM BD</strong><br/>Official Receipt</div>
          <p style="font-size: 12px;">Date: ${date}<br/>Customer: ${customer?.name || "Cash Sale"}</p>
          <table>${itemsHtml}</table>
          <div class="total-section">
            <div style="display:flex;justify-content:space-between"><strong>TOTAL:</strong> <strong>৳${totalAmount.toLocaleString()}</strong></div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>`);
    printWindow.document.close();
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
      toast.success("Sale recorded!");
      if (values.should_print) handlePrint(values);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Failed to complete sale");
    }
  };

  if (loading) return <AppShell title="POS"><div className="py-20 text-center">Loading POS...</div></AppShell>;

  return (
    <RequireAuth>
      <AppShell title="Point of Sale">
        <div className="mx-auto max-w-5xl pb-24 px-4">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart size={24} /> Cart</h2>
                <Button type="button" variant="secondary" onClick={() => append({ product: "", quantity: 1, unit_price: 0 })} className="rounded-xl font-bold">
                  <Plus size={18} className="mr-1" /> Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="grid gap-4 sm:grid-cols-[1fr_80px_120px_auto]">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Product</Label>
                        <select {...register(`items.${index}.product` as const, { required: true })} onChange={(e) => onProductChange(index, e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-bold">
                          <option value="">Select Item...</option>
                          {products.map(p => <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>{p.name} ({p.stock_quantity} left)</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 text-center block">Qty</Label>
                        <Input type="number" {...register(`items.${index}.quantity` as const, { required: true, min: 1 })} className="h-10 text-center font-bold rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 text-right block">Price (৳)</Label>
                        <Input type="number" step="0.01" {...register(`items.${index}.unit_price` as const, { required: true })} className="h-10 text-right font-bold rounded-xl text-indigo-600" />
                      </div>
                      <div className="flex items-end pb-1">
                        <button type="button" onClick={() => remove(index)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={20}/></button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="sticky top-24 space-y-6">
                <Card className="p-6 rounded-2xl border-slate-200 shadow-lg">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Customer</Label>
                      <select {...register("customer")} className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50">
                        <option value="">Cash Sale</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Date</Label>
                      <Input type="date" {...register("sale_date", { required: true })} className="h-11 rounded-xl bg-slate-50 font-bold" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl border-none">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-slate-400 text-xs font-bold uppercase">Total</span>
                      <span className="text-2xl font-black">৳{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400 text-[10px] font-bold uppercase">Paid Amount (BDT)</Label>
                      <Input type="number" {...register("paid_amount")} placeholder={totalAmount.toString()} className="h-12 bg-white/5 border-white/10 text-white font-bold rounded-xl" />
                    </div>
                    <label className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${shouldPrint ? "bg-indigo-600 border-indigo-400" : "bg-white/5 border-white/10"}`}>
                      <span className="text-sm font-bold flex items-center gap-2"><Printer size={18}/> Print?</span>
                      <input type="checkbox" {...register("should_print")} className="h-5 w-5 rounded border-white/20 bg-white/10" />
                    </label>
                    <Button type="submit" className="w-full h-14 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-lg shadow-lg" loading={isSubmitting}>
                      CHECKOUT
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
