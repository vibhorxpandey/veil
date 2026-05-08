import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 15

export async function POST(req: NextRequest) {
  try {
    const { query, type } = await req.json()
    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const q = query.trim()

    // Route by type or pattern
    const isArxivId = /^\d{4}\.\d{4,5}(v\d+)?$/.test(q) || /^arxiv:/i.test(q)
    const isDoi = /^10\.\d{4,}\//.test(q) || /^https?:\/\/doi\.org\//.test(q)

    if (type === "arxiv" || isArxivId) {
      const id = q.replace(/^arxiv:/i, "").trim()
      return NextResponse.json(await fetchArxivBibtex(id))
    }

    if (type === "doi" || isDoi) {
      return NextResponse.json(await fetchDoiBibtex(q))
    }

    // Fall back to Semantic Scholar title search
    return NextResponse.json(await fetchSemanticScholarBibtex(q))
  } catch (err) {
    const msg = err instanceof Error ? err.message : "BibTeX fetch failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ── arXiv Atom API ──────────────────────────────────────────────────────────
async function fetchArxivBibtex(arxivId: string) {
  const cleanId = arxivId.replace(/v\d+$/, "")
  const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(cleanId)}&max_results=1`
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error("arXiv API request failed")
  const xml = await res.text()

  if (xml.includes("<title>Error</title>") || !xml.includes("<entry>")) {
    throw new Error(`arXiv paper ${cleanId} not found`)
  }

  const rawTitle = xml.match(/<title>([\s\S]*?)<\/title>/g)?.[1]?.replace(/<\/?title>/g, "").replace(/\s+/g, " ").trim() ?? "Unknown Title"
  const title = rawTitle.replace(/^"/, "").replace(/"$/, "")
  const authorNames = [...xml.matchAll(/<name>([\s\S]*?)<\/name>/g)].map(m => m[1].trim())
  const year = xml.match(/<published>(\d{4})/)?.[1] ?? new Date().getFullYear().toString()

  const authors =
    authorNames.length > 0
      ? authorNames.map(a => {
          const parts = a.split(" ")
          return parts.length > 1 ? `${parts.slice(-1)[0]}, ${parts.slice(0, -1).join(" ")}` : a
        }).join(" and ")
      : "Unknown Author"

  const firstAuthorLast = authorNames[0]?.split(" ").pop()?.toLowerCase() ?? "author"
  const key = `${firstAuthorLast}${year}${cleanId.replace(".", "").slice(0, 6)}`

  const bibtex = `@article{${key},
  title={{${title}}},
  author={${authors}},
  journal={arXiv preprint arXiv:${cleanId}},
  year={${year}},
  url={https://arxiv.org/abs/${cleanId}},
  archivePrefix={arXiv},
  eprint={${cleanId}}
}`

  return {
    bibtex,
    metadata: {
      key,
      title,
      authors: authorNames.slice(0, 3).join(", ") + (authorNames.length > 3 ? " et al." : ""),
      year,
      source: "arXiv",
      url: `https://arxiv.org/abs/${cleanId}`,
    },
  }
}

// ── CrossRef DOI API ────────────────────────────────────────────────────────
async function fetchDoiBibtex(doi: string) {
  const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//i, "")
  const url = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`
  const res = await fetch(url, {
    headers: { "User-Agent": "VeilResearch/1.0 (mailto:contact@veilresearch.com)" },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error("CrossRef API request failed — check the DOI")
  const data = await res.json()
  const w = data.message

  const title = (w.title?.[0] ?? "Unknown Title") as string
  type CrossRefAuthor = { family?: string; given?: string }
  const authorArr: CrossRefAuthor[] = w.author ?? []
  const authors = authorArr
    .map(a => `${a.family ?? ""}, ${a.given ?? ""}`.trim().replace(/^,\s*/, ""))
    .join(" and ")
  const year = (w.published?.["date-parts"]?.[0]?.[0] ?? new Date().getFullYear()).toString()
  const journal = (w["container-title"]?.[0] ?? w.publisher ?? "Unknown") as string
  const volume = w.volume ?? ""
  const pages = w.page ?? ""
  const key = `${(authorArr[0]?.family ?? "author").toLowerCase().replace(/[^a-z]/g, "")}${year}`

  const bibtex = `@article{${key},
  title={{${title}}},
  author={${authors}},
  journal={${journal}},
  year={${year}},${volume ? `\n  volume={${volume}},` : ""}${pages ? `\n  pages={${pages}},` : ""}
  doi={${cleanDoi}},
  url={https://doi.org/${cleanDoi}}
}`

  return {
    bibtex,
    metadata: {
      key,
      title,
      authors: authorArr
        .slice(0, 3)
        .map(a => `${a.given ?? ""} ${a.family ?? ""}`.trim())
        .join(", ") + (authorArr.length > 3 ? " et al." : ""),
      year,
      source: "CrossRef",
      url: `https://doi.org/${cleanDoi}`,
    },
  }
}

// ── Semantic Scholar API ────────────────────────────────────────────────────
async function fetchSemanticScholarBibtex(query: string) {
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=1&fields=title,authors,year,externalIds,publicationVenue,journal`
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error("Semantic Scholar API request failed")
  const data = await res.json()
  const paper = data.data?.[0]
  if (!paper) throw new Error(`No papers found for: "${query}"`)

  const title = (paper.title ?? "Unknown Title") as string
  type SSAuthor = { name?: string }
  const authorArr: SSAuthor[] = paper.authors ?? []
  const authors = authorArr
    .map((a: SSAuthor) => {
      const parts = (a.name ?? "").split(" ")
      return parts.length > 1 ? `${parts.slice(-1)[0]}, ${parts.slice(0, -1).join(" ")}` : (a.name ?? "")
    })
    .join(" and ")
  const year = (paper.year ?? new Date().getFullYear()).toString()
  const venue = (paper.publicationVenue?.name ?? paper.journal?.name ?? "Unknown") as string
  const arxivId = paper.externalIds?.ArXiv as string | undefined
  const doi = paper.externalIds?.DOI as string | undefined
  const key = `${(authorArr[0]?.name?.split(" ").pop() ?? "author").toLowerCase().replace(/[^a-z]/g, "")}${year}`

  const bibtex = `@article{${key},
  title={{${title}}},
  author={${authors}},
  journal={${venue}},
  year={${year}},${arxivId ? `\n  eprint={${arxivId}},\n  archivePrefix={arXiv},` : ""}${doi ? `\n  doi={${doi}},` : ""}
  url={https://www.semanticscholar.org/paper/${paper.paperId as string}}
}`

  return {
    bibtex,
    metadata: {
      key,
      title,
      authors:
        authorArr
          .slice(0, 3)
          .map((a: SSAuthor) => a.name ?? "")
          .join(", ") + (authorArr.length > 3 ? " et al." : ""),
      year,
      source: "Semantic Scholar",
      url: `https://www.semanticscholar.org/paper/${paper.paperId as string}`,
    },
  }
}
