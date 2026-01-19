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
import { Plus, Edit, Trash2, FileText, Eye, Upload } from "lucide-react"

interface Purchase {
  id: string
  store_id: string | null
  date: string
  image_url: string | null
  total_amount: number | null
  created_at: string
}

interface Store {
  id: string
  name: string
}

interface PurchasesClientProps {
  userEmail: string
}

export function PurchasesClient({ userEmail }: PurchasesClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
  const [formData, setFormData] = useState({
    store_id: "",
    date: new Date().toISOString().split('T')[0],
    total_amount: "",
    image_url: ""
  })
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 店舗一覧を取得
      const { data: storesData, error: storesError} = await supabase
        .from("stores")
        .select("*")
        .order("name")

      if (storesError) throw storesError
      setStores(storesData || [])

      // 仕入れ一覧を取得
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("purchases")
        .select("*")
        .order("date", { ascending: false })

      if (purchasesError) throw purchasesError
      setPurchases(purchasesData || [])
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      
      // ファイル名を生成
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `purchases/${fileName}`

      // Supabase Storageにアップロード
      const { data, error } = await supabase.storage
        .from('purchase_images')
        .upload(filePath, file)

      if (error) throw error

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('purchase_images')
        .getPublicUrl(filePath)

      setFormData({ ...formData, image_url: publicUrl })
    } catch (error: any) {
      console.error("画像アップロードエラー:", error)
      alert(`画像のアップロードに失敗しました: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const purchaseData = {
        store_id: formData.store_id || null,
        date: formData.date,
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : null,
        image_url: formData.image_url || null
      }

      if (editingPurchase) {
        // 更新
        const { error } = await supabase
          .from("purchases")
          .update(purchaseData)
          .eq("id", editingPurchase.id)
        
        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from("purchases")
          .insert([purchaseData])
        
        if (error) throw error
      }

      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error("仕入れの保存エラー:", error)
      alert("仕入れの保存に失敗しました")
    }
  }

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase)
    setFormData({
      store_id: purchase.store_id || "",
      date: purchase.date,
      total_amount: purchase.total_amount ? purchase.total_amount.toString() : "",
      image_url: purchase.image_url || ""
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("この仕入れ記録を削除してもよろしいですか？")) return

    try {
      const { error } = await supabase
        .from("purchases")
        .delete()
        .eq("id", id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error("仕入れの削除エラー:", error)
      alert("仕入れの削除に失敗しました")
    }
  }

  const resetForm = () => {
    setEditingPurchase(null)
    setFormData({
      store_id: "",
      date: new Date().toISOString().split('T')[0],
      total_amount: "",
      image_url: ""
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

  const handleViewImage = (imageUrl: string) => {
    setPreviewImage(imageUrl)
    setIsPreviewOpen(true)
  }

  return (
    <AppLayout userEmail={userEmail} onLogout={handleLogout}>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">仕入れ登録</h2>
          <p className="text-gray-600">仕入れ情報の登録と管理</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setIsDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              新規仕入れ登録
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingPurchase ? "仕入れ編集" : "新規仕入れ登録"}</DialogTitle>
                <DialogDescription>
                  仕入れ情報を入力してください
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
                  <Label htmlFor="date">仕入れ日 *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total_amount">合計金額（円）</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    placeholder="例: 15000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">納品書画像</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading && (
                    <p className="text-sm text-blue-600">
                      <Upload className="inline h-4 w-4 mr-1" />
                      アップロード中...
                    </p>
                  )}
                  {formData.image_url && !uploading && (
                    <p className="text-sm text-green-600">
                      ✓ 画像がアップロードされました
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    スマホではカメラまたは写真ライブラリから選択できます
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={uploading}>
                  {editingPurchase ? "更新" : "登録"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>仕入れ一覧</CardTitle>
          <CardDescription>
            登録されている仕入れ: {purchases.length}件
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              仕入れが登録されていません。「新規仕入れ登録」ボタンから追加してください。
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>仕入れ日</TableHead>
                  <TableHead>店舗</TableHead>
                  <TableHead>合計金額</TableHead>
                  <TableHead>納品書</TableHead>
                  <TableHead>登録日時</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">
                      {new Date(purchase.date).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell>{getStoreName(purchase.store_id)}</TableCell>
                    <TableCell>
                      {purchase.total_amount ? (
                        `¥${purchase.total_amount.toLocaleString()}`
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {purchase.image_url ? (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => handleViewImage(purchase.image_url!)}>
                          <FileText className="h-3 w-3 mr-1" />
                          あり
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(purchase.created_at).toLocaleString("ja-JP")}
                    </TableCell>
                    <TableCell className="text-right">
                      {purchase.image_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewImage(purchase.image_url!)}
                          title="画像を見る"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(purchase)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(purchase.id)}
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

      {/* 画像プレビューダイアログ */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>納品書画像</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="w-full">
              <img 
                src={previewImage} 
                alt="納品書" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>AI-OCR機能について</CardTitle>
          <CardDescription>
            将来実装予定の機能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            納品書画像をアップロードすると、OpenAI GPT-4oが自動で品名・数量・金額を抽出し、
            商品マスタと自動的に名寄せを行います。学習機能により、使うほど精度が向上します。
          </p>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
