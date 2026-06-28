import { prisma } from "@/libs/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Region, NewsItem } from "@/generated/prisma/client";
import { cookies } from "next/headers";
import type { ApiResponse } from "@/app/_types/ApiResponse";

export const GET = async (req: NextRequest) => {
  try {
    const cKey = "region";

    // リクエストに含まれるクッキー region の値を regionStr に取得
    const cookieStore = await cookies();
    const regionStr = cookieStore.get(cKey)?.value ?? Region.OSAKA;

    // 文字列を列挙子 Region.XXXX に変換（不正な文字列は Region.OSAKA にする）
    const region = Object.values(Region).includes(regionStr as Region)
      ? (regionStr as Region)
      : Region.OSAKA;

    // DBから記事を全件取得。実設計では take/skip でページネーションすべき
    const newsItems: NewsItem[] = await prisma.newsItem.findMany({
      where: { region },
      orderBy: { publishedAt: "desc" },
    });

    const res: ApiResponse<NewsItem[]> = {
      success: true,
      payload: newsItems,
      message: "",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "ニュース記事の取得に失敗しました",
      metadata: undefined,
    };
    // このアプリでは エラーも 200 OK で返す設計にしている
    // エラー情報は message や metadata (オプション) に格納
    return NextResponse.json(res);
  }
};
