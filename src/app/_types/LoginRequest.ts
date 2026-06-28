import { z } from "zod";
import { emailSchema, passwordSchema } from "./CommonSchemas";

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
