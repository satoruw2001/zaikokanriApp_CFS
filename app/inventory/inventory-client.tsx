"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, CheckCircle, Package, Eye } from "lucide-react"

interface InventorySession {
  id: string
  store_id: string | null
  date: string
  status: "draft" | "completed"
  created_at: string
}

interface Store {
  id: string
  name: string
}

interface InventoryClientProps {
  userEmail: string
}

export function InventoryClient({ userEmail }: InventoryClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [sessions, setSessions] = useState<InventorySession[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    store_id: "",
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 店舗一覧を取得
      const { data: storesData, error: storesError } = await supabase
        .from("stores")
        .select("*")
        .order("name")

      if (storesError) throw storesError
      setStores(storesData || [])

      // 棚卸しセッション一覧を取得
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("inventory_sessions")
        .select("*")
        .order("date", { ascending: false })

      if (sessionsError) throw sessionsError
      setSessions(sessionsData || [])
    } catch (error) {
      console.error("データの読み込みエラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const sessionData = {
        store_id: formData.store_id || null,
        date: formData.date,
        status: "draft" as const
      }

      const { data, error } = await supabase
        .from("inventory_sessions")
        .insert([sessionData])
        .select()
        .single()

      if (error) throw error

      setIsDialogOpen(false)
      resetForm()
      
      // 新規作成した棚卸しセッションの詳細ページに遷移
      if (data) {
        router.push(`/inventory/${data.id}`)
      }
    } catch (error) {
      console.error("棚卸しの作成エラー:", error)
      alert("棚卸しの作成に失敗しました")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("この棚卸しセッションを削除してもよろしいですか？")) return

    try {
      const { error } = await supabase
        .from("inventory_sessions")
        .delete()
        .eq("id", id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error("棚卸しの削除エラー:", error)
      alert("棚卸しの削除に失敗しました")
    }
  }

  const resetForm = () => {
    setFormData({
      store_id: "",
      date: new Date().toISOString().split('T')[0]
    })
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const getStoreName = (storeId: string | null) => {
    if (!storeId) return "-"
    const store = stores.find(s => s.id === storeId)
    return store ? store.name : "-"
  }

  const handleViewSession = (sessionId: string) => {
    router.push(`/inventory/${sessionId}`)
  }

  const getStatusBadge = (status: "draft" | "completed") => {
    if (status === "completed") {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          完了
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <Package className="h-3 w-3 mr-1" />
        下書き
      </Badge>
    )
  }

  return (
    <AppLayout userEmail={userEmail} onLogout={handleLogout}>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">棚卸し</h2>
          <p className="text-gray-600">在庫カウントの実施と管理</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              新規棚卸し開始
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>新規棚卸し開始</DialogTitle>
                <DialogDescription>
                  棚卸しの基本情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="store_id">店舗</Label>
                  <Select 
                    value={formData.store_id} 
                    onValueChange={(value) => setFormData({ ...formData, store_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="店舗を選択（任意）" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">棚卸し日 *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  キャンセル
                </Button>
                <Button type="submit">
                  開始
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>棚卸しセッション一覧</CardTitle>
          <CardDescription>
            登録されている棚卸し: {sessions.length}件
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              棚卸しが登録されていません。「新規棚卸し開始」ボタンから追加してください。
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>棚卸し日</TableHead>
                  <TableHead>店舗</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>作成日時</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {new Date(session.date).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell>{getStoreName(session.store_id)}</TableCell>
                    <TableCell>{getStatusBadge(session.status)}</TableCell>
                    <TableCell>
                      {new Date(session.created_at).toLocaleString("ja-JP")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewSession(session.id)}
                        title="詳細を見る"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(session.id)}
                        disabled={session.status === "completed"}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>棚卸しの流れ</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>「新規棚卸し開始」ボタンをクリック</li>
            <li>棚卸し日と店舗を選択して開始</li>
            <li>商品ごとにケース数とバラ数を入力</li>
            <li>入力が完了したら「完了」ボタンで確定</li>
            <li>CSVエクスポートで結果をダウンロード</li>
          </ol>
          <p className="mt-4 text-sm text-gray-600">
            ※ 在庫総数 = (ケース数 × 入数) + バラ数で自動計算されます
          </p>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
