import { prisma } from "@/libs/prisma";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import { verifyAdmin } from "@/app/api/_helper/verifyAdmin";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const GET = async (req: NextRequest) => {
  try {
    const adminId = await verifyAdmin(req);
    if (!adminId) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "この操作には管理者権限が必要です。",
      };
      return NextResponse.json(res); // API response pattern in project (always 200)
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        suspendedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const res: ApiResponse<typeof users> = {
      success: true,
      payload: users,
      message: "",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "ユーザー一覧の取得に失敗しました。",
    };
    return NextResponse.json(res);
  }
};
