import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

export const dynamic = "force-dynamic"

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get("x-razorpay-signature") ?? ""

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex")

  if (sig !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const admin = getAdmin()
  let event: { event: string; payload: Record<string, unknown> }
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const subscriptionId =
    (event.payload?.subscription as Record<string, unknown>)?.entity as Record<string, unknown>

  const subId = subscriptionId?.id as string | undefined

  if (event.event === "subscription.charged") {
    if (subId) {
      await admin
        .from("profiles")
        .update({ subscription_status: "active" })
        .eq("subscription_id", subId)
    }
  }

  if (
    event.event === "subscription.cancelled" ||
    event.event === "subscription.completed" ||
    event.event === "subscription.expired"
  ) {
    if (subId) {
      await admin
        .from("profiles")
        .update({ subscription_status: "inactive" })
        .eq("subscription_id", subId)
    }
  }

  return NextResponse.json({ received: true })
}
