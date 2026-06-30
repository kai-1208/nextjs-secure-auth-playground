"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/_hooks/useAuth";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsersCog,
  faUserSlash,
  faUserCheck,
  faSpinner,
  faTriangleExclamation,
  faEnvelope,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  suspendedAt: string | null;
  createdAt: string;
}

const Page: React.FC = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        credentials: "include", // cookieを含める
        cache: "no-store",
      });
      const data: ApiResponse<AdminUser[]> = await res.json();
      if (data.success && data.payload) {
        setUsers(data.payload);
      } else {
        setErrorMsg(data.message || "ユーザー一覧の取得に失敗しました。");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("ネットワークエラーが発生しました。");
    } finally {
      setIsInitialized(true);
    }
  };

  // useEffect(() => {
  //   if (userProfile && userProfile.role === "ADMIN") {
  //     fetchUsers();
  //   } else if (userProfile) {
  //     setIsInitialized(true);
  //   }
  // }, [userProfile]);

  const handleToggleStatus = async (targetUserId: string) => {
    setActionUserId(targetUserId);
    setErrorMsg("");
    try {
      const res = await fetch(
        `/api/admin/users/${targetUserId}/toggle-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // cookieを含める
        },
      );
      const data: ApiResponse<any> = await res.json();
      if (data.success) {
        // ローカルステートを更新
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUserId
              ? {
                  ...u,
                  isActive: data.payload.isActive,
                  suspendedAt: data.payload.suspendedAt,
                }
              : u,
          ),
        );
      } else {
        setErrorMsg(data.message || "ステータスの切り替えに失敗しました。");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("通信エラーが発生しました。");
    } finally {
      setActionUserId(null);
    }
  };

  if (!userProfile) {
    return (
      <main className="py-8 text-center">
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className="mb-4 text-4xl text-amber-500"
        />
        <h2 className="text-2xl font-bold text-slate-800">
          ログインが必要です
        </h2>
        <p className="mt-2 text-slate-500">
          管理者権限のあるアカウントでログインしてください。
        </p>
      </main>
    );
  }

  if (userProfile.role !== "ADMIN") {
    return (
      <main className="py-8 text-center">
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className="mb-4 text-4xl text-red-500"
        />
        <h2 className="text-2xl font-bold text-slate-800">アクセス拒否</h2>
        <p className="mt-2 text-slate-500">
          このページを閲覧するには管理者権限が必要です。
        </p>
      </main>
    );
  }

  if (!isInitialized) {
    return (
      <main className="py-8 text-center">
        <FontAwesomeIcon
          icon={faSpinner}
          className="animate-spin text-4xl text-indigo-500"
        />
        <p className="mt-2 text-slate-500">読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="py-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            <FontAwesomeIcon
              icon={faUsersCog}
              className="mr-3 text-indigo-600"
            />
            管理者ダッシュボード
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            登録ユーザーのアカウント状況管理・停止・ロック解除制御を行います。
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 flex items-center gap-x-2 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">ユーザー</th>
              <th className="px-6 py-4">権限ロール</th>
              <th className="px-6 py-4">ステータス</th>
              <th className="px-6 py-4">停止日</th>
              <th className="px-6 py-4">登録日</th>
              <th className="px-6 py-4 text-right">アクション</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {users.map((user) => {
              const isSelf = user.id === userProfile.id;
              const isUserActive = user.isActive;

              return (
                <tr
                  key={user.id}
                  className={twMerge(
                    "transition-colors hover:bg-slate-50",
                    !isUserActive && "bg-red-50/30",
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-x-1.5 font-bold text-slate-800">
                        {user.name}
                        {isSelf && (
                          <span className="text-2xs rounded bg-indigo-100 px-1.5 py-0.5 font-medium text-indigo-800">
                            あなた
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 flex items-center gap-x-1 text-xs text-slate-400">
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          className="text-2xs"
                        />
                        {user.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={twMerge(
                        "inline-flex items-center gap-x-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-slate-100 text-slate-800",
                      )}
                    >
                      <FontAwesomeIcon
                        icon={faUserShield}
                        className="text-3xs"
                      />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={twMerge(
                        "inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        isUserActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800",
                      )}
                    >
                      <span
                        className={twMerge(
                          "h-1.5 w-1.5 rounded-full",
                          isUserActive ? "bg-green-500" : "bg-red-500",
                        )}
                      />
                      {isUserActive ? "有効" : "無効 (停止中)"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs whitespace-nowrap text-slate-500">
                    {user.suspendedAt
                      ? new Date(user.suspendedAt).toLocaleString("ja-JP")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-xs whitespace-nowrap text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      disabled={isSelf || actionUserId === user.id}
                      className={twMerge(
                        "inline-flex cursor-pointer items-center gap-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
                        isUserActive
                          ? "bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200"
                          : "bg-green-50 text-green-700 hover:bg-green-100 active:bg-green-200",
                      )}
                    >
                      {actionUserId === user.id ? (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={isUserActive ? faUserSlash : faUserCheck}
                        />
                      )}
                      {isUserActive ? "停止" : "解除"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Page;
