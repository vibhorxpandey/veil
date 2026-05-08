import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { latex, bibliography } = await req.json()

    if (!latex?.trim()) {
      return NextResponse.json({ error: "LaTeX content required" }, { status: 400 })
    }

    const serviceUrl = process.env.LATEX_SERVICE_URL

    if (!serviceUrl) {
      // No compile service configured — return structured response so the
      // frontend can degrade gracefully to the HTML structural preview
      return NextResponse.json({
        success: false,
        serviceAvailable: false,
        pdfBase64: null,
        errors: [],
        message:
          "LaTeX compilation service not configured. " +
          "Set LATEX_SERVICE_URL to point to a running TexLive HTTP service " +
          "(see docker-compose.latex.yml in the project root). " +
          "The structural preview is always available without compilation.",
      })
    }

    // Proxy to the configured TexLive Docker service
    const response = await fetch(`${serviceUrl}/compile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latex, bibliography }),
      signal: AbortSignal.timeout(28000),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      return NextResponse.json({
        success: false,
        serviceAvailable: true,
        pdfBase64: null,
        errors: errData.errors ?? [{ message: "Compilation failed", line: null }],
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error"
    return NextResponse.json(
      {
        success: false,
        serviceAvailable: false,
        pdfBase64: null,
        errors: [{ message: msg, line: null }],
      },
      { status: 500 }
    )
  }
}
