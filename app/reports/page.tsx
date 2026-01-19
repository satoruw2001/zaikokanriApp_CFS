import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { ReportsClient } from "./reports-client"

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <ReportsClient userEmail={user.email || ""} />
}
