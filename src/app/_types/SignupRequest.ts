import { z } from "zod";
import {
  userNameSchema,
  emailSchema,
  passwordSchema,
} from "@/app/_types/CommonSchemas";

export const signupRequestSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type SignupRequest = z.infer<typeof signupRequestSchema>;
