import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { InventoryClient } from "./inventory-client"

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <InventoryClient userEmail={user.email || ""} />
}
