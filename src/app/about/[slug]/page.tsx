import { prisma } from "@/libs/prisma";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard } from "@fortawesome/free-solid-svg-icons";

// キャッシュを無効化して常に最新のプロフィールを取得
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

const Page = async ({ params }: Props) => {
  const { slug } = await params;

  const user = await prisma.user.findUnique({
    where: { aboutSlug: slug },
    select: {
      name: true,
      aboutContent: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <main>
      <div className="text-2xl font-bold">
        <FontAwesomeIcon icon={faIdCard} className="mr-1.5" />
        {user.name} のプロフィール
      </div>

      <div className="mt-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
        {/*
          💀 aboutContent をサニタイズせずに dangerouslySetInnerHTML で出力している。
          攻撃者が /member/about でXSSペイロードを aboutContent に保存すると、
          このページを訪問した全ユーザのブラウザで任意のJavaScriptが実行される。
          これが「蓄積型XSS（Stored XSS）」である。
          反射型XSSと異なり、被害者に不審なURLを踏ませる必要がない。
        */}
        <div dangerouslySetInnerHTML={{ __html: user.aboutContent }} />
      </div>

      <div className="mt-6 text-sm text-slate-600">
        <p className="text-rose-500">
          ※ このページには、蓄積型クロスサイトスクリプティング（Stored
          XSS）が成立し得る深刻な脆弱性が含まれています。
        </p>
      </div>
    </main>
  );
};

export default Page;
