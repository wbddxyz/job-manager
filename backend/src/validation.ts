import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().max(255).email().or(z.literal("")).optional(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(1000).optional()
}).strict();

export const jobSchema = z.object({
  customer_id: z.number().int().positive(),
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).optional(),
  status: z.enum([
    "quoted",
    "in_progress",
    "completed",
    "cancelled"
  ]).optional(),
  price: z.number().min(0).max(9999999.99).optional(),
  due_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(value => {
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));

      return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
      );
    }, "Enter a real calendar date")
    .optional()
    .nullable()
}).strict();
