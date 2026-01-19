import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase-server"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <DashboardClient userEmail={user.email || ""} />
}
