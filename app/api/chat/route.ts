import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase-server"
import OpenAI from "openai"

export const dynamic = "force-dynamic"

const getOpenAI  = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "missing" })
const getNvidia  = () => new OpenAI({
  apiKey:  process.env.NVIDIA_API_KEY ?? "missing",
  baseURL: "https://integrate.api.nvidia.com/v1",
})

const MODEL_MAP: Record<string, { client: "openai" | "nvidia"; model: string }> = {
  "gpt-4o":       { client: "openai",  model: "gpt-4o" },
  "gpt-4o-mini":  { client: "openai",  model: "gpt-4o-mini" },
  "llama-3-70b":  { client: "nvidia",  model: "meta/llama3-70b-instruct" },
  "deepseek-r1":  { client: "nvidia",  model: "deepseek-ai/deepseek-r1" },
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!profile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({ user_id: user.id })
      .select()
      .single()
    profile = created
  }

  const isSubscribed      = profile?.subscription_status === "active"
  const trialModelsUsed: string[] = profile?.trial_models_used ?? []

  const { messages, model: modelKey } = await req.json()
  const modelId = modelKey ?? "gpt-4o-mini"

  // Per-model trial gate
  if (!isSubscribed && trialModelsUsed.includes(modelId)) {
    return NextResponse.json({ error: "UPGRADE_REQUIRED", modelId }, { status: 402 })
  }

  const cfg    = MODEL_MAP[modelId] ?? MODEL_MAP["gpt-4o-mini"]
  const client = cfg.client === "nvidia" ? getNvidia() : getOpenAI()

  let reply = ""
  try {
    const completion = await client.chat.completions.create({
      model: cfg.model, messages, max_tokens: 2048,
    })
    reply = completion.choices[0]?.message?.content ?? ""
  } catch {
    const fallback = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini", messages, max_tokens: 2048,
    })
    reply = fallback.choices[0]?.message?.content ?? ""
  }

  // Consume this model's trial
  if (!isSubscribed) {
    const updated = [...new Set([...trialModelsUsed, modelId])]
    await supabase
      .from("profiles")
      .update({ trial_models_used: updated, free_trial_used: true })
      .eq("user_id", user.id)

    return NextResponse.json({ reply, trialModelsUsed: updated })
  }

  return NextResponse.json({ reply, trialModelsUsed })
}
