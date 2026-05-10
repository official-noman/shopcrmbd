import { RequireAuth } from "@/components/RequireAuth";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50">
        <AdminSidebar />
        <main className="pl-64">
          <div className="mx-auto max-w-7xl p-8">
            {children}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
