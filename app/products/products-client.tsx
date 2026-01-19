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
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react"

interface Product {
  id: string
  store_id: string | null
  name: string
  image_url: string | null
  category: string | null
  unit_per_case: number
  cost_price: number | null
  created_at: string
}

interface Store {
  id: string
  name: string
}

interface ProductsClientProps {
  userEmail: string
}

export function ProductsClient({ userEmail }: ProductsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    store_id: "",
    name: "",
    category: "",
    unit_per_case: "1",
    cost_price: "",
    image_url: ""
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

      // 商品一覧を取得
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (productsError) throw productsError
      setProducts(productsData || [])
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
      const productData = {
        store_id: formData.store_id || null,
        name: formData.name,
        category: formData.category || null,
        unit_per_case: parseInt(formData.unit_per_case) || 1,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        image_url: formData.image_url || null
      }

      if (editingProduct) {
        // 更新
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id)
        
        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from("products")
          .insert([productData])
        
        if (error) throw error
      }

      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error("商品の保存エラー:", error)
      alert("商品の保存に失敗しました")
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      store_id: product.store_id || "",
      name: product.name,
      category: product.category || "",
      unit_per_case: product.unit_per_case.toString(),
      cost_price: product.cost_price ? product.cost_price.toString() : "",
      image_url: product.image_url || ""
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("この商品を削除してもよろしいですか？")) return

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error("商品の削除エラー:", error)
      alert("商品の削除に失敗しました")
    }
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      store_id: "",
      name: "",
      category: "",
      unit_per_case: "1",
      cost_price: "",
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

  return (
    <AppLayout userEmail={userEmail} onLogout={handleLogout}>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">商品マスタ</h2>
          <p className="text-gray-600">商品情報の登録と管理</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setIsDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              新規商品追加
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingProduct ? "商品編集" : "新規商品追加"}</DialogTitle>
                <DialogDescription>
                  商品の情報を入力してください
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
                  <Label htmlFor="name">商品名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="例: キャベツ"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">カテゴリ</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="例: 野菜"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit_per_case">入数（ケースあたりのバラ数）</Label>
                    <Input
                      id="unit_per_case"
                      type="number"
                      min="1"
                      value={formData.unit_per_case}
                      onChange={(e) => setFormData({ ...formData, unit_per_case: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cost_price">標準原価（円）</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    placeholder="例: 150"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image_url">商品画像URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  キャンセル
                </Button>
                <Button type="submit">
                  {editingProduct ? "更新" : "追加"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>商品一覧</CardTitle>
          <CardDescription>
            登録されている商品: {products.length}件
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              商品が登録されていません。「新規商品追加」ボタンから追加してください。
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品名</TableHead>
                  <TableHead>店舗</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>入数</TableHead>
                  <TableHead>標準原価</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStoreName(product.store_id)}</TableCell>
                    <TableCell>
                      {product.category ? (
                        <Badge variant="secondary">{product.category}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{product.unit_per_case}</TableCell>
                    <TableCell>
                      {product.cost_price ? `¥${product.cost_price.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
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
