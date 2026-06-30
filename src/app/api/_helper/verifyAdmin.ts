import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { userProfileSchema } from "@/app/_types/UserProfile";
import { Role } from "@/app/_types/Role";
import { prisma } from "@/libs/prisma";

/**
 * JWTを検証し、該当ユーザーがデータベース上に存在し、かつ ADMIN ロールで isActive であるかチェックする
 * Cookie または Authorization ヘッダから JWT を取得する
 */
export const verifyAdmin = async (req: NextRequest): Promise<string | null> => {
  const cookieStore = await cookies();
  const jwtFromCookie = cookieStore.get("auth_token")?.value;

  // Authorization ヘッダから JWT を取得（後方互換性）
  const jwtFromHeader = req.headers
    .get("Authorization")
    ?.replace("Bearer ", "");

  // Cookie または ヘッダから JWT を使用
  const jwt = jwtFromCookie || jwtFromHeader;

  if (!jwt) {
    console.error("JWT is missing in the request headers.");
    return null;
  }
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  try {
    const { payload } = await jwtVerify(jwt, secret);
    const userProfile = userProfileSchema.parse(payload);

    // ロールチェック (JWTベースでの簡易チェック)
    if (userProfile.role !== Role.ADMIN) {
      console.error(`User ${userProfile.id} is not an ADMIN in JWT payload.`);
      return null;
    }

    // データベースでの整合性チェック (より安全)
    const dbUser = await prisma.user.findUnique({
      where: { id: userProfile.id },
      select: { id: true, role: true, isActive: true },
    });

    if (!dbUser) {
      console.error(`User ${userProfile.id} not found in database.`);
      return null;
    }

    if (!dbUser.isActive) {
      console.error(`User ${userProfile.id} is suspended/inactive.`);
      return null;
    }

    if (dbUser.role !== Role.ADMIN) {
      console.error(`User ${userProfile.id} database role is not ADMIN.`);
      return null;
    }

    return dbUser.id;
  } catch (e) {
    if (e instanceof Error) {
      console.error(`Failed to verify Admin: ${e.message}`);
    } else {
      console.error("Failed to verify Admin: Unknown error");
    }
    return null;
  }
};
