import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getRazorpay } from "@/lib/razorpay"

export const dynamic = "force-dynamic"

const PLAN_IDS: Record<string, string | undefined> = {
  early:   process.env.RAZORPAY_PLAN_ID_EARLY,
  monthly: process.env.RAZORPAY_PLAN_ID_MONTHLY,
  annual:  process.env.RAZORPAY_PLAN_ID_ANNUAL,
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data: { user }, error } = await anon.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  )

  const { planId: planType } = await req.json().catch(() => ({ planId: "monthly" }))
  const planId = PLAN_IDS[planType as string] ?? PLAN_IDS.monthly
  if (!planId) return NextResponse.json({ error: "Plan not configured" }, { status: 500 })

  const razorpay = getRazorpay()

  let subscription
  try {
    subscription = await razorpay.subscriptions.create({
      plan_id:         planId,
      customer_notify: 1,
      total_count:     120,
      quantity:        1,
      notes: {
        userId: user.id,
        email:  user.email ?? "",
      },
    })
  } catch (err: any) {
    const msg = err?.error?.description ?? err?.message ?? "Razorpay error"
    console.error("Razorpay subscription create failed:", err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  await supabase
    .from("profiles")
    .upsert({ user_id: user.id, subscription_id: subscription.id })

  return NextResponse.json({
    subscriptionId: subscription.id,
    keyId:          process.env.RAZORPAY_KEY_ID,
  })
}
