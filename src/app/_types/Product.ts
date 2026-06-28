import { z } from "zod";

export const productSchema = z.object({
  id: z.string().min(1), // 1文字以上
  name: z.string().min(1), // 1文字以上
  price: z.number().min(0), // 0以上
});

export type Product = z.infer<typeof productSchema>;
