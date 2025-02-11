import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function validate(value: unknown, name: string, maxLen = 500): string | null {
  if (!value || typeof value !== "string") return `${name} is required`
  if (value.trim().length === 0) return `${name} cannot be empty`
  if (value.length > maxLen) return `${name} must be under ${maxLen} characters`
  return null
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 })

    const { degree, skills, interests } = body

    const degreeErr    = validate(degree,    "Degree",    200)
    const skillsErr    = validate(skills,    "Skills",    500)
    const interestsErr = validate(interests, "Interests", 500)
    if (degreeErr)    return NextResponse.json({ error: degreeErr },    { status: 400 })
    if (skillsErr)    return NextResponse.json({ error: skillsErr },    { status: 400 })
    if (interestsErr) return NextResponse.json({ error: interestsErr }, { status: 400 })

    const safeDegree    = degree.trim().slice(0, 200)
    const safeSkills    = skills.trim().slice(0, 500)
    const safeInterests = interests.trim().slice(0, 500)

    const prompt = `A student has:\nDegree: ${safeDegree}\nSkills: ${safeSkills}\nInterests: ${safeInterests}\n\nSuggest:\n1. Three career paths\n2. Missing skills\n3. Learning roadmap`

    let result = ""

    try {
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta/llama3-70b-instruct",
          messages: [
            { role: "system", content: "You are a career advisor AI." },
            { role: "user",   content: prompt },
          ],
        }),
      })
      if (!response.ok) throw new Error("NVIDIA unavailable")
      const data: any = await response.json()
      result = data?.choices?.[0]?.message?.content ?? ""
    } catch {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a career advisor AI." },
          { role: "user",   content: prompt },
        ],
      })
      result = completion.choices?.[0]?.message?.content ?? ""
    }

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
      await supabase.from("analyses").insert([{ degree: safeDegree, skills: safeSkills, interests: safeInterests, result }])
    } catch {
      // non-fatal
    }

    return NextResponse.json({ result })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
