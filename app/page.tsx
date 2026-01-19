import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold mb-6 text-gray-900">在庫管理アプリ</h1>
        <p className="text-xl text-gray-700 mb-8">
          飲食店向け在庫管理・棚卸しシステム
        </p>
        <p className="text-gray-600 mb-8">
          AI-OCRで納品書を自動読み取り、効率的な在庫管理を実現します
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/login">
            <Button size="lg">ログイン</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline">新規登録</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
