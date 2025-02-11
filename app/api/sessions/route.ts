import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim()
  return token ?? null
}

async function getUser(token: string) {
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: { user }, error } = await anon.auth.getUser(token)
  return error || !user ? null : user
}

function db(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  )
}

export async function GET(req: NextRequest) {
  const token = auth(req)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await db(token)
    .from("chat_sessions")
    .select("id, title, model, is_public, updated_at, created_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(100)

  if (error) return NextResponse.json([], { status: 200 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const token = auth(req)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const title = typeof body.title === "string" ? body.title.slice(0, 120) : "New Session"
  const model = typeof body.model === "string" ? body.model : "gpt-4o-mini"

  const { data, error } = await db(token)
    .from("chat_sessions")
    .insert({ user_id: user.id, title, model, messages: [] })
    .select("id, title, model, is_public, updated_at, created_at")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
