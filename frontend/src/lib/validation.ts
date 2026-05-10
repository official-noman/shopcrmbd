import { z } from "zod";

export const bdPhoneSchema = z
  .string()
  .transform((s) => s.trim())
  .transform((s) => s.replace(/[^\d+]/g, ""))
  .transform((s) => (s.startsWith("+88") ? s.slice(3) : s))
  .transform((s) => (s.startsWith("88") && s.length === 13 ? s.slice(2) : s))
  .refine((s) => /^01[3-9]\d{8}$/.test(s), "Enter a valid BD phone (01XXXXXXXXX).");

