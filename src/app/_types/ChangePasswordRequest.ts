import { z } from "zod";
import { passwordSchema } from "@/app/_types/CommonSchemas";

export const changePasswordRequestSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "新しいパスワードと確認用パスワードが一致しません。",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "新しいパスワードは現在のパスワードと異なるものにしてください。",
    path: ["newPassword"],
  });

export type ChangePasswordRequest = z.infer<
  typeof changePasswordRequestSchema
>;
