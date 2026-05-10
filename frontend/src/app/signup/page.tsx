"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Store, 
  Tag, 
  User, 
  Phone, 
  Lock, 
  ArrowRight, 
  ChevronLeft,
  Loader2
} from "lucide-react";

import { api } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { maskBDPhone } from "@/lib/inputMask";
import { bdPhoneSchema } from "@/lib/validation";
import { Button, Card, Input, Label } from "@/components/ui";
import type { LoginResponse } from "@/lib/types";

const registerSchema = z.object({
  shop_name: z.string().min(2, "Shop name is required."),
  shop_type: z.string().min(2, "Shop type is required."),
  owner_name: z.string().min(2, "Owner name is required."),
  phone: bdPhoneSchema,
  password: z.string().min(6, "Password must be at least 6 characters.")
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting }
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      shop_name: "",
      shop_type: "",
      owner_name: "",
      phone: "",
      password: ""
    }
  });

  const shopName = watch("shop_name");
  const shopType = watch("shop_type");

  const canGoNext = shopName.length >= 2 && shopType.length >= 2;

  const handleNextStep = async () => {
    const isValid = await trigger(["shop_name", "shop_type"]);
    if (isValid) {
      setStep(2);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-slate-50 to-slate-50 flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-[440px]">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-4">
            <Store size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ShopCRM BD</h1>
          <p className="text-slate-500 mt-1">Grow your business with smart management</p>
        </div>

        <Card className="p-0 overflow-hidden border-slate-200/60 shadow-[0_20px_50px_rgba(79,70,229,0.1)] rounded-3xl bg-white/80 backdrop-blur-sm">
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-100">
            <motion.div 
              className="h-full bg-indigo-600"
              initial={{ width: "50%" }}
              animate={{ width: step === 1 ? "50%" : "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {step === 1 ? "Shop Details" : "Owner Information"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {step === 1 ? "Tell us about your business" : "Final step to get started"}
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                Step {step}/2
              </span>
            </div>

            <form
              onSubmit={handleSubmit(async (values) => {
                try {
                  const res = await api.post<LoginResponse>("auth/register/", values);
                  setTokens(res.data.access, res.data.refresh);
                  toast.success("Account created successfully!");
                  router.replace("/dashboard");
                } catch (err: any) {
                  const data = err?.response?.data;
                  const msg =
                    data?.detail ||
                    data?.phone?.[0] ||
                    data?.password?.[0] ||
                    "Signup failed. Please try again.";
                  toast.error(msg);
                }
              })}
            >
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label className="text-slate-500 font-semibold ml-1">Shop Name</Label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                          <Store size={18} />
                        </div>
                        <Input 
                          placeholder="Rahman General Store" 
                          className="pl-10 h-11 border-slate-200 bg-slate-50/30 focus:bg-white transition-all rounded-xl focus:ring-4 focus:ring-indigo-100"
                          {...register("shop_name")} 
                        />
                      </div>
                      {errors.shop_name && (
                        <p className="text-xs text-red-500 font-medium ml-1">{errors.shop_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-500 font-semibold ml-1">Shop Type</Label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10 pointer-events-none">
                          <Tag size={18} />
                        </div>
                        <select 
                          className="w-full pl-10 h-11 border-slate-200 bg-slate-50/30 focus:bg-white transition-all rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none appearance-none"
                          {...register("shop_type")} 
                        >
                          <option value="">Select Shop Type</option>
                          <option value="Grocery">Grocery (মুদি দোকান)</option>
                          <option value="Pharmacy">Pharmacy (ফার্মেসী)</option>
                          <option value="Electronics">Electronics (ইলেকট্রনিক্স)</option>
                          <option value="Clothing">Clothing (বস্ত্রালয়)</option>
                          <option value="Restaurant">Restaurant (রেস্টুরেন্ট)</option>
                          <option value="Stationery">Stationery (স্টেশনারি)</option>
                          <option value="Other">Other (অন্যান্য)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <ChevronLeft size={16} className="-rotate-90" />
                        </div>
                      </div>
                      {errors.shop_type && (
                        <p className="text-xs text-red-500 font-medium ml-1">{errors.shop_type.message}</p>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button
                        type="button"
                        className="w-full h-11 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all"
                        disabled={!canGoNext}
                        onClick={handleNextStep}
                      >
                        Continue <ArrowRight size={18} className="ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label className="text-slate-500 font-semibold ml-1">Owner Name</Label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                          <User size={18} />
                        </div>
                        <Input 
                          placeholder="Md. Rahman" 
                          className="pl-10 h-11 border-slate-200 bg-slate-50/30 focus:bg-white transition-all rounded-xl focus:ring-4 focus:ring-indigo-100"
                          {...register("owner_name")} 
                        />
                      </div>
                      {errors.owner_name && (
                        <p className="text-xs text-red-500 font-medium ml-1">{errors.owner_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-500 font-semibold ml-1">Phone Number</Label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                          <Phone size={18} />
                        </div>
                        <Input 
                          placeholder="01XXXXXXXXX"
                          inputMode="numeric"
                          autoComplete="tel"
                          className="pl-10 h-11 border-slate-200 bg-slate-50/30 focus:bg-white transition-all rounded-xl focus:ring-4 focus:ring-indigo-100"
                          {...register("phone")}
                          onChange={(e) => setValue("phone", maskBDPhone(e.target.value), { shouldValidate: true })}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-red-500 font-medium ml-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-500 font-semibold ml-1">Password</Label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                          <Lock size={18} />
                        </div>
                        <Input 
                          type="password" 
                          autoComplete="new-password"
                          className="pl-10 h-11 border-slate-200 bg-slate-50/30 focus:bg-white transition-all rounded-xl focus:ring-4 focus:ring-indigo-100"
                          {...register("password")} 
                        />
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={() => setStep(1)}
                        className="px-6 border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        <ChevronLeft size={18} className="mr-1" /> Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all" 
                        loading={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : "Complete Setup"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 transition-colors">
                Login here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
