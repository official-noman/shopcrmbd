"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Product, SuperAdminShop } from "@/lib/types";
import { Card, Button, Input, Skeleton, Label, TakaIcon } from "@/components/ui";
import { 
  Package, 
  Plus, 
  Search, 
  ChevronLeft, 
  SquarePen, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Layers,
  History
} from "lucide-react";
import toast from "react-hot-toast";

export default function ShopProductManagement({ params }: { params: { id: string } }) {
  const { id: shopId } = params;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<SuperAdminShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchQuery] = useState("");
  
  // Modal/Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    buy_price: "",
    sale_price: "",
    stock_quantity: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [shopId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, shopRes] = await Promise.all([
        api.get(`superadmin/shops/${shopId}/products/`),
        api.get(`superadmin/shops/${shopId}/`)
      ]);
      setProducts(prodRes.data);
      setShop(shopRes.data);
    } catch (err) {
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        buy_price: product.buy_price.toString(),
        sale_price: product.sale_price.toString(),
        stock_quantity: product.stock_quantity.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        buy_price: "",
        sale_price: "",
        stock_quantity: "0",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingProduct) {
        await api.put(`superadmin/shops/${shopId}/products/${editingProduct.id}/`, formData);
        toast.success("Product updated successfully");
      } else {
        await api.post(`superadmin/shops/${shopId}/products/`, formData);
        toast.success("Product added to shop");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    
    try {
      await api.delete(`superadmin/shops/${shopId}/products/${id}/`);
      toast.success("Product removed");
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin-dashboard/shops" 
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">Inventory Management</h1>
                {shop && (
                    <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600 uppercase tracking-tight">
                        {shop.name}
                    </span>
                )}
            </div>
            <p className="text-sm text-slate-500">Add or edit products on behalf of the shop owner.</p>
          </div>
        </div>
        <Button onClick={() => openModal()} className="h-11 rounded-xl shadow-lg shadow-indigo-200">
          <Plus size={20} className="mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 border-none bg-white p-5 shadow-sm">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <Package size={24} />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Total Items</p>
                <p className="text-xl font-black text-slate-900">{products.length}</p>
            </div>
        </Card>
        <Card className="flex items-center gap-4 border-none bg-white p-5 shadow-sm">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <Layers size={24} />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Low Stock</p>
                <p className="text-xl font-black text-slate-900">
                    {products.filter(p => p.stock_quantity < 5).length}
                </p>
            </div>
        </Card>
        <Card className="flex items-center gap-4 border-none bg-white p-5 shadow-sm">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                <History size={24} />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Recent Activity</p>
                <p className="text-sm font-bold text-slate-700 italic">Tracking live...</p>
            </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search within this shop's inventory..."
            value={searchTerm}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
          />
        </div>
      </div>

      {/* Products Table */}
      <Card className="overflow-hidden border-none p-0 shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[10px] text-slate-500 uppercase tracking-widest font-black">
              <tr>
                <th className="px-6 py-5">Product Details</th>
                <th className="px-6 py-5 text-center">In Stock</th>
                <th className="px-6 py-5 text-right">Pricing (Unit)</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-6 py-6"><Skeleton className="h-10 w-full rounded-lg" /></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <Package size={48} className="text-slate-200" />
                        <p className="font-bold text-slate-400 italic">No products found for this shop.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                          <Package size={20} />
                        </div>
                        <div>
                          <div className="font-black text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-400 line-clamp-1 max-w-xs">{p.description || "No description provided."}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-black ${
                        p.stock_quantity < 5 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {p.stock_quantity} Left
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center font-black text-indigo-600">
                          <TakaIcon className="h-3 w-3 mr-0.5" />
                          {parseFloat(p.sale_price).toLocaleString()}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 italic">Cost: ৳{parseFloat(p.buy_price).toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(p)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-500 shadow-sm border border-slate-100 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all"
                        >
                          <SquarePen size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm border border-slate-100 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Premium Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="relative w-full max-w-lg overflow-hidden border-none bg-white p-0 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="flex items-center gap-2 text-lg font-black text-slate-900">
                {editingProduct ? <SquarePen size={18} className="text-indigo-600"/> : <Plus size={20} className="text-indigo-600"/>}
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-600 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase text-slate-500 tracking-wider">Product Name</Label>
                <Input 
                  required
                  placeholder="Enter full product name..."
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase text-slate-500 tracking-wider">Description (Optional)</Label>
                <textarea 
                  rows={2}
                  placeholder="Provide any extra details about the product..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-xs font-black uppercase text-slate-500 tracking-wider">Buy Price (৳)</Label>
                    <Input 
                        required
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.buy_price}
                        onChange={e => setFormData({...formData, buy_price: e.target.value})}
                        className="h-11 rounded-xl"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-black uppercase text-slate-500 tracking-wider">Sale Price (৳)</Label>
                    <Input 
                        required
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.sale_price}
                        onChange={e => setFormData({...formData, sale_price: e.target.value})}
                        className="h-11 rounded-xl border-indigo-200 focus:border-indigo-500"
                    />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase text-slate-500 tracking-wider">Initial Stock</Label>
                <Input 
                  required
                  type="number"
                  placeholder="Enter quantity"
                  value={formData.stock_quantity}
                  onChange={e => setFormData({...formData, stock_quantity: e.target.value})}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button 
                    type="button" 
                    variant="secondary" 
                    className="h-11 flex-1 rounded-xl font-bold"
                    onClick={() => setIsModalOpen(false)}
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    className="h-11 flex-1 rounded-xl font-bold shadow-lg shadow-indigo-100"
                    loading={submitting}
                >
                    {editingProduct ? "Save Changes" : "Confirm & Add"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
