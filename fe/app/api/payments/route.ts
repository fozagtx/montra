import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()
    const { productId, transactionHash, buyerAddress, amountUsdc, buyerEmail } = body

    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("transaction_hash", transactionHash)
      .single()

    if (existing) {
      return NextResponse.json({ message: "Payment already recorded" })
    }

    const { error } = await supabase.from("payments").insert({
      product_id: productId,
      transaction_hash: transactionHash,
      buyer_address: buyerAddress || "unknown",
      amount_usdc: amountUsdc,
      status: "confirmed",
      buyer_email: buyerEmail,
    })

    if (error) {
      console.error("[v0] Error recording payment:", error)
      return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error recording payment:", error)
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    const { data: payments, error } = await supabase
      .from("payments")
      .select("transaction_hash, buyer_address, amount_usdc, status, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching payments:", error)
      return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
    }

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("[v0] Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
