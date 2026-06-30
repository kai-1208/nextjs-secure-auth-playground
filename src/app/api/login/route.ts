import { prisma } from "@/libs/prisma";
import { loginRequestSchema } from "@/app/_types/LoginRequest";
import { userProfileSchema } from "@/app/_types/UserProfile";
import type { UserProfile } from "@/app/_types/UserProfile";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import { createJwt } from "@/app/api/_helper/createJwt";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { AUTH } from "@/config/auth";

// キャッシュを無効化して毎回最新情報を取得
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const POST = async (req: NextRequest) => {
  try {
    const result = loginRequestSchema.safeParse(await req.json());
    if (!result.success) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "リクエストボディの形式が不正です。",
      };
      return NextResponse.json(res);
    }
    const loginRequest = result.data;

    const user = await prisma.user.findUnique({
      where: { email: loginRequest.email },
    });
    if (!user) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message:
          "メールアドレスまたはパスワードの組み合わせが正しくありません。",
      };
      return NextResponse.json(res);
    }

    // bcryptによるパスワードの検証
    const isValidPassword = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );
    if (!isValidPassword) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message:
          "メールアドレスまたはパスワードの組み合わせが正しくありません。",
      };
      return NextResponse.json(res);
    }

    // アカウントの有効性チェック
    if (!user.isActive) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "このアカウントは停止されています。",
      };
      return NextResponse.json(res);
    }

    const tokenMaxAgeSeconds = 60 * 60 * 3; // 3時間

    // トークンベース認証の処理
    const jwt = await createJwt(user, tokenMaxAgeSeconds);

    // jwtをHttpOnly, Secure, SameSiteのcookieに設定
    const cookieStore = await cookies();
    cookieStore.set("auth_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: tokenMaxAgeSeconds,
      path: "/",
    });

    const userProfile: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const res: ApiResponse<UserProfile> = {
      success: true,
      payload: userProfile,
      message: "",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "ログインのサーバサイドの処理に失敗しました。",
    };
    return NextResponse.json(res);
  }
};
