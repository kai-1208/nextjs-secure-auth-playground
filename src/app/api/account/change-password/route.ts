import { prisma } from "@/libs/prisma";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import { verifyJwt } from "@/app/api/_helper/verifyJwt";
import { changePasswordRequestSchema } from "@/app/_types/ChangePasswordRequest";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const POST = async (req: NextRequest) => {
  try {
    // JWT認証: ログイン中のユーザーかどうかを確認
    const userId = await verifyJwt(req);
    if (!userId) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "認証情報が無効です。再度ログインしてください。",
      };
      return NextResponse.json(res);
    }

    // リクエストボディのパース・バリデーション
    const result = changePasswordRequestSchema.safeParse(await req.json());
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      // 最初のエラーメッセージを取得
      const firstError =
        Object.values(fieldErrors).flat()[0] ??
        result.error.flatten().formErrors[0] ??
        "リクエストボディの形式が不正です。";
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: firstError,
      };
      return NextResponse.json(res);
    }
    const { currentPassword, newPassword } = result.data;

    // ユーザーをDBから取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, isActive: true },
    });

    if (!user || !user.isActive) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "ユーザーが存在しないか、アカウントが停止されています。",
      };
      return NextResponse.json(res);
    }

    // 現在のパスワード照合
    // NOTE: 現状のシードデータはbcryptハッシュ化されていないため、平文比較もフォールバックで対応
    let isCurrentPasswordValid: boolean;
    const isHashed = user.password.startsWith("$2");
    if (isHashed) {
      isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
    } else {
      // 平文パスワードの場合（開発・テスト環境向け）
      isCurrentPasswordValid = user.password === currentPassword;
    }

    if (!isCurrentPasswordValid) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "現在のパスワードが正しくありません。",
      };
      return NextResponse.json(res);
    }

    // 新しいパスワードをbcryptでハッシュ化して保存
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    const res: ApiResponse<null> = {
      success: true,
      payload: null,
      message: "パスワードを変更しました。",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "パスワード変更のサーバサイドの処理に失敗しました。",
    };
    return NextResponse.json(res);
  }
};
