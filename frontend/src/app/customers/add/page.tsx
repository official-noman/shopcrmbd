"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { api } from "@/lib/api";

type FormValues = {
  name: string;
  phone: string;
  address: string;
  credit_limit: string;
};

export default function AddCustomerPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<FormValues>({
    defaultValues: { name: "", phone: "", address: "", credit_limit: "0" }
  });

  return (
    <RequireAuth>
      <AppShell title="Add Customer">
        <Card className="max-w-xl">
          <form
            className="space-y-4"
            onSubmit={handleSubmit(async (values) => {
              try {
                await api.post("customers/", {
                  ...values,
                  credit_limit: Number(values.credit_limit || 0)
                });
                toast.success("Customer created");
                router.push("/customers");
              } catch (err: any) {
                const msg =
                  err?.response?.data?.detail ||
                  "Failed to create customer. Please try again.";
                toast.error(msg);
              }
            })}
          >
            <div className="space-y-1">
              <Label>Name</Label>
              <Input {...register("name", { required: true })} />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input placeholder="01XXXXXXXXX" {...register("phone")} />
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Textarea rows={3} {...register("address")} />
            </div>
            <div className="space-y-1">
              <Label>Credit limit</Label>
              <Input inputMode="decimal" {...register("credit_limit")} />
            </div>

            <div className="flex gap-3">
              <Button type="submit" loading={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </AppShell>
    </RequireAuth>
  );
}

