"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  Store, 
  FileText,
  LogOut
} from "lucide-react"

interface AppLayoutProps {
  children: React.ReactNode
  userEmail?: string
  onLogout?: () => void
}

const navigation = [
  { name: "ダッシュボード", href: "/dashboard", icon: LayoutDashboard },
  { name: "商品マスタ", href: "/products", icon: Package },
  { name: "仕入れ登録", href: "/purchases", icon: ShoppingCart },
  { name: "棚卸し", href: "/inventory", icon: ClipboardList },
  { name: "店舗管理", href: "/stores", icon: Store },
  { name: "レポート", href: "/reports", icon: FileText },
]

export function AppLayout({ children, userEmail, onLogout }: AppLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PCサイドバー */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center border-b">
            <h1 className="text-xl font-bold text-gray-900">在庫管理アプリ</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            isActive
                              ? "bg-gray-100 text-blue-600"
                              : "text-gray-700 hover:text-blue-600 hover:bg-gray-50",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                          )}
                        >
                          <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="border-t border-gray-200 pt-4">
                  {userEmail && (
                    <p className="text-xs text-gray-500 mb-2 truncate">{userEmail}</p>
                  )}
                  {onLogout && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={onLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      ログアウト
                    </Button>
                  )}
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="lg:pl-64">
        {/* モバイルヘッダー */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
          <h1 className="text-lg font-semibold text-gray-900">在庫管理アプリ</h1>
          {userEmail && (
            <p className="ml-auto text-xs text-gray-500 truncate max-w-[150px]">
              {userEmail}
            </p>
          )}
        </div>

        {/* ページコンテンツ */}
        <main className="py-6 pb-20 lg:pb-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* モバイルボトムナビゲーション */}
      <nav className="fixed bottom-0 z-50 w-full border-t border-gray-200 bg-white lg:hidden">
        <div className="flex justify-around">
          {navigation.slice(0, 5).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1",
                  isActive ? "text-blue-600" : "text-gray-600"
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs mt-1 truncate">{item.name.split(" ")[0]}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
