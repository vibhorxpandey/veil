import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: { user }, error } = await anon.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.query || typeof body.query !== "string") {
    return NextResponse.json({ error: "Query required" }, { status: 400 })
  }

  const query = body.query.trim().slice(0, 400)

  if (!process.env.TAVILY_API_KEY) {
    return NextResponse.json({ results: [], error: "Search not configured" })
  }

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key:     process.env.TAVILY_API_KEY,
        query,
        max_results: 5,
        search_depth: "basic",
        include_answer: false,
      }),
    })

    if (!res.ok) return NextResponse.json({ results: [] })

    const data = await res.json()
    const results = (data.results ?? []).map((r: { title: string; url: string; content: string }) => ({
      title:   r.title,
      url:     r.url,
      content: r.content?.slice(0, 800) ?? "",
    }))

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
