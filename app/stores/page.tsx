import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { StoresClient } from "./stores-client"

export default async function StoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <StoresClient userEmail={user.email || ""} />
}
