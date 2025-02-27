import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase-server"
import { getRazorpay } from "@/lib/razorpay"

export const dynamic = "force-dynamic"

export async function POST() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const razorpay = getRazorpay()

  const subscription = await razorpay.subscriptions.create({
    plan_id:         process.env.RAZORPAY_PLAN_ID!,
    customer_notify: 1,
    // 0 = forever recurring, 12 = 12 billing cycles
    total_count:     0,
    quantity:        1,
    notes: {
      userId: user.id,
      email:  user.email ?? "",
    },
  })

  // Store subscription id against user for webhook lookup
  await supabase
    .from("profiles")
    .upsert({ user_id: user.id, subscription_id: subscription.id })

  return NextResponse.json({
    subscriptionId: subscription.id,
    keyId:          process.env.RAZORPAY_KEY_ID,
  })
}
