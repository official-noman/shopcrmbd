"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { User, Store, Phone, MapPin, Save } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Button, Card, Input, Label, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingShop, setSavingShop] = useState(false);

  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    role: "",
  });

  const [shopData, setShopData] = useState({
    name: "",
    address: "",
    phone: "",
    type: "",
  });

  useEffect(() => {
    Promise.all([
      api.get("profile/"),
      api.get("shop/")
    ]).then(([uRes, sRes]) => {
      setUserData(uRes.data);
      setShopData(sRes.data);
    }).catch(err => {
      toast.error("Failed to load profile information");
    }).finally(() => setLoading(false));
  }, []);

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      await api.patch("profile/", {
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
      });
      toast.success("User profile updated");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSavingUser(false);
    }
  };

  const handleShopUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingShop(true);
    try {
      await api.patch("shop/", shopData);
      toast.success("Shop information updated");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update shop info");
    } finally {
      setSavingShop(false);
    }
  };

  if (loading) {
    return (
      <RequireAuth>
        <AppShell title="Profile">
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </AppShell>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <AppShell title="Profile Settings">
        <div className="space-y-6 max-w-2xl mx-auto pb-20">
          
          {/* User Profile Section */}
          <form onSubmit={handleUserUpdate}>
            <Card className="space-y-4 border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-indigo-700">
                    <User size={20} />
                    <span>Personal Information</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>First Name</Label>
                        <Input 
                            value={userData.first_name} 
                            onChange={e => setUserData({...userData, first_name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Last Name</Label>
                        <Input 
                            value={userData.last_name} 
                            onChange={e => setUserData({...userData, last_name: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label>Phone Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input 
                            className="pl-10"
                            value={userData.phone} 
                            onChange={e => setUserData({...userData, phone: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button type="submit" loading={savingUser} className="w-full sm:w-auto">
                        <Save size={18} /> Update Profile
                    </Button>
                </div>
            </Card>
          </form>

          {/* Shop Information Section */}
          <form onSubmit={handleShopUpdate}>
            <Card className="space-y-4 border-emerald-100 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-emerald-700">
                    <Store size={20} />
                    <span>Shop Information</span>
                </div>

                <div className="space-y-1.5">
                    <Label>Shop Name</Label>
                    <Input 
                        value={shopData.name} 
                        onChange={e => setShopData({...shopData, name: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Shop Phone</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input 
                                className="pl-10"
                                value={shopData.phone} 
                                onChange={e => setShopData({...shopData, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Shop Type</Label>
                        <Input 
                            value={shopData.type} 
                            onChange={e => setShopData({...shopData, type: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label>Shop Address</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                        <textarea 
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                            value={shopData.address} 
                            onChange={e => setShopData({...shopData, address: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button 
                        type="submit" 
                        loading={savingShop} 
                        variant="primary" 
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                        disabled={userData.role !== 'owner'}
                    >
                        <Save size={18} /> Update Shop Info
                    </Button>
                    {userData.role !== 'owner' && (
                        <p className="text-[10px] text-rose-500 mt-1">Only shop owners can edit shop information.</p>
                    )}
                </div>
            </Card>
          </form>

        </div>
      </AppShell>
    </RequireAuth>
  );
}
