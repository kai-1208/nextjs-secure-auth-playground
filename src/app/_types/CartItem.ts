import { z } from "zod"; // zodライブラリのインポート

// バリデーションスキーマ（データが満たすべき制約条件や構造を定義）
export const cartItemSchema = z.object({
  productId: z.string().min(1).max(10), // 1文字以上10文字以下の「文字列」
  quantity: z.number().int().min(0), // 0以上の「整数値」
});

// バリデーションスキーマをもとに「CartItem型」を生成
export type CartItem = z.infer<typeof cartItemSchema>;
