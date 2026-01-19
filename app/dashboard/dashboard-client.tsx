"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface DashboardClientProps {
  userEmail: string
}

export function DashboardClient({ userEmail }: DashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <AppLayout userEmail={userEmail} onLogout={handleLogout}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">ダッシュボード</h2>
        <p className="text-gray-600">在庫管理システムへようこそ</p>
      </div>

      {/* 機能カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle>商品マスタ</CardTitle>
              <CardDescription>商品情報を管理</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                商品の追加、編集、削除を行います
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/purchases">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle>仕入れ登録</CardTitle>
              <CardDescription>AI-OCRで効率化</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                納品書から自動で仕入れデータを抽出
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inventory">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle>棚卸し</CardTitle>
              <CardDescription>在庫カウント</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                ケース数とバラ数で簡単に在庫管理
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/stores">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle>店舗管理</CardTitle>
              <CardDescription>店舗情報の設定</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                複数店舗の切り替えと管理
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle>レポート</CardTitle>
              <CardDescription>データ分析</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                仕入れ・在庫状況の可視化
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
          <CardHeader>
            <CardTitle>CSV出力</CardTitle>
            <CardDescription>データエクスポート</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              仕入れ・棚卸しデータのダウンロード
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
