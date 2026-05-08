"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import {
  Sparkles, BookMarked, ImageIcon, CheckSquare, Download, Upload,
  Plus, X, ChevronDown, ExternalLink, Copy, Check, Trash2,
  Columns, AlertTriangle, AlertCircle, Globe, FileArchive,
  PenLine, Send, Search, Archive, Info,
} from "lucide-react"

// ── Dynamic Monaco import (no SSR) ─────────────────────────────────────────
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loading: () => <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#1e1e1e" }}><div className="wm-spin" style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(139,92,246,0.3)", borderTop: "2px solid #8b5cf6" }} /></div>,
})

// ── Types ───────────────────────────────────────────────────────────────────
type Layout = "split" | "editor" | "preview"
type TemplateId = "arxiv" | "neurips" | "icml" | "iclr" | "ieee" | "acm"
type CitStyle = "plain" | "ieee" | "acm" | "neurips" | "apa"
type SidePanel = null | "refs" | "figs" | "compliance" | "submit"

interface Ref { id: string; key: string; title: string; authors: string; year: string; source: string; bibtex: string; url?: string }
interface Fig { id: string; name: string; caption: string; label: string; dataUrl: string; format: string }
interface CompItem { id: string; label: string; status: "pass" | "warn" | "fail"; message: string }
interface PaperForm { title: string; topic: string; methodology: string; results: string; venue: string }
interface CompileError { message: string; line?: number }

// ── LaTeX Monarch tokenizer ─────────────────────────────────────────────────
const LATEX_TOKENS = {
  defaultToken: "",
  tokenizer: {
    root: [
      [/%.*$/, "comment"],
      [/\\begin\{[^}]*\}/, "keyword.control"],
      [/\\end\{[^}]*\}/, "keyword.control"],
      [/\\documentclass(\[[^\]]*\])?\{[^}]*\}/, "keyword.other"],
      [/\\usepackage(\[[^\]]*\])?\{[^}]*\}/, "keyword.other"],
      [/\\[a-zA-Z@]+\*?/, "keyword"],
      [/\$\$[\s\S]*?\$\$/, "string"],
      [/\$[^$\n]*\$/, "string"],
      [/\{/, "delimiter.bracket"],
      [/\}/, "delimiter.bracket"],
      [/[&~_^]/, "keyword.operator"],
    ],
  },
}

// ── Templates ───────────────────────────────────────────────────────────────
const TEMPLATES: Record<TemplateId, { name: string; desc: string; thumb: string; content: string }> = {
  arxiv: {
    name: "arXiv General", desc: "Standard article for arXiv submission", thumb: "📄",
    content: `\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage[numbers]{natbib}
\\usepackage{booktabs}

\\title{Your Paper Title}
\\author{Author Name \\\\
Department, Institution \\\\
\\texttt{email@institution.edu}}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
Enter your abstract here. Keep it under 1,920 characters for arXiv compliance. Summarize the problem, approach, key results, and significance.
\\end{abstract}

\\section{Introduction}
\\label{sec:intro}

\\section{Related Work}
\\label{sec:related}

\\section{Methodology}
\\label{sec:method}

\\section{Experiments and Results}
\\label{sec:experiments}

\\section{Discussion}
\\label{sec:discussion}

\\section{Conclusion}
\\label{sec:conclusion}

\\bibliographystyle{plainnat}
\\bibliography{references}

\\end{document}`,
  },
  neurips: {
    name: "NeurIPS 2024", desc: "NeurIPS 2024 conference style", thumb: "🧠",
    content: `\\documentclass{article}
\\usepackage[preprint]{neurips_2024}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{hyperref}

\\title{Your Paper Title}

\\author{
  Author Name \\\\
  Affiliation \\\\
  City, Country \\\\
  \\texttt{email@domain.com}
}

\\begin{document}
\\maketitle

\\begin{abstract}
Your abstract here.
\\end{abstract}

\\section{Introduction}

\\section{Related Work}

\\section{Method}

\\section{Experiments}

\\subsection{Setup}

\\subsection{Results}

\\section{Conclusion}

\\bibliographystyle{plainnat}
\\bibliography{references}

\\end{document}`,
  },
  icml: {
    name: "ICML 2025", desc: "ICML 2025 conference style", thumb: "🤖",
    content: `\\documentclass{article}
\\usepackage[accepted]{icml2025}
\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{hyperref}

\\icmltitlerunning{Short Running Title}

\\begin{document}

\\twocolumn[
\\icmltitle{Your Paper Title}

\\begin{icmlauthorlist}
\\icmlauthor{Author Name}{inst}
\\end{icmlauthorlist}

\\icmlaffiliation{inst}{Department, University, City, Country}
\\icmlkeywords{keyword1, keyword2, Machine Learning, ICML}
\\vskip 0.3in
]

\\begin{abstract}
Your abstract here.
\\end{abstract}

\\section{Introduction}

\\section{Related Work}

\\section{Method}

\\section{Experiments}

\\section{Conclusion}

\\bibliography{references}
\\bibliographystyle{icml2025}

\\end{document}`,
  },
  iclr: {
    name: "ICLR 2025", desc: "ICLR 2025 conference style", thumb: "🔬",
    content: `\\documentclass{article}
\\usepackage{iclr2025_conference,times}
\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{hyperref}

\\title{Your Paper Title}

\\author{Author Name \\\\
Department of X, Institution \\\\
City, Country \\\\
\\texttt{email@institution.edu}}

\\newcommand{\\fix}{\\marginpar{FIX}}
\\newcommand{\\new}{\\marginpar{NEW}}
\\iclrfinalcopy

\\begin{document}
\\maketitle

\\begin{abstract}
Your abstract here.
\\end{abstract}

\\section{Introduction}

\\section{Related Work}

\\section{Method}

\\section{Experiments}

\\section{Conclusion}

\\bibliography{references}
\\bibliographystyle{iclr2025_conference}

\\end{document}`,
  },
  ieee: {
    name: "IEEE Transactions", desc: "IEEE Transactions journal style", thumb: "⚡",
    content: `\\documentclass[journal]{IEEEtran}
\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}
\\usepackage{url}
\\usepackage{hyperref}

\\begin{document}

\\title{Your Paper Title}

\\author{\\IEEEauthorblockN{First Author}
\\IEEEauthorblockA{Department, Institution\\\\
City, Country \\ email@institution.com}}

\\maketitle

\\begin{abstract}
Your abstract here. IEEE abstracts are 150--250 words.
\\end{abstract}

\\begin{IEEEkeywords}
keyword1, keyword2, keyword3.
\\end{IEEEkeywords}

\\IEEEpeerreviewmaketitle

\\section{Introduction}
\\IEEEPARstart{T}{his} paper presents...

\\section{Related Work}

\\section{Proposed Method}

\\section{Experimental Results}

\\section{Conclusion}

\\bibliographystyle{IEEEtran}
\\bibliography{references}

\\end{document}`,
  },
  acm: {
    name: "ACM", desc: "ACM Conference and Journal style", thumb: "🖥️",
    content: `\\documentclass[sigconf]{acmart}
\\usepackage{booktabs}

\\title{Your Paper Title}

\\author{Author Name}
\\affiliation{\\institution{Institution}\\city{City}\\country{Country}}
\\email{email@institution.edu}

\\begin{abstract}
Your abstract here.
\\end{abstract}

\\keywords{keyword1, keyword2, keyword3}

\\begin{document}
\\maketitle

\\section{Introduction}

\\section{Related Work}

\\section{Methodology}

\\section{Evaluation}

\\subsection{Experimental Setup}

\\subsection{Results}

\\section{Conclusion}

\\bibliographystyle{ACM-Reference-Format}
\\bibliography{references}

\\end{document}`,
  },
}

const CIT_STYLES: Record<CitStyle, string> = {
  plain: "plainnat", ieee: "IEEEtran", acm: "ACM-Reference-Format",
  neurips: "plainnat", apa: "apalike",
}

// ── HTML structural preview ─────────────────────────────────────────────────
function buildPreview(latex: string): string {
  const clean = (s: string) =>
    s.replace(/\\textbf\{([^}]+)\}/g, "<strong>$1</strong>")
      .replace(/\\emph\{([^}]+)\}/g, "<em>$1</em>")
      .replace(/\\textit\{([^}]+)\}/g, "<em>$1</em>")
      .replace(/\\cite(?:p|t|s|alt)?\{([^}]+)\}/g, '<sup style="color:#3b82f6">[$1]</sup>')
      .replace(/\\ref\{([^}]+)\}/g, '<span style="color:#8b5cf6">[$1]</span>')
      .replace(/\\\\/g, "<br/>")
      .replace(/\\[a-zA-Z]+(\{[^}]*\})?/g, (_, b) => b ? b.slice(1, -1) : "")
      .replace(/\$([^$\n]+)\$/g, "<em>$1</em>")
      .trim()

  const title = latex.match(/\\title\{([^}]+)\}/)?.[1]
  const author = latex.match(/\\author\{([\s\S]+?)(?=\n\\date|\n\\begin|\n\n)/)?.[1]?.replace(/\\\\/g, ", ").replace(/\\texttt\{([^}]+)\}/g, "$1")
  const abstractTxt = latex.match(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/)?.[1]?.trim()
  const sections = [...latex.matchAll(/\\(sub(?:sub)?)?section\*?\{([^}]+)\}([\s\S]*?)(?=\\(?:sub(?:sub)?)?section|\\bibliography|\\end\{document\}|$)/g)]

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Georgia,"Computer Modern",serif;max-width:700px;margin:40px auto;padding:0 40px 80px;color:#111;font-size:11pt;line-height:1.8;background:#fff}
    h1.pt{font-size:18pt;font-weight:bold;text-align:center;margin-bottom:10px;line-height:1.35}
    .au{text-align:center;color:#555;margin-bottom:28px;font-size:10pt;line-height:1.6}
    .ab{border:1px solid #ccc;border-radius:4px;padding:14px 18px;margin:24px 0;font-size:10pt;color:#333}
    .ab-lbl{font-weight:bold;font-variant:small-caps;font-size:10pt;display:block;margin-bottom:6px}
    h2{font-size:13pt;font-weight:bold;margin:28px 0 8px;padding-bottom:4px;border-bottom:1px solid #e0e0e0;counter-increment:sec}
    h2::before{content:counter(sec) ". "}
    h3{font-size:11.5pt;font-weight:bold;margin:16px 0 5px}
    h4{font-size:11pt;font-weight:bold;margin:12px 0 4px}
    p{margin-bottom:10px;color:#222;text-align:justify}
    .ph{color:#aaa;font-style:italic;font-size:9.5pt}
    body{counter-reset:sec}
  </style></head><body>
  ${title ? `<h1 class="pt">${clean(title)}</h1>` : ""}
  ${author ? `<div class="au">${clean(author)}</div>` : ""}
  ${abstractTxt ? `<div class="ab"><span class="ab-lbl">Abstract</span>${clean(abstractTxt)}</div>` : ""}
  ${sections.map(m => {
    const lvl = m[1] ? (m[1] === "sub" ? 3 : 4) : 2
    const tag = `h${lvl}`
    const body = m[3]?.trim() ?? ""
    const paras = [...body.matchAll(/([^\n]{60,})/g)].slice(0, 2)
    return `<${tag}>${clean(m[2])}</${tag}>${paras.length ? paras.map(p => `<p>${clean(p[1]).slice(0, 300)}…</p>`).join("") : '<p class="ph">[Section content]</p>'}`
  }).join("\n")}
  </body></html>`
}

// ── Compliance checker ──────────────────────────────────────────────────────
function runCompliance(latex: string, bib: string, _figs: Fig[], compiled: boolean): CompItem[] {
  const checks: CompItem[] = []

  checks.push({
    id: "compile", label: "LaTeX compiles without errors",
    status: compiled ? "pass" : "warn",
    message: compiled ? "Last compilation succeeded" : "Set LATEX_SERVICE_URL for live PDF compilation",
  })

  const citeKeys = [...latex.matchAll(/\\cite(?:p|t|s|alt)?\{([^}]+)\}/g)].flatMap(m => m[1].split(",").map(k => k.trim()))
  const bibKeys = [...bib.matchAll(/@\w+\{([^,\s]+),/g)].map(m => m[1].trim())
  const missing = citeKeys.filter(k => k && !bibKeys.includes(k))
  checks.push({
    id: "cites", label: "All \\cite{} keys exist in references.bib",
    status: citeKeys.length === 0 ? "pass" : missing.length === 0 ? "pass" : "fail",
    message: missing.length === 0 ? `${citeKeys.length} citation(s) resolved` : `Missing: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`,
  })

  const abMatch = latex.match(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/)
  const abLen = abMatch ? abMatch[1].replace(/\\[a-zA-Z]+(\{[^}]*\})?/g, "").trim().length : 0
  checks.push({
    id: "abstract", label: "Abstract is under 1,920 characters",
    status: abLen === 0 ? "warn" : abLen <= 1920 ? "pass" : "fail",
    message: abLen === 0 ? "No abstract found" : `${abLen.toLocaleString()} / 1,920 characters`,
  })

  const allIncludes = [...latex.matchAll(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g)].map(m => m[1])
  const badFigs = allIncludes.filter(f => !/\.(pdf|png|eps)$/i.test(f))
  checks.push({
    id: "figformats", label: "All figures are PDF, PNG, or EPS format",
    status: badFigs.length === 0 ? "pass" : "warn",
    message: badFigs.length === 0 ? "All figure formats are arXiv-compatible" : `Non-arXiv formats detected: ${badFigs.slice(0, 2).join(", ")}`,
  })

  checks.push({
    id: "docclass", label: "\\documentclass is correctly set",
    status: /\\documentclass/.test(latex) ? "pass" : "fail",
    message: /\\documentclass/.test(latex) ? latex.match(/\\documentclass(?:\[[^\]]*\])?\{[^}]+\}/)?.[0] ?? "\\documentclass found" : "Missing \\documentclass{...}",
  })

  const hasMath = /\\begin\{equation\}|\\begin\{align\}|\$[^$]|\\\[/.test(latex)
  const hasAms = /\\usepackage.*amsmath/.test(latex)
  checks.push({
    id: "packages", label: "Required \\usepackage declarations present",
    status: hasMath && !hasAms ? "warn" : "pass",
    message: hasMath && !hasAms ? "Math found but amsmath not loaded — add \\usepackage{amsmath}" : "Package declarations look good",
  })

  const labels = [...latex.matchAll(/\\label\{([^}]+)\}/g)].map(m => m[1])
  const refs = [...latex.matchAll(/\\(?:ref|eqref|autoref)\{([^}]+)\}/g)].map(m => m[1])
  const unused = labels.filter(l => !refs.includes(l))
  checks.push({
    id: "labels", label: "All \\label{} declarations are referenced",
    status: unused.length === 0 ? "pass" : "warn",
    message: unused.length === 0 ? "All labels are cross-referenced" : `${unused.length} unreferenced label(s): ${unused.slice(0, 2).join(", ")}`,
  })

  return checks
}

// ── Main component ──────────────────────────────────────────────────────────
export default function WriteModeView({ accessToken }: { accessToken: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monacoRef = useRef<any>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const figInputRef = useRef<HTMLInputElement>(null)

  const [latex, setLatex] = useState(TEMPLATES.arxiv.content)
  const [bib, setBib] = useState("")
  const [refs, setRefs] = useState<Ref[]>([])
  const [figs, setFigs] = useState<Fig[]>([])
  const [layout, setLayout] = useState<Layout>("split")
  const [panel, setPanel] = useState<SidePanel>(null)
  const [previewHtml, setPreviewHtml] = useState(() => buildPreview(TEMPLATES.arxiv.content))
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [compiling, setCompiling] = useState(false)
  const [compiled, setCompiled] = useState(false)
  const [errors, setErrors] = useState<CompileError[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const [showGenModal, setShowGenModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genForm, setGenForm] = useState<PaperForm>({ title: "", topic: "", methodology: "", results: "", venue: "arXiv General" })
  const [bibSearch, setBibSearch] = useState("")
  const [bibSearching, setBibSearching] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [citStyle, setCitStyle] = useState<CitStyle>("plain")
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("arxiv")

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg); setTimeout(() => setToast(null), 2500)
  }, [])

  // ── Debounced compilation on LaTeX/bib change ────────────────────────────
  useEffect(() => {
    setPreviewHtml(buildPreview(latex))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setCompiling(true)
      try {
        const res = await fetch("/api/latex/compile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latex, bibliography: bib }),
        })
        const data = await res.json()
        if (data.success && data.pdfBase64) {
          const bytes = Uint8Array.from(atob(data.pdfBase64 as string), c => c.charCodeAt(0))
          const blob = new Blob([bytes], { type: "application/pdf" })
          setPdfUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob) })
          setErrors([]); setCompiled(true)
          if (monacoRef.current && editorRef.current) {
            monacoRef.current.editor.setModelMarkers(editorRef.current.getModel(), "latex", [])
          }
        } else {
          setCompiled(false)
          if (data.errors?.length) {
            setErrors(data.errors as CompileError[]); setShowErrors(true)
            if (monacoRef.current && editorRef.current) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const markers = (data.errors as CompileError[]).filter(e => e.line).map((e: CompileError) => ({
                severity: monacoRef.current.MarkerSeverity.Error,
                startLineNumber: e.line!, startColumn: 1, endLineNumber: e.line!, endColumn: 999,
                message: e.message,
              }))
              monacoRef.current.editor.setModelMarkers(editorRef.current.getModel(), "latex", markers)
            }
          }
        }
      } catch { setCompiled(false) }
      finally { setCompiling(false) }
    }, 2000)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latex, bib])

  // ── Citation style reformatting ───────────────────────────────────────────
  useEffect(() => {
    const styleCmd = CIT_STYLES[citStyle]
    setLatex(prev => prev.replace(/\\bibliographystyle\{[^}]+\}/, `\\bibliographystyle{${styleCmd}}`))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citStyle])

  // ── AI paper generator ────────────────────────────────────────────────────
  async function generatePaper() {
    if (!genForm.title.trim() || !genForm.topic.trim()) return
    setGenerating(true)

    const venue = genForm.venue
    const prompt = `Generate a complete, publication-ready LaTeX research paper.

Title: ${genForm.title}
Research Topic: ${genForm.topic}
Methodology: ${genForm.methodology || "Describe your methodology"}
Key Results: ${genForm.results || "Describe your results"}
Target Venue: ${venue}

Requirements:
1. Use the document class and style appropriate for ${venue}
2. Include ALL sections: Introduction, Related Work, Methodology, Experiments and Results, Discussion, Conclusion
3. Each section must have 2-4 paragraphs of realistic academic content grounded in the topic
4. Cite 6-10 real, relevant papers using \\cite{key} commands
5. Include at least 2 equations in equation environments
6. Include 2 figure placeholders using \\includegraphics[width=0.8\\textwidth]{figures/fig1.pdf}
7. After the LaTeX, output BibTeX for all cited papers

Format your response as:
\`\`\`latex
<complete LaTeX document>
\`\`\`

\`\`\`bibtex
<BibTeX entries for all references>
\`\`\``

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], model: "gpt-4o", webSearch: true }),
      })
      const reader = res.body!.getReader(); const decoder = new TextDecoder(); let content = ""
      while (true) { const { done, value } = await reader.read(); if (done) break; content += decoder.decode(value, { stream: true }) }

      const latexMatch = content.match(/```(?:latex|tex)([\s\S]+?)```/i)
      const bibMatch = content.match(/```bibtex([\s\S]+?)```/i)

      if (latexMatch) {
        setLatex(latexMatch[1].trim())
        showToast("Paper generated — review and edit as needed!")
      }
      if (bibMatch) {
        setBib(bibMatch[1].trim())
        const newRefs: Ref[] = [...bibMatch[1].matchAll(/@\w+\{([^,\s]+),/g)].map(m => {
          const key = m[1].trim()
          const titleM = bibMatch[1].match(new RegExp(`@\\w+\\{${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")},[\\s\\S]*?title=\\{\\{?([^}]+)\\}?\\}`))
          const yearM  = bibMatch[1].match(new RegExp(`@\\w+\\{${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")},[\\s\\S]*?year=\\{(\\d+)\\}`))
          return { id: crypto.randomUUID(), key, title: titleM?.[1] ?? key, authors: "", year: yearM?.[1] ?? "2024", source: "AI", bibtex: "" }
        })
        setRefs(prev => { const existing = new Set(prev.map(r => r.key)); return [...prev, ...newRefs.filter(r => !existing.has(r.key))] })
      }
      setShowGenModal(false)
    } catch { showToast("Generation failed — please try again") }
    finally { setGenerating(false) }
  }

  // ── BibTeX search ─────────────────────────────────────────────────────────
  async function searchBibtex() {
    if (!bibSearch.trim()) return
    setBibSearching(true)
    try {
      const res = await fetch("/api/bibtex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: bibSearch.trim(), type: "auto" }),
      })
      if (!res.ok) throw new Error()
      const { bibtex, metadata } = await res.json() as { bibtex: string; metadata: Omit<Ref, "id" | "bibtex"> }
      if (refs.find(r => r.key === metadata.key)) { showToast("Reference already added"); return }
      setRefs(prev => [...prev, { id: crypto.randomUUID(), ...metadata, bibtex }])
      setBib(prev => (prev ? `${prev}\n\n${bibtex}` : bibtex))
      setBibSearch("")
      showToast("Reference added to bibliography!")
    } catch { showToast("Not found — try an arXiv ID (e.g. 1706.03762) or DOI") }
    finally { setBibSearching(false) }
  }

  function removeRef(id: string) {
    const ref = refs.find(r => r.id === id)
    if (!ref) return
    setRefs(prev => prev.filter(r => r.id !== id))
    if (ref.bibtex) setBib(prev => prev.replace(ref.bibtex, "").replace(/\n{3,}/g, "\n\n").trim())
  }

  function insertCitation(key: string) {
    const pos = editorRef.current?.getPosition()
    if (pos) {
      editorRef.current?.executeEdits("insert-cite", [{ range: { startLineNumber: pos.lineNumber, startColumn: pos.column, endLineNumber: pos.lineNumber, endColumn: pos.column }, text: `\\cite{${key}}` }])
      editorRef.current?.focus()
    } else {
      showToast(`\\cite{${key}} — click in the editor first`)
    }
  }

  // ── Figure upload ─────────────────────────────────────────────────────────
  function handleFigUpload(file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png"
      const label = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
      setFigs(prev => [...prev, { id: crypto.randomUUID(), name: file.name, caption: "", label: `fig:${label}`, dataUrl, format: ext }])
    }
    reader.readAsDataURL(file)
  }

  function insertFigure(fig: Fig) {
    const latexFig = `\n\\begin{figure}[h]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{figures/${fig.name}}\n\\caption{${fig.caption || "Caption for figure."}}\n\\label{${fig.label}}\n\\end{figure}\n`
    const pos = editorRef.current?.getPosition()
    if (pos) {
      editorRef.current?.executeEdits("insert-fig", [{ range: { startLineNumber: pos.lineNumber, startColumn: pos.column, endLineNumber: pos.lineNumber, endColumn: pos.column }, text: latexFig }])
      editorRef.current?.focus()
    } else {
      setLatex(prev => prev.replace("\\end{document}", `${latexFig}\n\\end{document}`))
    }
    showToast("Figure inserted!")
  }

  // ── Apply template ────────────────────────────────────────────────────────
  function applyTemplate(id: TemplateId) {
    const t = TEMPLATES[id]
    const existingTitle  = latex.match(/\\title\{([^}]+)\}/)?.[1]
    const existingAuthor = latex.match(/\\author\{([\s\S]+?)(?=\n\\(?:date|begin|maketitle)|\n\n)/)?.[1]
    let newLatex = t.content
    if (existingTitle)  newLatex = newLatex.replace(/\\title\{[^}]+\}/, `\\title{${existingTitle}}`)
    if (existingAuthor) newLatex = newLatex.replace(/\\author\{[\s\S]+?\}(?=\n\\(?:date|begin|maketitle)|\n\n)/, `\\author{${existingAuthor}}`)
    setLatex(newLatex); setActiveTemplate(id); setShowTemplateModal(false)
    showToast(`Template applied: ${t.name}`)
  }

  // ── ZIP export ────────────────────────────────────────────────────────────
  async function exportZip() {
    setExporting(true)
    try {
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()
      zip.file("main.tex", latex)
      if (bib) zip.file("references.bib", bib)
      const figFolder = zip.folder("figures")!
      for (const fig of figs) {
        const b64 = fig.dataUrl.split(",")[1]
        if (b64) figFolder.file(fig.name, b64, { base64: true })
      }
      const rawTitle = latex.match(/\\title\{([^}]+)\}/)?.[1] ?? "paper"
      const slug = rawTitle.slice(0, 40).replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase().replace(/^-|-$/g, "")
      const dateStr = new Date().toISOString().slice(0, 10)
      zip.file("README.txt", `arXiv Submission Guide — Generated by Veil Research
${"=".repeat(58)}

FILES
  main.tex         — LaTeX source
  references.bib   — BibTeX bibliography
  figures/         — Embedded figure files

SUBMISSION STEPS
  1. Go to https://arxiv.org/submit
  2. Click "New Submission"
  3. Select a primary category (e.g. cs.LG, cs.AI, stat.ML)
  4. Upload main.tex as the main file
  5. Upload references.bib and figures/ directory
  6. arXiv will auto-compile — check the preview
  7. Fill in metadata (title, abstract, authors)
  8. Submit!

LOCAL COMPILATION (requires TeX Live)
  pdflatex main.tex
  bibtex main
  pdflatex main.tex
  pdflatex main.tex

DOCKER COMPILATION (no TeX Live installed)
  docker run --rm -v "$(pwd):/data" texlive/texlive \\
    sh -c "cd /data && pdflatex main.tex && bibtex main && pdflatex main.tex"

CHECKLIST
  [ ] Abstract under 1,920 characters
  [ ] Figures are PDF, PNG, or EPS (not JPG)
  [ ] All \\cite{} keys in references.bib
  [ ] \\documentclass set correctly
  [ ] Run Compliance Checker in Veil before exporting
`)
      const blob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a"); a.href = url; a.download = `${slug}-arxiv-${dateStr}.zip`; a.click()
      URL.revokeObjectURL(url); showToast("ZIP exported!")
    } catch { showToast("Export failed — please try again") }
    finally { setExporting(false) }
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const complianceResults = runCompliance(latex, bib, figs, compiled)
  const failCount  = complianceResults.filter(c => c.status === "fail").length
  const warnCount  = complianceResults.filter(c => c.status === "warn").length
  const passCount  = complianceResults.filter(c => c.status === "pass").length

  const statusIcon = (s: CompItem["status"]) =>
    s === "pass" ? <Check size={14} color="#10b981" /> :
    s === "warn" ? <AlertTriangle size={14} color="#f59e0b" /> :
    <AlertCircle size={14} color="#ef4444" />

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#050508", position: "relative" }}>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="wm-toolbar" style={{ flexShrink: 0, padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "6px", background: "rgba(8,8,16,0.9)", overflowX: "auto" }}>

        {/* Generate Paper */}
        <button onClick={() => setShowGenModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "9px", border: "none", background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
          <Sparkles size={13} /> Generate Paper
        </button>

        {/* Templates */}
        <button onClick={() => setShowTemplateModal(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#ededff", fontSize: "13px", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
          <PenLine size={13} /> Templates <ChevronDown size={11} />
        </button>

        {/* References */}
        <button onClick={() => setPanel(panel === "refs" ? null : "refs")} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "9px", border: `1px solid ${panel === "refs" ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.1)"}`, background: panel === "refs" ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.05)", color: panel === "refs" ? "#a78bfa" : "#ededff", fontSize: "13px", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
          <BookMarked size={13} /> References {refs.length > 0 && <span style={{ fontSize: "10px", background: "rgba(139,92,246,0.3)", padding: "1px 6px", borderRadius: "100px" }}>{refs.length}</span>}
        </button>

        {/* Figures */}
        <button onClick={() => setPanel(panel === "figs" ? null : "figs")} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "9px", border: `1px solid ${panel === "figs" ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.1)"}`, background: panel === "figs" ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.05)", color: panel === "figs" ? "#10b981" : "#ededff", fontSize: "13px", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
          <ImageIcon size={13} /> Figures {figs.length > 0 && <span style={{ fontSize: "10px", background: "rgba(16,185,129,0.25)", padding: "1px 6px", borderRadius: "100px", color: "#10b981" }}>{figs.length}</span>}
        </button>

        {/* Compliance check */}
        <button onClick={() => setPanel(panel === "compliance" ? null : "compliance")} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "9px", border: `1px solid ${failCount > 0 ? "rgba(239,68,68,0.4)" : warnCount > 0 ? "rgba(245,158,11,0.4)" : "rgba(16,185,129,0.4)"}`, background: failCount > 0 ? "rgba(239,68,68,0.08)" : warnCount > 0 ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)", color: failCount > 0 ? "#ef4444" : warnCount > 0 ? "#f59e0b" : "#10b981", fontSize: "13px", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
          <CheckSquare size={13} /> Check {failCount > 0 ? `(${failCount} fail)` : warnCount > 0 ? `(${warnCount} warn)` : `(${passCount}✓)`}
        </button>

        {/* Export dropdown */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button onClick={() => setShowExportMenu(v => !v)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#ededff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            <Download size={13} /> Export <ChevronDown size={11} />
          </button>
          {showExportMenu && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setShowExportMenu(false)} />
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50, background: "#0f0f1c", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", padding: "6px", minWidth: "200px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
                <button onClick={() => { exportZip(); setShowExportMenu(false) }} disabled={exporting} style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "9px 12px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", color: "#ededff", fontSize: "13px" }}>
                  <FileArchive size={14} color="#8b5cf6" /> {exporting ? "Generating…" : "Export for arXiv (.zip)"}
                </button>
                <button onClick={() => { setPanel("submit"); setShowExportMenu(false) }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "9px 12px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", color: "#ededff", fontSize: "13px" }}>
                  <Globe size={14} color="#3b82f6" /> Submit to arXiv…
                </button>
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 6px" }} />
                <button onClick={() => { const b = new Blob([latex], { type: "text/plain" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "main.tex"; a.click(); URL.revokeObjectURL(u); setShowExportMenu(false) }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "9px 12px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", color: "#ededff", fontSize: "13px" }}>
                  <Download size={14} color="#7878a8" /> Download main.tex
                </button>
                <button onClick={() => { if (!bib) { showToast("No bibliography yet"); return } const b = new Blob([bib], { type: "text/plain" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "references.bib"; a.click(); URL.revokeObjectURL(u); setShowExportMenu(false) }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "9px 12px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", color: "#ededff", fontSize: "13px" }}>
                  <Download size={14} color="#7878a8" /> Download references.bib
                </button>
              </div>
            </>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Citation style */}
        <select value={citStyle} onChange={e => setCitStyle(e.target.value as CitStyle)} style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#7878a8", fontSize: "12px", cursor: "pointer" }}>
          {(["plain", "ieee", "acm", "neurips", "apa"] as CitStyle[]).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>

        {/* Layout toggle */}
        <div style={{ display: "flex", gap: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "2px" }}>
          {(["editor", "split", "preview"] as Layout[]).map(l => (
            <button key={l} onClick={() => setLayout(l)} title={l} style={{ padding: "5px 10px", borderRadius: "6px", border: "none", background: layout === l ? "rgba(139,92,246,0.3)" : "transparent", color: layout === l ? "#a78bfa" : "#4a4a6a", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
              {l === "editor" ? <></> : null}
              {l === "editor" ? "Editor" : l === "split" ? <Columns size={13} /> : "Preview"}
            </button>
          ))}
        </div>

        {/* Compile indicator */}
        {compiling && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11.5px", color: "#8b5cf6" }}>
            <div className="wm-spin" style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(139,92,246,0.3)", borderTop: "2px solid #8b5cf6" }} />
            Compiling…
          </div>
        )}
      </div>

      {/* ── Main work area ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* Editor column */}
        {(layout === "editor" || layout === "split") && (
          <div style={{ flex: layout === "split" ? "0 0 50%" : 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: layout === "split" ? "1px solid rgba(255,255,255,0.08)" : "none", minWidth: 0 }}>
            <MonacoEditor
              defaultLanguage="latex"
              value={latex}
              onChange={v => setLatex(v ?? "")}
              theme="vs-dark"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              beforeMount={(monaco: any) => {
                if (!monaco.languages.getLanguages().find((l: { id: string }) => l.id === "latex")) {
                  monaco.languages.register({ id: "latex" })
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  monaco.languages.setMonarchTokensProvider("latex", LATEX_TOKENS as any)
                  monaco.languages.registerCompletionItemProvider("latex", {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    provideCompletionItems: (model: any, position: any) => {
                      const word = model.getWordUntilPosition(position)
                      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn }
                      const suggestions = [
                        "section", "subsection", "subsubsection", "paragraph",
                        "begin{equation}", "begin{align}", "begin{figure}", "begin{table}", "begin{itemize}", "begin{enumerate}", "begin{abstract}",
                        "textbf", "textit", "emph", "cite", "ref", "label", "includegraphics", "caption",
                        "documentclass", "usepackage", "title", "author", "maketitle", "bibliography",
                      ].map(s => ({
                        label: `\\${s}`, kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: `\\${s}`, range,
                      }))
                      return { suggestions }
                    },
                  })
                }
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onMount={(editor: any, monaco: any) => { editorRef.current = editor; monacoRef.current = monaco }}
              options={{
                fontSize: 13,
                fontFamily: '"JetBrains Mono","Fira Code",Menlo,monospace',
                wordWrap: "on", minimap: { enabled: false },
                lineNumbers: "on", scrollBeyondLastLine: false,
                automaticLayout: true, quickSuggestions: { other: true, comments: false, strings: false },
                suggestOnTriggerCharacters: true, padding: { top: 16 },
              }}
              height="100%"
            />
          </div>
        )}

        {/* Preview column */}
        {(layout === "preview" || layout === "split") && (
          <div style={{ flex: layout === "split" ? "0 0 50%" : 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#fff", minWidth: 0, position: "relative" }}>
            {/* Preview header */}
            <div style={{ flexShrink: 0, padding: "6px 14px", background: "#f5f5f5", borderBottom: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#666", letterSpacing: "0.06em" }}>
                {pdfUrl ? "PDF PREVIEW" : "STRUCTURAL PREVIEW"}
              </span>
              {!pdfUrl && (
                <span style={{ fontSize: "10.5px", color: "#999", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Info size={11} /> Set LATEX_SERVICE_URL for live PDF
                </span>
              )}
            </div>
            {pdfUrl ? (
              <iframe src={pdfUrl} style={{ flex: 1, border: "none" }} title="PDF Preview" />
            ) : (
              <iframe
                srcDoc={previewHtml}
                style={{ flex: 1, border: "none" }}
                title="Structural Preview"
                sandbox="allow-same-origin"
              />
            )}
          </div>
        )}

        {/* ── Side panel ──────────────────────────────────────────────────── */}
        {panel && (
          <div style={{ width: 340, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.08)", background: "rgba(8,8,16,0.98)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Panel header */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#ededff" }}>
                {panel === "refs" ? "References" : panel === "figs" ? "Figures" : panel === "compliance" ? "Compliance Checker" : "Submit to arXiv"}
              </span>
              <button onClick={() => setPanel(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a4a6a" }}><X size={15} /></button>
            </div>

            {/* ── References panel ─────────────────────────────────────── */}
            {panel === "refs" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Search bar */}
                <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                  <div style={{ fontSize: "11px", color: "#7878a8", marginBottom: "8px" }}>Search by title, arXiv ID (1706.03762), or DOI</div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input value={bibSearch} onChange={e => setBibSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && searchBibtex()}
                      placeholder="e.g. attention is all you need"
                      style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#ededff", fontSize: "12.5px", outline: "none" }} />
                    <button onClick={searchBibtex} disabled={bibSearching || !bibSearch.trim()} style={{ padding: "8px 12px", borderRadius: "8px", border: "none", background: bibSearch.trim() && !bibSearching ? "#8b5cf6" : "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
                      {bibSearching ? <div className="wm-spin" style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff" }} /> : <Search size={13} />}
                    </button>
                  </div>
                  {/* Citation style selector */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#4a4a6a" }}>Style:</span>
                    {(["plain", "ieee", "acm", "neurips", "apa"] as CitStyle[]).map(s => (
                      <button key={s} onClick={() => setCitStyle(s)} style={{ padding: "2px 8px", borderRadius: "6px", border: "none", background: citStyle === s ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.05)", color: citStyle === s ? "#a78bfa" : "#7878a8", fontSize: "10.5px", fontWeight: 600, cursor: "pointer" }}>{s.toUpperCase()}</button>
                    ))}
                  </div>
                </div>

                {/* Reference list */}
                <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {refs.length === 0 && (
                    <div style={{ textAlign: "center", paddingTop: "40px", color: "#4a4a6a", fontSize: "13px" }}>
                      <BookMarked size={28} color="#4a4a6a" style={{ margin: "0 auto 12px", display: "block" }} />
                      Search above to add references
                    </div>
                  )}
                  {refs.map(ref => (
                    <div key={ref.id} style={{ padding: "10px 12px", borderRadius: "10px", background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#ededff", marginBottom: "4px", lineHeight: 1.4 }}>{ref.title}</div>
                      <div style={{ fontSize: "11px", color: "#7878a8", marginBottom: "6px" }}>{ref.authors} · {ref.year} · <span style={{ color: "#4a4a6a" }}>{ref.source}</span></div>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button onClick={() => insertCitation(ref.key)} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "6px", border: "none", background: "rgba(139,92,246,0.15)", color: "#a78bfa", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                          <Plus size={10} /> \\cite{`{${ref.key}}`}
                        </button>
                        {ref.url && (
                          <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", color: "#7878a8", fontSize: "11px", textDecoration: "none" }}>
                            <ExternalLink size={10} />
                          </a>
                        )}
                        <button onClick={() => removeRef(ref.id)} style={{ marginLeft: "auto", display: "flex", alignItems: "center", padding: "3px 6px", borderRadius: "6px", border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer" }}>
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* .bib preview */}
                {bib && (
                  <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#4a4a6a" }}>REFERENCES.BIB</span>
                      <button onClick={() => navigator.clipboard.writeText(bib).then(() => showToast("Copied!"))} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: "#7878a8", fontSize: "11px" }}><Copy size={11} /> Copy</button>
                    </div>
                    <div style={{ maxHeight: "100px", overflowY: "auto", background: "rgba(0,0,0,0.4)", borderRadius: "6px", padding: "8px", fontSize: "10.5px", color: "#7878a8", fontFamily: "monospace", lineHeight: 1.5 }}>
                      {bib.slice(0, 400)}{bib.length > 400 ? "…" : ""}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Figures panel ─────────────────────────────────────────── */}
            {panel === "figs" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                  <button onClick={() => figInputRef.current?.click()} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px", borderRadius: "10px", border: "1px dashed rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)", color: "#7878a8", fontSize: "13px", cursor: "pointer" }}>
                    <Upload size={14} /> Upload figure (PDF/PNG/EPS)
                  </button>
                  <input ref={figInputRef} type="file" accept=".pdf,.png,.eps,.jpg,.jpeg,.svg" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFigUpload(f); e.target.value = "" }} />
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {figs.length === 0 && (
                    <div style={{ textAlign: "center", paddingTop: "40px", color: "#4a4a6a", fontSize: "13px" }}>
                      <ImageIcon size={28} color="#4a4a6a" style={{ margin: "0 auto 12px", display: "block" }} />
                      Upload figures to embed in your paper
                    </div>
                  )}
                  {figs.map((fig, idx) => (
                    <div key={fig.id} style={{ padding: "10px 12px", borderRadius: "10px", background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        {fig.format === "pdf" ? (
                          <div style={{ width: 36, height: 36, borderRadius: "6px", background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#8b5cf6", fontWeight: 700 }}>PDF</div>
                        ) : (
                          <img src={fig.dataUrl} alt={fig.name} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: "6px", background: "#222" }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#ededff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fig.name}</div>
                          <div style={{ fontSize: "10.5px", color: fig.format === "jpg" || fig.format === "jpeg" ? "#f59e0b" : "#4a4a6a" }}>
                            {fig.format.toUpperCase()} {(fig.format === "jpg" || fig.format === "jpeg") ? "⚠ JPG — convert to PNG for arXiv" : "· Fig " + (idx + 1)}
                          </div>
                        </div>
                        <button onClick={() => setFigs(prev => prev.filter(f => f.id !== fig.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a4a6a" }}><Trash2 size={12} /></button>
                      </div>
                      <input value={fig.caption} onChange={e => setFigs(prev => prev.map(f => f.id === fig.id ? { ...f, caption: e.target.value } : f))}
                        placeholder="Caption for this figure…"
                        style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#ededff", fontSize: "11.5px", outline: "none", boxSizing: "border-box", marginBottom: "6px" }} />
                      <button onClick={() => insertFigure(fig)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "6px", borderRadius: "7px", border: "none", background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                        <Plus size={12} /> Insert into editor
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Compliance panel ──────────────────────────────────────── */}
            {panel === "compliance" && (
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                  {[["pass", "#10b981", passCount + " passed"], ["warn", "#f59e0b", warnCount + " warning" + (warnCount !== 1 ? "s" : "")], ["fail", "#ef4444", failCount + " failed"]].map(([s, c, l]) => (
                    <div key={s} style={{ padding: "5px 12px", borderRadius: "100px", background: `${c}12`, border: `1px solid ${c}30`, fontSize: "12px", fontWeight: 600, color: c }}>{l}</div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {complianceResults.map(item => (
                    <div key={item.id} style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(15,15,28,0.8)", border: `1px solid ${item.status === "fail" ? "rgba(239,68,68,0.2)" : item.status === "warn" ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.15)"}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        {statusIcon(item.status)}
                        <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#ededff" }}>{item.label}</span>
                      </div>
                      <div style={{ fontSize: "11.5px", color: item.status === "fail" ? "#f87171" : item.status === "warn" ? "#fbbf24" : "#6ee7b7", paddingLeft: "22px" }}>{item.message}</div>
                    </div>
                  ))}
                </div>
                {failCount === 0 && (
                  <div style={{ marginTop: "16px", padding: "12px 16px", borderRadius: "10px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", textAlign: "center" }}>
                    <Check size={16} color="#10b981" style={{ margin: "0 auto 6px", display: "block" }} />
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#10b981" }}>Ready to export!</div>
                    <div style={{ fontSize: "11.5px", color: "#7878a8", marginTop: "4px" }}>No blocking issues found</div>
                  </div>
                )}
                <button onClick={exportZip} disabled={failCount > 0 || exporting} style={{ width: "100%", marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "11px", borderRadius: "10px", border: "none", background: failCount > 0 ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#8b5cf6,#3b82f6)", color: failCount > 0 ? "#4a4a6a" : "#fff", fontSize: "13px", fontWeight: 700, cursor: failCount > 0 ? "not-allowed" : "pointer" }}>
                  <FileArchive size={14} /> {exporting ? "Generating…" : failCount > 0 ? "Fix errors before export" : "Export for arXiv"}
                </button>
              </div>
            )}

            {/* ── arXiv submit panel ────────────────────────────────────── */}
            {panel === "submit" && (
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px" }}>
                <div style={{ marginBottom: "16px", padding: "12px 14px", borderRadius: "10px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#60a5fa", marginBottom: "4px" }}>arXiv Submission Metadata</div>
                  <div style={{ fontSize: "11.5px", color: "#7878a8", lineHeight: 1.6 }}>The fields below are pre-filled from your paper. Export the ZIP, then upload at arxiv.org.</div>
                </div>

                {[
                  { label: "Title", value: latex.match(/\\title\{([^}]+)\}/)?.[1] ?? "Your Paper Title" },
                  { label: "Authors", value: latex.match(/\\author\{([\s\S]+?)(?=\n\\(?:date|begin|maketitle)|\n\n)/)?.[1]?.replace(/\\\\/g, ", ").replace(/\\texttt\{([^}]+)\}/g, "$1").replace(/\\[a-zA-Z]+/g, "").replace(/\s+/g, " ").trim() ?? "Author Names" },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: "12px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#7878a8", display: "block", marginBottom: "4px" }}>{f.label.toUpperCase()}</label>
                    <div style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "12.5px", color: "#ededff" }}>{f.value}</div>
                  </div>
                ))}

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#7878a8", display: "block", marginBottom: "4px" }}>ABSTRACT</label>
                  <div style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "12px", color: "#9898b8", lineHeight: 1.6, maxHeight: "100px", overflowY: "auto" }}>
                    {latex.match(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/)?.[1]?.trim().slice(0, 300) ?? "No abstract found — add \\begin{abstract}…\\end{abstract}"}
                    {(latex.match(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/)?.[1]?.trim().length ?? 0) > 300 ? "…" : ""}
                  </div>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#7878a8", display: "block", marginBottom: "6px" }}>PRIMARY CATEGORY</label>
                  <select style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#ededff", fontSize: "12.5px" }}>
                    {["cs.AI", "cs.LG", "cs.CV", "cs.CL", "cs.NE", "stat.ML", "q-bio.QM", "physics.med-ph", "math.ST", "eess.SP"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#7878a8", display: "block", marginBottom: "6px" }}>LICENSE</label>
                  <select style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#ededff", fontSize: "12.5px" }}>
                    <option value="cc-by-4.0">CC BY 4.0 (Recommended)</option>
                    <option value="cc-by-sa-4.0">CC BY-SA 4.0</option>
                    <option value="cc-by-nc-nd-4.0">CC BY-NC-ND 4.0</option>
                    <option value="arxiv">arXiv.org perpetual license</option>
                  </select>
                </div>

                <button onClick={exportZip} disabled={exporting} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "11px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", marginBottom: "10px" }}>
                  <Archive size={14} /> {exporting ? "Generating…" : "Download Submission Package"}
                </button>

                <a href="https://arxiv.org/submit" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px", borderRadius: "10px", border: "1px solid rgba(59,130,246,0.35)", color: "#60a5fa", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
                  <Send size={13} /> Open arXiv Submit Page <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Error panel ───────────────────────────────────────────────────── */}
      {errors.length > 0 && (
        <div style={{ flexShrink: 0, background: "rgba(239,68,68,0.06)", borderTop: "1px solid rgba(239,68,68,0.2)", maxHeight: showErrors ? "160px" : "36px", overflow: "hidden", transition: "max-height 0.2s" }}>
          <button onClick={() => setShowErrors(v => !v)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
            <AlertCircle size={13} color="#ef4444" />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444" }}>{errors.length} LaTeX error{errors.length > 1 ? "s" : ""}</span>
            <ChevronDown size={11} color="#ef4444" style={{ transform: showErrors ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          {showErrors && (
            <div style={{ padding: "0 16px 10px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto", maxHeight: "120px" }}>
              {errors.map((e, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", fontSize: "11.5px", color: "#fca5a5" }}>
                  {e.line && <span style={{ color: "#7878a8", flexShrink: 0 }}>Line {e.line}:</span>}
                  <span>{e.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Paper Generator Modal ─────────────────────────────────────────── */}
      {showGenModal && (
        <div style={{ position: "absolute", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowGenModal(false) }}>
          <div style={{ background: "#0f0f1c", borderRadius: "20px", border: "1px solid rgba(139,92,246,0.3)", padding: "28px", maxWidth: "540px", width: "100%", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={() => setShowGenModal(false)} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "#7878a8" }}><X size={16} /></button>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Sparkles size={20} color="#8b5cf6" />
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#ededff", margin: 0 }}>Generate Paper</h2>
            </div>

            {[
              { label: "Paper Title *", key: "title", placeholder: "e.g. Efficient Attention Mechanisms for Long-Context Language Models" },
              { label: "Research Topic / Abstract Idea *", key: "topic", placeholder: "e.g. We propose a novel sparse attention mechanism that reduces quadratic complexity…" },
              { label: "Methodology Used", key: "methodology", placeholder: "e.g. Transformer architecture with linear attention and sliding window…" },
              { label: "Key Results / Findings", key: "results", placeholder: "e.g. 3× speedup over full attention on sequences > 8k tokens with <1% quality loss…" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#7878a8", display: "block", marginBottom: "5px" }}>{f.label}</label>
                <textarea value={genForm[f.key as keyof PaperForm]} onChange={e => setGenForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} rows={2}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#ededff", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            ))}

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#7878a8", display: "block", marginBottom: "5px" }}>Target Venue</label>
              <select value={genForm.venue} onChange={e => setGenForm(prev => ({ ...prev, venue: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#ededff", fontSize: "13px", outline: "none" }}>
                {["arXiv General", "NeurIPS", "ICML", "ICLR", "IEEE Transactions", "ACM"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowGenModal(false)} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#7878a8", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={generatePaper} disabled={generating || !genForm.title.trim() || !genForm.topic.trim()} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px", borderRadius: "10px", border: "none", background: generating || !genForm.title.trim() || !genForm.topic.trim() ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#8b5cf6,#3b82f6)", color: generating || !genForm.title.trim() || !genForm.topic.trim() ? "#4a4a6a" : "#fff", fontSize: "13px", fontWeight: 700, cursor: generating || !genForm.title.trim() || !genForm.topic.trim() ? "not-allowed" : "pointer" }}>
                {generating ? <><div className="wm-spin" style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff" }} /> Generating paper…</> : <><Sparkles size={14} /> Generate Full Paper</>}
              </button>
            </div>
            <div style={{ marginTop: "12px", fontSize: "11px", color: "#4a4a6a", textAlign: "center" }}>Uses GPT-4o with web search to cite real papers</div>
          </div>
        </div>
      )}

      {/* ── Template Selector Modal ────────────────────────────────────────── */}
      {showTemplateModal && (
        <div style={{ position: "absolute", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowTemplateModal(false) }}>
          <div style={{ background: "#0f0f1c", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", padding: "28px", maxWidth: "600px", width: "100%", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={() => setShowTemplateModal(false)} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "#7878a8" }}><X size={16} /></button>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <PenLine size={18} color="#8b5cf6" />
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#ededff", margin: 0 }}>Journal Templates</h2>
            </div>
            <p style={{ fontSize: "13px", color: "#7878a8", marginBottom: "20px" }}>Switching templates preserves your title and author. Content is reformatted for the selected venue.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {(Object.keys(TEMPLATES) as TemplateId[]).map(id => {
                const t = TEMPLATES[id]
                const isActive = activeTemplate === id
                return (
                  <button key={id} onClick={() => applyTemplate(id)} style={{ padding: "16px", borderRadius: "12px", border: `2px solid ${isActive ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.07)"}`, background: isActive ? "rgba(139,92,246,0.08)" : "rgba(15,15,28,0.8)", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "22px" }}>{t.thumb}</span>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: isActive ? "#a78bfa" : "#ededff" }}>{t.name}</div>
                        {isActive && <span style={{ fontSize: "10px", color: "#8b5cf6", fontWeight: 700 }}>ACTIVE</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#7878a8" }}>{t.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", zIndex: 200, padding: "10px 20px", borderRadius: "10px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#ededff", whiteSpace: "nowrap", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
          <Check size={14} color="#10b981" /> {toast}
        </div>
      )}

      <style>{`
        @keyframes wm-spin { to { transform: rotate(360deg); } }
        .wm-spin { animation: wm-spin 0.9s linear infinite; }
        .wm-toolbar { scrollbar-width: none; }
        .wm-toolbar::-webkit-scrollbar { display: none; }
        @media (max-width: 767px) {
          .wm-toolbar { gap: 4px !important; padding: 6px 10px !important; }
        }
      `}</style>
    </div>
  )
}
