import { prisma } from "@/libs/prisma";
import type { About } from "@/app/_types/About";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";

// キャッシュを無効化して常に最新情報を取得
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const GET = async (req: NextRequest) => {
  try {
    // aboutSlug が null ではないレコードを取得する
    const users = await prisma.user.findMany({
      where: {
        aboutSlug: { not: null },
      },
      select: {
        name: true,
        aboutSlug: true,
        aboutContent: true,
      },
    });

    const res: ApiResponse<About[]> = {
      success: true,
      payload: users.map((u) => ({
        userName: u.name,
        aboutSlug: u.aboutSlug,
        aboutContent: u.aboutContent,
      })),
      message: "",
    };

    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "About取得に関するバックエンド処理に失敗しました。",
    };
    return NextResponse.json(res);
  }
};
