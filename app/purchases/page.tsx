import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { PurchasesClient } from "./purchases-client"

export default async function PurchasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <PurchasesClient userEmail={user.email || ""} />
}
