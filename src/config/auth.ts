// 本実装では「トークンベース（JWT）認証」のみを使用します
const AUTH_MODE = "jwt" as const;

// 認証モードの設定
export const AUTH = {
  mode: AUTH_MODE,
  isSession: false,
  isJWT: true,
} as const;
