"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { EmptyState } from "@/components/EmptyState";
import { Button, Card, Input, Label, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get<Customer[]>("customers/");
        if (mounted) setItems(res.data);
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || "Failed to load customers");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.phone || "").toLowerCase().includes(query)
    );
  }, [items, q]);

  return (
    <RequireAuth>
      <AppShell title="Customers">
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-sm">
              <Label>Search (সার্চ)</Label>
              <Input
                placeholder="Search by name or phone…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Link href="/customers/add" className="sm:ml-auto">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </Link>
          </Card>

          {loading ? (
            <div className="grid gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="flex items-start justify-between gap-4">
                  <div className="w-full">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="mt-2 h-4 w-64" />
                  </div>
                  <div className="w-20 text-right">
                    <Skeleton className="ml-auto h-4 w-10" />
                    <Skeleton className="mt-2 ml-auto h-6 w-16" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No customers yet"
              description="Add your first customer to start tracking due amounts."
              action={
                <Link href="/customers/add">
                  <Button>
                    <Plus className="h-4 w-4" />
                    Add Customer
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="grid gap-3">
              {filtered.map((c) => (
                <Card key={c.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{c.name}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {c.phone || "—"} • {c.address || "—"}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-slate-500">Due</div>
                    <div className="text-lg font-semibold">{c.total_due}</div>
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

