import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// ✅ Supabase setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { degree, skills, interests } = await req.json();

    const prompt = `
A student has:

Degree: ${degree}
Skills: ${skills}
Interests: ${interests}

Suggest:
1. Three career paths
2. Missing skills
3. Learning roadmap
`;

    let result: string = "";

    // 🔥 TRY NVIDIA FIRST
    try {
      const response = await fetch(
        "https://integrate.api.nvidia.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta/llama3-70b-instruct",
            messages: [
              { role: "system", content: "You are a career advisor AI." },
              { role: "user", content: prompt },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("NVIDIA API failed");
      }

      const dataNvidia: any = await response.json();
      result = dataNvidia?.choices?.[0]?.message?.content || "";

    } catch (error) {
      console.error("NVIDIA error:", error);

      // 🧠 FALLBACK TO OPENAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a career advisor AI." },
          { role: "user", content: prompt },
        ],
      });

      result = completion.choices?.[0]?.message?.content || "";
    }

    // 💾 STORE IN SUPABASE
    const { data, error } = await supabase
      .from("analyses")
      .insert([
        {
          degree,
          skills,
          interests,
          result,
        },
      ])
      .select();

    console.log("Inserted row:", data);
    if (error) console.error("Insert error:", error);

    return NextResponse.json({ result });

  } catch (err) {
    console.error("API error:", err);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}