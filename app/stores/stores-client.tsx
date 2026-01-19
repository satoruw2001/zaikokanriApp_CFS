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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Store {
  id: string
  name: string
  address: string | null
  created_at: string
}

interface StoresClientProps {
  userEmail: string
}

export function StoresClient({ userEmail }: StoresClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [formData, setFormData] = useState({ name: "", address: "" })

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setStores(data || [])
    } catch (error) {
      console.error("店舗の読み込みエラー:", error)
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
      if (editingStore) {
        // 更新
        const { error } = await supabase
          .from("stores")
          .update({ name: formData.name, address: formData.address })
          .eq("id", editingStore.id)
        
        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from("stores")
          .insert([{ name: formData.name, address: formData.address }])
        
        if (error) throw error
      }

      setIsDialogOpen(false)
      setFormData({ name: "", address: "" })
      setEditingStore(null)
      loadStores()
    } catch (error) {
      console.error("店舗の保存エラー:", error)
      alert("店舗の保存に失敗しました")
    }
  }

  const handleEdit = (store: Store) => {
    setEditingStore(store)
    setFormData({ name: store.name, address: store.address || "" })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("この店舗を削除してもよろしいですか？")) return

    try {
      const { error } = await supabase
        .from("stores")
        .delete()
        .eq("id", id)

      if (error) throw error
      loadStores()
    } catch (error) {
      console.error("店舗の削除エラー:", error)
      alert("店舗の削除に失敗しました")
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingStore(null)
    setFormData({ name: "", address: "" })
  }

  return (
    <AppLayout userEmail={userEmail} onLogout={handleLogout}>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">店舗管理</h2>
          <p className="text-gray-600">店舗情報の登録と管理</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleDialogClose()}>
              <Plus className="mr-2 h-4 w-4" />
              新規店舗追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingStore ? "店舗編集" : "新規店舗追加"}</DialogTitle>
                <DialogDescription>
                  店舗の情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">店舗名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="例: 本店"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">住所</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="例: 東京都渋谷区..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  キャンセル
                </Button>
                <Button type="submit">
                  {editingStore ? "更新" : "追加"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>店舗一覧</CardTitle>
          <CardDescription>
            登録されている店舗: {stores.length}件
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : stores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              店舗が登録されていません。「新規店舗追加」ボタンから追加してください。
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>店舗名</TableHead>
                  <TableHead>住所</TableHead>
                  <TableHead>登録日</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.address || "-"}</TableCell>
                    <TableCell>{new Date(store.created_at).toLocaleDateString("ja-JP")}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(store)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(store.id)}
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
    </AppLayout>
  )
}
