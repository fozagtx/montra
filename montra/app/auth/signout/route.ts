import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient()
    await supabase.auth.signOut()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error signing out:", error)
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 })
  }
}
