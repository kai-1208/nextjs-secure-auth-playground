import { prisma } from "@/libs/prisma";
import { NextResponse, NextRequest } from "next/server";
import type { Product } from "@/app/_types/Product";
import type { ApiResponse } from "@/app/_types/ApiResponse";

export const GET = async (req: NextRequest) => {
  try {
    const products: Product[] = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    const res: ApiResponse<Product[]> = {
      success: true,
      payload: products,
      message: "",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "商品一覧の取得に失敗しました",
    };
    return NextResponse.json(res);
  }
};
