import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const ALLOWED_TYPES = new Set([
  "text/plain", "text/csv", "text/markdown", "text/html",
  "application/json", "application/javascript",
  "application/x-python", "application/x-python-code",
  "text/x-python", "text/x-typescript", "text/typescript",
  "text/javascript", "application/typescript",
])

const ALLOWED_EXTS = new Set([
  ".txt", ".md", ".csv", ".json", ".js", ".ts", ".tsx", ".jsx",
  ".py", ".html", ".css", ".xml", ".yaml", ".yml", ".sh", ".r",
  ".sql", ".toml", ".env", ".log", ".rs", ".go", ".java", ".c",
  ".cpp", ".h", ".rb", ".php",
])

const MAX_SIZE = 512 * 1024 // 512 KB

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim()
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: { user }, error } = await anon.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 512 KB)" }, { status: 400 })
  }

  const filename = file.name
  const ext = "." + filename.split(".").pop()?.toLowerCase()

  const isAllowed = ALLOWED_TYPES.has(file.type) || ALLOWED_EXTS.has(ext)
  if (!isAllowed) {
    return NextResponse.json({ error: "File type not supported. Supported: text, CSV, JSON, JS/TS, Python, and common code files." }, { status: 400 })
  }

  try {
    const content = await file.text()
    const truncated = content.length > 40000 ? content.slice(0, 40000) + "\n\n[... file truncated at 40,000 characters ...]" : content
    return NextResponse.json({ content: truncated, filename, size: file.size })
  } catch {
    return NextResponse.json({ error: "Could not read file content" }, { status: 400 })
  }
}
