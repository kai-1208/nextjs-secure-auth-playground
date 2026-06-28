import { prisma } from "@/libs/prisma";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const stolenContent = req.nextUrl.searchParams.get("c");
    if (!stolenContent) return NextResponse.json(null);

    await prisma.stolenContent.create({
      data: {
        content: stolenContent,
      },
    });
    return NextResponse.json(null);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    return NextResponse.json(null);
  }
};
