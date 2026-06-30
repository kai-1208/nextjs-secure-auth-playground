import { userProfileSchema, type UserProfile } from "@/app/_types/UserProfile";
import { decodeJwt } from "jose";
import type { ApiResponse } from "../_types/ApiResponse";

export const jwtFetcher = async (): Promise<
  ApiResponse<UserProfile | null>
> => {
  // クライアント側でjwtは管理する必要ない
  // const jwt = localStorage.getItem("jwt");
  // if (!jwt) {
  //   return { success: false, payload: null, message: "JWT not found" };
  // }

  try {
    // const payload = decodeJwt(jwt);
    // if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
    //   localStorage.removeItem("jwt");
    //   return { success: false, payload: null, message: "Token expired" };
    // }

    const res = await fetch("/api/auth", {
      credentials: "include", // cookieを含める
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        success: false,
        payload: null,
        message: "Authentication failed",
      };
    }

    const data = await res.json();
    if (data.success) {
      return {
        success: true,
        payload: userProfileSchema.parse(data.payload),
        message: "",
      };
    }
    return { success: false, payload: null, message: data.message };
  } catch (err) {
    return { success: false, payload: null, message: "Network error" };
  }
};
