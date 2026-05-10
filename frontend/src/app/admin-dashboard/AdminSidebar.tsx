"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, CreditCard, Settings, LogOut, ShieldCheck } from "lucide-react";
import { clearTokens } from "@/lib/auth";

const MENU_ITEMS = [
  { name: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
  { name: "All Shops", href: "/admin-dashboard/shops", icon: Store },
  { name: "Subscriptions", href: "#", icon: CreditCard },
  { name: "Settings", href: "#", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    clearTokens();
    window.location.href = "/login";
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white shadow-sm transition-transform">
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
            <ShieldCheck size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            SuperAdmin
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  size={20}
                  className={`mr-3 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
