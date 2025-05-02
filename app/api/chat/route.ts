import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

export const dynamic = "force-dynamic"

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "missing" })
const getNvidia = () => new OpenAI({
  apiKey:  process.env.NVIDIA_API_KEY ?? "missing",
  baseURL: "https://integrate.api.nvidia.com/v1",
})

const MODEL_MAP = {
  "gpt-4o":      { client: "openai", model: "gpt-4o" },
  "gpt-4o-mini": { client: "openai", model: "gpt-4o-mini" },
  "llama-3-70b": { client: "nvidia", model: "meta/llama3-70b-instruct" },
  "deepseek-r1": { client: "nvidia", model: "deepseek-ai/deepseek-r1" },
} as const

function makeUserClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
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

  const isSubscribed:     boolean  = profile?.subscription_status === "active"
  const trialModelsUsed: string[] = profile?.trial_models_used ?? []

  const { messages, model: modelKey } = await req.json()
  const modelId = modelKey ?? "gpt-4o-mini"

  if (!isSubscribed && trialModelsUsed.includes(modelId)) {
    return NextResponse.json({ error: "UPGRADE_REQUIRED", modelId }, { status: 402 })
  }

  const cfg    = MODEL_MAP[modelId as keyof typeof MODEL_MAP] ?? MODEL_MAP["gpt-4o-mini"]
  const client = cfg.client === "nvidia" ? getNvidia() : getOpenAI()

  let reply = ""
  try {
    const completion = await client.chat.completions.create({ model: cfg.model, messages, max_tokens: 2048 })
    reply = completion.choices[0]?.message?.content ?? ""
  } catch {
    const fallback = await getOpenAI().chat.completions.create({ model: "gpt-4o-mini", messages, max_tokens: 2048 })
    reply = fallback.choices[0]?.message?.content ?? ""
  }

  if (!isSubscribed) {
    const updated = [...new Set([...trialModelsUsed, modelId])]
    await db.from("profiles").update({ trial_models_used: updated, free_trial_used: true }).eq("user_id", user.id)
    return NextResponse.json({ reply, trialModelsUsed: updated })
  }

  return NextResponse.json({ reply, trialModelsUsed })
}
