import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase-server"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
    await req.json()

  // Verify signature: HMAC-SHA256 of "payment_id|subscription_id"
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest("hex")

  if (expected !== razorpay_signature) {
    return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 })
  }

  await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_id:     razorpay_subscription_id,
    })
    .eq("user_id", user.id)

  return NextResponse.json({ success: true })
}
