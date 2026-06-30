import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { userProfileSchema } from "@/app/_types/UserProfile";
import { cookies } from "next/headers";

/**
 * CookieのJwtを検証して成功すれば userId を返す
 */

export const verifyJwt = async (req: NextRequest): Promise<string | null> => {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("auth_token")?.value;

  const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
  const token = jwt || authHeader;

  if (!token) {
    console.error("JWT is missing in the request headers.");
    return null;
  }
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  try {
    const { payload } = await jwtVerify(token, secret);
    const userProfile = userProfileSchema.parse(payload);
    return userProfile.id;
  } catch (e) {
    if (e instanceof Error) {
      console.error(`Failed to verify JWT: ${e.message}`);
    } else {
      console.error("Failed to verify JWT: Unknown error");
    }
    return null;
  }
};
