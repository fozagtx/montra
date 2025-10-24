"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
      <LogOut className="h-4 w-4" />
    </Button>
  )
}
