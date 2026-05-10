"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";

import { api } from "@/lib/api";
import { maskBDPhone } from "@/lib/inputMask";
import { setTokens } from "@/lib/auth";
import type { LoginResponse } from "@/lib/types";
import { Button, Card, Input, Label } from "@/components/ui";

type FormValues = {
  phone: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const nextPath = search.get("next") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<FormValues>({
    defaultValues: { phone: "", password: "" }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <Card className="p-6">
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="mt-1 text-sm text-slate-600">
          Use your phone number and password.
        </p>

        <form
          className="mt-5 space-y-4"
          onSubmit={handleSubmit(async (values) => {
            try {
              const res = await api.post<LoginResponse>("auth/login/", values);
              setTokens(res.data.access, res.data.refresh);
              toast.success("Login successful");
              
              if (res.data.user.is_superuser) {
                router.replace("/admin-dashboard");
              } else {
                router.replace(nextPath);
              }
            } catch (err: any) {
              const msg =
                err?.response?.data?.detail ||
                "Login failed. Check phone/password.";
              toast.error(msg);
            }
          })}
        >
          <div className="space-y-1">
            <Label>Phone (ফোন নম্বর)</Label>
            <Input
              placeholder="01XXXXXXXXX"
              autoComplete="tel"
              {...register("phone", { required: true })}
              inputMode="numeric"
              onChange={(e) => {
                const masked = maskBDPhone(e.target.value);
                e.target.value = masked;
              }}
            />
          </div>
          <div className="space-y-1">
            <Label>Password (পাসওয়ার্ড)</Label>
            <Input
              type="password"
              autoComplete="current-password"
              {...register("password", { required: true })}
            />
          </div>

          <Button type="submit" loading={isSubmitting} className="w-full">
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          New here?{" "}
          <Link href="/signup" className="font-medium text-slate-900 underline">
            Create an account
          </Link>
        </div>
      </Card>
    </main>
  );
}

