"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faSquareRss,
  faRss,
  faStreetView,
} from "@fortawesome/free-solid-svg-icons";

import { Region } from "@/generated/prisma/enums";
import { NewsItem } from "@/generated/prisma/client";
import { regionDisplayNames } from "@/app/_types/Region";
import type { ApiResponse } from "@/app/_types/ApiResponse";

const NewsPage: React.FC = () => {
  const ep = "/api/news";

  // ---- 共通ステート ----
  const [region, setRegion] = useState<Region>(Region.OSAKA);
  const regionDisplayName = useMemo(() => regionDisplayNames[region], [region]);

  // useSearchParams で URL クエリパラメータを直接取得
  const searchParams = useSearchParams();
  const name = searchParams.get("name"); // 💀 サニタイズ（無害化）せずに値を取得

  // Cookie をセットする関数の定義
  const setSessionCookie = useCallback((region: Region) => {
    Cookies.set("region", region, {
      expires: 7, // 有効期限（7日間）
      // path: "/api/news", // 💀 省略すると "/" が設定される
      // sameSite: "strict", // 💀 適切に設定しないとCSRF脆弱性が生じる
      secure: false, // 💀 本番環境(HTTPS)では true にすべき
    });
    // 👆 セキュアに利用する観点から各設定の意味を調べてみてください
  }, []);

  useEffect(() => {
    // async 化することで setRegion を非同期コールバック内で呼ぶ
    const init = async () => {
      const regionStr = await Promise.resolve(Cookies.get("region"));
      // Cookieが存在しない もしくはデタラメな値の場合は OSAKA をセットする
      if (!regionStr || !Object.values(Region).includes(regionStr as Region)) {
        setSessionCookie(Region.OSAKA);
        return;
      }
      setRegion(regionStr as Region); // Cookieから取得した地域をセット
    };
    init();
  }, [setSessionCookie]);

  // ---- 地域の変更操作（共通） ----
  const changeRegion = async (newRegion: Region) => {
    if (region === newRegion) return;
    setRegion(newRegion);
    // Cookieに保存（クライアントサイドで Cookie を直接操作）
    setSessionCookie(newRegion);
  };

  // ================================================================
  //【基本的な実装】ここから
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(ep, {
          method: "GET",
          credentials: "include", // Cookieも送信
          cache: "no-store",
        });
        const data: ApiResponse<NewsItem[]> = await res.json();
        if (data.success) {
          setNewsItems(data.payload);
        } else {
          console.error(data.message);
        }
      } catch (e) {
        console.error("ニュース記事取得失敗", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, [region]);
  //【基本的な実装】ここまで
  // ================================================================

  // ================================================================
  //【💡SWRを利用した実装】ここから
  // const fetcher = useCallback(async (endPoint: string) => {
  //   const res = await fetch(endPoint, {
  //     credentials: "same-origin",
  //     cache: "no-store",
  //   });
  //   return res.json();
  // }, []);

  // const { data: news, isLoading } = useSWR<ApiResponse<NewsItem[]>>(
  //   ep,
  //   fetcher,
  // );

  // const newsItems = useMemo<NewsItem[]>(
  //   () => (news && news.success ? news.payload : []),
  //   [news],
  // );

  // useEffect(() => {
  //   mutate(ep); // 再検証(キャッシュ無効化して再取得)
  // }, [region]);
  //【💡SWRを利用した実装】ここまで
  // ================================================================

  // データの取得中の画面出力
  if (isLoading) {
    return (
      <main>
        <div className="text-2xl font-bold">
          <FontAwesomeIcon icon={faSquareRss} className="mr-1.5" />
          Local Tech News
        </div>
        <div className="mt-4 flex items-center gap-x-2">
          <FontAwesomeIcon
            icon={faSpinner}
            className="animate-spin text-gray-500"
          />
          <div>Loading... </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="text-2xl font-bold">
        <FontAwesomeIcon icon={faSquareRss} className="mr-1.5" />
        Local Tech News ({regionDisplayName})
      </div>

      {name && (
        <div className="mt-4 ml-4 flex text-sm text-slate-600">
          {/* サニタイズされていない値を dangerouslySetInnerHTML で出力（💀超危険） */}
          <span dangerouslySetInnerHTML={{ __html: name }} className="mr-1" />
          さん、こんにちは！
        </div>
      )}

      <div className="mt-4 ml-4 flex flex-col space-y-2">
        {newsItems.map((p) => (
          <div key={p.id} className="cursor-pointer hover:underline">
            <FontAwesomeIcon icon={faRss} className="mr-2 text-slate-600" />
            {p.title}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-x-3">
        <div className="text-blue-500">
          <FontAwesomeIcon icon={faStreetView} className="mr-1" />
          地域を選択
        </div>
        <div>
          <select
            onChange={async (e) => await changeRegion(e.target.value as Region)}
            value={region}
            className="border-2 px-1"
          >
            {Object.values(Region).map((regionValue) => (
              <option key={regionValue} value={regionValue}>
                {regionDisplayNames[regionValue]} ({regionValue})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        <p>
          ※ デベロッパーツール (F12)
          を起動して「アプリケーション」から「ストレージ」の「Cookie」を確認してください。
        </p>
        <p>※ このコンテンツは、ログインの有無に関係なく機能します。</p>
        <p className="text-rose-500">
          ※
          このコンテンツには、クロスサイトスクリプティング（XSS）が成立し得る深刻な脆弱性が含まれています。
        </p>
      </div>
    </main>
  );
};

// useSearchParams は Suspense 境界が必要
const Page: React.FC = () => (
  <Suspense>
    <NewsPage />
  </Suspense>
);

export default Page;
