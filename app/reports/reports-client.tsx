"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Download, TrendingUp, Package, ShoppingCart } from "lucide-react"

interface ReportsClientProps {
  userEmail: string
}

export function ReportsClient({ userEmail }: ReportsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStores: 0,
    totalPurchases: 0,
    totalInventorySessions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // 統計情報を取得
      const [productsRes, storesRes, purchasesRes, inventoryRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("stores").select("id", { count: "exact", head: true }),
        supabase.from("purchases").select("id", { count: "exact", head: true }),
        supabase.from("inventory_sessions").select("id", { count: "exact", head: true })
      ])

      setStats({
        totalProducts: productsRes.count || 0,
        totalStores: storesRes.count || 0,
        totalPurchases: purchasesRes.count || 0,
        totalInventorySessions: inventoryRes.count || 0
      })
    } catch (error) {
      console.error("統計情報の読み込みエラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const handleExportPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .order("date", { ascending: false })

      if (error) throw error

      // CSV形式に変換
      const csv = [
        ["ID", "店舗ID", "仕入れ日", "合計金額", "画像URL", "作成日時"].join(","),
        ...(data || []).map(row => 
          [
            row.id,
            row.store_id || "",
            row.date,
            row.total_amount || "",
            row.image_url || "",
            row.created_at
          ].join(",")
        )
      ].join("\n")

      // ダウンロード
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `purchases_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    } catch (error) {
      console.error("CSVエクスポートエラー:", error)
      alert("CSVエクスポートに失敗しました")
    }
  }

  const handleExportInventory = async () => {
    try {
      const { data, error } = await supabase
        .from("inventory_sessions")
        .select("*")
        .order("date", { ascending: false })

      if (error) throw error

      // CSV形式に変換
      const csv = [
        ["ID", "店舗ID", "棚卸し日", "ステータス", "作成日時"].join(","),
        ...(data || []).map(row => 
          [
            row.id,
            row.store_id || "",
            row.date,
            row.status,
            row.created_at
          ].join(",")
        )
      ].join("\n")

      // ダウンロード
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    } catch (error) {
      console.error("CSVエクスポートエラー:", error)
      alert("CSVエクスポートに失敗しました")
    }
  }

  return (
    <AppLayout userEmail={userEmail} onLogout={handleLogout}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">レポート</h2>
        <p className="text-gray-600">データ分析とエクスポート</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">登録店舗数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStores}</div>
            <p className="text-xs text-muted-foreground">店舗</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">登録商品数</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">商品</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">仕入れ記録数</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">棚卸し回数</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInventorySessions}</div>
            <p className="text-xs text-muted-foreground">回</p>
          </CardContent>
        </Card>
      </div>

      {/* CSVエクスポート */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>データエクスポート</CardTitle>
          <CardDescription>
            仕入れや棚卸しのデータをCSV形式でダウンロード
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleExportPurchases} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              仕入れデータをエクスポート
            </Button>
            <Button onClick={handleExportInventory} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              棚卸しデータをエクスポート
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 将来実装予定の機能 */}
      <Card>
        <CardHeader>
          <CardTitle>今後実装予定の機能</CardTitle>
          <CardDescription>
            より詳細な分析機能を追加予定
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>仕入れ金額の推移グラフ</li>
            <li>商品別の仕入れ頻度分析</li>
            <li>在庫回転率の計算</li>
            <li>原価率の分析</li>
            <li>カテゴリ別の集計</li>
            <li>店舗別の比較レポート</li>
          </ul>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
