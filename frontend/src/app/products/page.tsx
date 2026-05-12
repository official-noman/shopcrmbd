"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Package, Plus, Search, Trash2, Pencil, Loader2 } from "lucide-react";

import { api } from "@/lib/api";
import { Product } from "@/lib/types";
import { AppShell } from "@/components/AppShell";
import { Button, Card, Input, Label } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";

type ProductForm = {
  name: string;
  description: string;
  buy_price: number;
  sale_price: number;
  stock_quantity: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<ProductForm>();

  const fetchProducts = async () => {
    try {
      const res = await api.get<Product[]>("products/");
      setProducts(res.data);
    } catch (err) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onSubmit = async (values: ProductForm) => {
    try {
      if (editingId) {
        await api.patch(`products/${editingId}/`, values);
        toast.success("Product updated");
      } else {
        await api.post("products/", values);
        toast.success("Product added");
      }
      reset();
      setShowAdd(false);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`products/${id}/`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setValue("name", p.name);
    setValue("description", p.description);
    setValue("buy_price", parseFloat(p.buy_price));
    setValue("sale_price", parseFloat(p.sale_price));
    setValue("stock_quantity", p.stock_quantity);
    setShowAdd(true);
  };

  return (
    <RequireAuth>
      <AppShell title="Products & Inventory">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search products..." className="pl-9 h-10 rounded-xl" />
            </div>
            <Button 
              className="rounded-xl h-10" 
              onClick={() => {
                  reset();
                  setEditingId(null);
                  setShowAdd(!showAdd);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {showAdd ? "Close" : "Add Product"}
            </Button>
          </div>

          {showAdd && (
            <Card className="p-4 rounded-2xl border-indigo-100 bg-indigo-50/30">
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label>Product Name</Label>
                  <Input {...register("name", { required: true })} placeholder="e.g. Coca Cola 500ml" className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label>Buy Price (৳)</Label>
                  <Input type="number" step="0.01" {...register("buy_price", { required: true })} placeholder="0.00" className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label>Sale Price (৳)</Label>
                  <Input type="number" step="0.01" {...register("sale_price", { required: true })} placeholder="0.00" className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label>Initial Stock</Label>
                  <Input type="number" {...register("stock_quantity", { required: true })} placeholder="0" className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label>Description (Optional)</Label>
                  <Input {...register("description")} placeholder="Short details..." className="rounded-xl" />
                </div>
                <div className="sm:col-span-2 pt-2">
                  <Button type="submit" className="w-full rounded-xl" loading={isSubmitting}>
                    {editingId ? "Update Product" : "Save Product"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
          ) : products.length === 0 ? (
            <EmptyState 
              icon={Package} 
              title="No products yet" 
              description="Add your first product to start tracking inventory and sales." 
            />
          ) : (
            <div className="grid gap-3">
              {products.map(p => (
                <Card key={p.id} className="p-4 flex items-center justify-between gap-4 group hover:border-indigo-200 transition-colors">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                          <span className="font-medium text-slate-700">Stock:</span> {p.stock_quantity}
                      </span>
                      <span className="flex items-center gap-1">
                          <span className="font-medium text-slate-700">Buy:</span> ৳{p.buy_price}
                      </span>
                      <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                          <span className="font-medium text-slate-700">Sale:</span> ৳{p.sale_price}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => startEdit(p)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors" onClick={() => deleteProduct(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
