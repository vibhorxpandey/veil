import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")?.trim().slice(0, 400) ?? "large language model"
  const sort  = searchParams.get("sort") ?? "cited_by_count:desc"

  try {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&sort=${sort}&per-page=12&select=title,doi,publication_year,authorships,primary_location&mailto=vibhorpandey09@gmail.com`
    const res  = await fetch(url, { next: { revalidate: 300 } })

    if (!res.ok) return NextResponse.json({ results: [] })

    const data = await res.json()
    return NextResponse.json({ results: data.results ?? [] })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
