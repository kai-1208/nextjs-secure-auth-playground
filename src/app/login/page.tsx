"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginRequest, loginRequestSchema } from "@/app/_types/LoginRequest";
import { UserProfile, userProfileSchema } from "../_types/UserProfile";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import { faSpinner, faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";
import NextLink from "next/link";
import { ApiResponse } from "../_types/ApiResponse";
import { decodeJwt } from "jose";
import { mutate } from "swr";
import { useRouter } from "next/navigation";
import { AUTH } from "@/config/auth";

const Page: React.FC = () => {
  const c_Email = "email";
  const c_Password = "password";

  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoginCompleted, setIsLoginCompleted] = useState(false);

  // フォーム処理関連の準備と設定
  const formMethods = useForm<LoginRequest>({
    mode: "onChange",
    resolver: zodResolver(loginRequestSchema),
  });
  const fieldErrors = formMethods.formState.errors;

  // ルートエラー（サーバサイドで発生した認証エラー）の表示設定の関数
  const setRootError = (errorMsg: string) => {
    formMethods.setError("root", {
      type: "manual",
      message: errorMsg,
    });
  };

  // 初期設定
  useEffect(() => {
    // クエリパラメータからメールアドレスの初期値をセット
    const searchParams = new URLSearchParams(window.location.search);
    const email = searchParams.get(c_Email);
    formMethods.setValue(c_Email, email || "");
  }, [formMethods]);

  // ログイン完了後のリダイレクト処理
  useEffect(() => {
    if (isLoginCompleted) {
      // window.location.href = "/";
      router.replace("/");
      router.refresh();
    }
  }, [isLoginCompleted, router]);

  // ルートエラーのクリア用 onChange ハンドラ合成
  const { onChange: onEmailChange, ...emailRegister } = formMethods.register(c_Email);
  const { onChange: onPasswordChange, ...passwordRegister } = formMethods.register(c_Password);
  const clearRootOnChange =
    (originalOnChange: React.ChangeEventHandler<HTMLInputElement>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      originalOnChange(e);
      formMethods.clearErrors("root");
    };

  // フォームの送信処理
  const onSubmit = async (formValues: LoginRequest) => {
    const ep = "/api/login";

    console.log(JSON.stringify(formValues));
    try {
      setIsPending(true);
      setRootError("");

      const res = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
        credentials: "same-origin",
        cache: "no-store",
      });
      setIsPending(false);

      if (!res.ok) return;

      const body = (await res.json()) as ApiResponse<unknown>;
      if (!body.success) {
        setRootError(body.message);
        return;
      }

      if (AUTH.isSession) {
        // ■■ セッションベース認証の処理 ■■
        setUserProfile(userProfileSchema.parse(body.payload));
      } else {
        // ■■ トークンベース認証の処理 ■■
        const jwt = body.payload as string;
        localStorage.setItem("jwt", jwt); // JWT をローカルストレージに保存
        setUserProfile(userProfileSchema.parse(decodeJwt(jwt)));
      }
      mutate("/api/auth", body);
      setIsLoginCompleted(true);
    } catch (e) {
      const errorMsg =
        e instanceof Error ? e.message : "予期せぬエラーが発生しました。";
      setRootError(errorMsg);
    }
  };

  return (
    <main>
      <div className="text-2xl font-bold">
        <FontAwesomeIcon icon={faRightToBracket} className="mr-1.5" />
        Login
      </div>
      <form
        noValidate
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className={twMerge(
          "mt-4 flex flex-col gap-y-4",
          isLoginCompleted && "cursor-not-allowed opacity-50",
        )}
      >
        <div>
          <label htmlFor={c_Email} className="mb-2 block font-bold">
            メールアドレス（ログインID）
          </label>
          <TextInputField
            {...emailRegister}
            onChange={clearRootOnChange(onEmailChange)}
            id={c_Email}
            placeholder="name@example.com"
            type="email"
            disabled={isPending || isLoginCompleted}
            error={!!fieldErrors.email}
            autoComplete="email"
          />
          <ErrorMsgField msg={fieldErrors.email?.message} />
        </div>

        <div>
          <label htmlFor={c_Password} className="mb-2 block font-bold">
            パスワード
          </label>
          <TextInputField
            {...passwordRegister}
            onChange={clearRootOnChange(onPasswordChange)}
            id={c_Password}
            placeholder="*****"
            type="password"
            disabled={isPending || isLoginCompleted}
            error={!!fieldErrors.password}
            autoComplete="off"
          />
          <ErrorMsgField msg={fieldErrors.password?.message} />
          <ErrorMsgField msg={fieldErrors.root?.message} />
        </div>

        <Button
          variant="indigo"
          width="stretch"
          className={twMerge("tracking-widest")}
          isBusy={isPending}
          disabled={
            !formMethods.formState.isValid || isPending || isLoginCompleted
          }
        >
          ログイン
        </Button>
      </form>

      {isLoginCompleted && (
        <div>
          <div className="mt-4 flex items-center gap-x-2">
            <FontAwesomeIcon icon={faSpinner} spin />
            <div>ようこそ、{userProfile?.name} さん。</div>
          </div>
          <NextLink href="/" className="text-blue-500 hover:underline">
            自動的に画面が切り替わらないときはこちらをクリックしてください。
          </NextLink>
        </div>
      )}
    </main>
  );
};

export default Page;
