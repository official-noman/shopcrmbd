"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, PlusCircle, Users, Package, History } from "lucide-react";
import toast from "react-hot-toast";

import { clearTokens } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/sales/add", label: "New Sale", icon: PlusCircle },
  { href: "/sales/history", label: "Sales History", icon: History }
];

function NavLink({
  href,
  label,
  icon: Icon
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] sm:flex-row sm:gap-2 sm:px-3 sm:text-sm transition-colors",
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-700 hover:bg-slate-100"
      ].join(" ")}
    >
      <Icon className="h-4 w-4 sm:h-4 sm:w-4" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function AppShell({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <div className="text-sm text-slate-500">ShopCRM BD</div>
            <h1 className="truncate text-base font-semibold">{title}</h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
            onClick={() => {
              clearTokens();
              toast.success("Logged out");
              router.push("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-[220px_1fr]">
        <aside className="hidden sm:block">
          <nav className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {navItems.map((n) => (
              <NavLink key={n.href} href={n.href} label={n.label} icon={n.icon} />
            ))}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-5xl grid-cols-5 gap-1 px-1 py-2">
          {navItems.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} icon={n.icon} />
          ))}
        </div>
      </nav>
      <div className="h-16 sm:hidden" />
    </div>
  );
}
