import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

export const dynamic = "force-dynamic"

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "missing" })
const getNvidia = () => new OpenAI({
  apiKey:  process.env.NVIDIA_API_KEY ?? "missing",
  baseURL: "https://integrate.api.nvidia.com/v1",
})

type ModelCfg = { model: string; provider: "openai" | "nvidia" }
const MODEL_MAP: Record<string, ModelCfg> = {
  "gpt-4o":      { model: "gpt-4o",                   provider: "openai" },
  "gpt-4o-mini": { model: "gpt-4o-mini",              provider: "openai" },
  "llama-3-70b": { model: "meta/llama3-70b-instruct", provider: "nvidia" },
  "deepseek-r1": { model: "deepseek-ai/deepseek-r1",  provider: "nvidia" },
}

type SearchResult = { title: string; url: string; content: string }

function makeUserClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

async function webSearch(query: string): Promise<SearchResult[]> {
  if (!process.env.TAVILY_API_KEY) return []
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000) // 3s timeout
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key:      process.env.TAVILY_API_KEY,
        query:        query.slice(0, 400),
        max_results:  5,
        search_depth: "basic",
      }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []).map((r: SearchResult) => ({
      title:   r.title   ?? "",
      url:     r.url     ?? "",
      content: (r.content ?? "").slice(0, 500),
    }))
  } catch {
    return []
  }
}

function buildSystemPrompt(sources: SearchResult[]): string {
  if (sources.length === 0) {
    return "You are a helpful AI research assistant. Answer clearly and accurately."
  }
  const ctx = sources
    .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}`)
    .join("\n\n")

  return `You are a helpful AI research assistant with access to real-time web search results.

WEB SEARCH RESULTS:
${ctx}

Instructions:
- Use the search results above to give an accurate, up-to-date answer.
- Cite sources inline using [1], [2], [3] format after relevant claims.
- If sources conflict, mention it briefly.
- If the search results are insufficient, say so honestly.
- Never fabricate information not present in the sources.
- Be concise and well-structured.`
}

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: { user } } = await anon.auth.getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = makeUserClient(token)

  let { data: profile } = await db.from("profiles").select("*").eq("user_id", user.id).single()
  if (!profile) {
    const { data: created } = await db.from("profiles").insert({ user_id: user.id }).select().single()
    profile = created
  }

  const isSubscribed:    boolean  = profile?.subscription_status === "active"
  const trialModelsUsed: string[] = profile?.trial_models_used ?? []

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 })

  const { messages: rawMessages, model: modelKey, webSearch: doSearch } = body

  if (!Array.isArray(rawMessages) || rawMessages.length === 0 || rawMessages.length > 100) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 })
  }
  for (const m of rawMessages) {
    if (!m || typeof m.role !== "string" || typeof m.content !== "string") {
      return NextResponse.json({ error: "Invalid message format" }, { status: 400 })
    }
    if (m.content.length > 32000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 })
    }
  }

  const modelId = Object.keys(MODEL_MAP).includes(modelKey) ? modelKey : "gpt-4o-mini"

  if (!isSubscribed && trialModelsUsed.includes(modelId)) {
    return NextResponse.json({ error: "UPGRADE_REQUIRED", modelId }, { status: 402 })
  }

  // ── Web search — only when explicitly requested (doSearch !== false) ────────
  const lastUserMsg = [...rawMessages].reverse().find((m: { role: string }) => m.role === "user")
  const searchQuery = lastUserMsg
    ? (typeof lastUserMsg.content === "string" ? lastUserMsg.content : "").slice(0, 300)
    : ""

  // doSearch: true  → always search
  // doSearch: undefined → search (from /chat page which doesn't send the flag)
  // doSearch: false → skip (dashboard internal calls, visual generation, etc.)
  const shouldSearch = doSearch !== false && !!searchQuery
  const sources = shouldSearch ? await webSearch(searchQuery) : []

  const messages = sources.length > 0
    ? [{ role: "system", content: buildSystemPrompt(sources) }, ...rawMessages]
    : [...rawMessages]

  // ── Model setup ────────────────────────────────────────────────────────────
  const cfg    = MODEL_MAP[modelId as keyof typeof MODEL_MAP] ?? MODEL_MAP["gpt-4o-mini"]
  const client = cfg.provider === "openai" ? getOpenAI() : getNvidia()

  const trialUpdated = !isSubscribed && !trialModelsUsed.includes(modelId)
  if (trialUpdated) {
    const updated = [...new Set([...trialModelsUsed, modelId])]
    await db.from("profiles")
      .update({ trial_models_used: updated, free_trial_used: true })
      .eq("user_id", user.id)
  }

  // ── Stream ─────────────────────────────────────────────────────────────────
  try {
    const stream = await client.chat.completions.create({
      model: cfg.model,
      messages,
      max_tokens: 2048,
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ""
            if (text) controller.enqueue(encoder.encode(text))
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type":    "text/plain; charset=utf-8",
        "X-Trial-Updated": String(trialUpdated),
        "X-Model-Id":      modelId,
        "X-Sources":       JSON.stringify(sources),
        "X-Search-Query":  encodeURIComponent(searchQuery.slice(0, 200)),
      },
    })
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status
    if (status === 429) return NextResponse.json({ error: "QUOTA_EXCEEDED" }, { status: 429 })
    return NextResponse.json({ error: "AI_ERROR" }, { status: 500 })
  }
}
