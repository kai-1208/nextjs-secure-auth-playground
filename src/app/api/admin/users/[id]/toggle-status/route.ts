import { prisma } from "@/libs/prisma";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import { verifyAdmin } from "@/app/api/_helper/verifyAdmin";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const adminId = await verifyAdmin(req);
    if (!adminId) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "この操作には管理者権限が必要です。",
      };
      return NextResponse.json(res);
    }

    const { id: targetUserId } = await params;

    // 自分自身のアカウントを停止しようとしていないかチェック
    if (adminId === targetUserId) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "自分自身のアカウント状態を変更することはできません。",
      };
      return NextResponse.json(res);
    }

    // 対象ユーザーの存在確認
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, isActive: true },
    });

    if (!targetUser) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "指定されたユーザーが見つかりません。",
      };
      return NextResponse.json(res);
    }

    const newIsActive = !targetUser.isActive;
    const newSuspendedAt = newIsActive ? null : new Date();

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isActive: newIsActive,
        suspendedAt: newSuspendedAt,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        suspendedAt: true,
      },
    });

    const res: ApiResponse<typeof updatedUser> = {
      success: true,
      payload: updatedUser,
      message: `ユーザーのステータスを ${newIsActive ? "有効" : "無効"} に変更しました。`,
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "ステータスの切り替えに失敗しました。",
    };
    return NextResponse.json(res);
  }
};
