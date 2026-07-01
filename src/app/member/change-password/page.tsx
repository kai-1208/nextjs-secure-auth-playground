"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChangePasswordRequest,
  changePasswordRequestSchema,
} from "@/app/_types/ChangePasswordRequest";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKey,
  faCheckCircle,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { twMerge } from "tailwind-merge";

const Page: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const c_CurrentPassword = "currentPassword";
  const c_NewPassword = "newPassword";
  const c_ConfirmPassword = "confirmPassword";

  const formMethods = useForm<ChangePasswordRequest>({
    mode: "onChange",
    resolver: zodResolver(changePasswordRequestSchema),
  });
  const fieldErrors = formMethods.formState.errors;

  const setRootError = (errorMsg: string) => {
    formMethods.setError("root", { type: "manual", message: errorMsg });
  };

  const onSubmit = async (formValues: ChangePasswordRequest) => {
    setIsSuccess(false);

    const headers: HeadersInit = { "Content-Type": "application/json" };

    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers,
        credentials: "include", // cookieを含める
        cache: "no-store",
        body: JSON.stringify(formValues),
      });

      const body: ApiResponse<null> = await res.json();

      if (!body.success) {
        setRootError(body.message);
        return;
      }

      formMethods.reset();
      setIsSuccess(true);
    } catch {
      setRootError("通信エラーが発生しました。時間をおいて再試行してください。");
    }
  };

  return (
    <main className="py-4">
      {/* Page Header */}
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-white-900 text-3xl font-extrabold tracking-tight">
          <FontAwesomeIcon icon={faKey} className="mr-3 text-indigo-600" />
          パスワード変更
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          現在のパスワードを確認後、新しいパスワードに変更します。
        </p>
      </div>

      <div className="max-w-md">
        {/* Success Banner */}
        {isSuccess && (
          <div
            className={twMerge(
              "mb-6 flex items-center gap-x-3 rounded-xl",
              "border border-green-200 bg-green-50 px-4 py-3",
            )}
          >
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-xl text-green-500"
            />
            <div>
              <p className="font-semibold text-green-800">
                パスワードを変更しました！
              </p>
              <p className="text-xs text-green-700">
                次回ログイン時から新しいパスワードをご使用ください。
              </p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form
            noValidate
            onSubmit={formMethods.handleSubmit(onSubmit)}
            className="flex flex-col gap-y-5"
          >
            {/* Current Password */}
            <div>
              <label
                htmlFor={c_CurrentPassword}
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                現在のパスワード
              </label>
              <div className="relative text-slate-700">
                <TextInputField
                  {...formMethods.register(c_CurrentPassword)}
                  id={c_CurrentPassword}
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="現在のパスワードを入力"
                  disabled={formMethods.formState.isSubmitting}
                  error={!!fieldErrors.currentPassword}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <FontAwesomeIcon
                    icon={showCurrentPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
              <ErrorMsgField msg={fieldErrors.currentPassword?.message} />
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-200" />

            {/* New Password */}
            <div>
              <label
                htmlFor={c_NewPassword}
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                新しいパスワード
              </label>
              <div className="relative text-slate-700">
                <TextInputField
                  {...formMethods.register(c_NewPassword)}
                  id={c_NewPassword}
                  type={showNewPassword ? "text" : "password"}
                  placeholder="5文字以上で入力"
                  disabled={formMethods.formState.isSubmitting}
                  error={!!fieldErrors.newPassword}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <FontAwesomeIcon
                    icon={showNewPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
              <ErrorMsgField msg={fieldErrors.newPassword?.message} />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor={c_ConfirmPassword}
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                新しいパスワード（確認用）
              </label>
              <div className="relative text-slate-700">
                <TextInputField
                  {...formMethods.register(c_ConfirmPassword)}
                  id={c_ConfirmPassword}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="もう一度入力してください"
                  disabled={formMethods.formState.isSubmitting}
                  error={!!fieldErrors.confirmPassword}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
              <ErrorMsgField msg={fieldErrors.confirmPassword?.message} />
            </div>

            {/* Root Error */}
            <ErrorMsgField msg={fieldErrors.root?.message} />

            {/* Submit Button */}
            <Button
              variant="indigo"
              width="stretch"
              isBusy={formMethods.formState.isSubmitting}
              disabled={
                !formMethods.formState.isValid ||
                formMethods.formState.isSubmitting
              }
              className="mt-1 tracking-wide"
            >
              パスワードを変更する
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Page;
