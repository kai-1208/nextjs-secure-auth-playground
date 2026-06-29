"use client";

import React from "react";
import { useAuth } from "@/app/_hooks/useAuth";
import { faTriangleExclamation, faIdCard, faKey } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

interface Props {
  children: React.ReactNode;
}

const memberNavItems = [
  { href: "/member/about", label: "About 編集", icon: faIdCard },
  { href: "/member/change-password", label: "パスワード変更", icon: faKey },
];

const Layout: React.FC<Props> = (props) => {
  const { children } = props;
  const { userProfile } = useAuth();
  const pathname = usePathname();

  if (!userProfile)
    return (
      <main>
        <div className="text-2xl font-bold">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1.5" />
          ログインが必要なコンテンツ
        </div>
        <div className="mt-4">
          このコンテンツを利用するためには
          <NextLink
            href={`/login`}
            className="px-1 text-blue-500 hover:underline"
          >
            ログイン
          </NextLink>
          してください。
        </div>
      </main>
    );

  return (
    <div className="flex gap-x-6">
      {/* Sidebar Navigation */}
      <aside className="w-44 shrink-0">
        <nav className="flex flex-col gap-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {memberNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <NextLink
                key={item.href}
                href={item.href}
                className={twMerge(
                  "flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <FontAwesomeIcon icon={item.icon} className="w-4" />
                {item.label}
              </NextLink>
            );
          })}
        </nav>
      </aside>
      {/* Page Content */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};

export default Layout;

