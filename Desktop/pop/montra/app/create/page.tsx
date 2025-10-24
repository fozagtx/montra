import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function CreatePage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  redirect("/dashboard/create")
}
