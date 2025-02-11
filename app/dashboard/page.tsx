"use client"

import { useEffect, useRef, useState, lazy, Suspense } from "react"
import { detectDomain, buildVisualPrompt, parseVisual } from "@/app/components/VisualPanel"
import type { AnyViz } from "@/app/components/VisualPanel"
const VisualPanel = lazy(() => import("@/app/components/VisualPanel"))
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import {
  BookOpen, Dna, RefreshCw, PenLine, Sparkles, Zap,
  Terminal, BarChart3, GitBranch, Database, Activity,
  Server, Settings, Bell, User, Plus, Play,
  Send, Bot, Check, Crown, Lock, LogOut,
  ChevronRight, AlertCircle, X, Save, Eye, EyeOff,
  Cpu, Globe, Layers, TrendingUp, Clock, TerminalSquare, Copy, Clipboard, Search,
  BookMarked, Lightbulb, Star, Keyboard, ExternalLink, Link2, HelpCircle, Sliders, FileText,
  Paperclip, Share2, Trash2, MessageSquare,
  Mic, MicOff, Download, RotateCcw,
} from "lucide-react"

// ─── Supabase client (browser) ───────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Types ────────────────────────────────────────────────────────────────────
type View = "sessions" | "workflows" | "integrations" | "compute" | "evaluations" | "papers" | "notebook" | "hypothesis" | "terminal" | "settings" | "notifications" | "profile" | "api-access" | "visuals"
type Msg  = { role: "user" | "assistant"; content: string }

// ─── Constants ────────────────────────────────────────────────────────────────
const MODES = [
  { id: "research", label: "Research", icon: BookOpen, color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.3)" },
  { id: "biology",  label: "Biology",  icon: Dna,      color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.3)" },
  { id: "flywheel", label: "Flywheel", icon: RefreshCw, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.3)" },
  { id: "write",    label: "Write",    icon: PenLine,   color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.3)" },
]

const MODELS = [
  { id: "gpt-4o",      name: "GPT-4o",      provider: "OpenAI",   color: "#10a37f", icon: Sparkles, desc: "Best overall" },
  { id: "gpt-4o-mini", name: "GPT-4o mini", provider: "OpenAI",   color: "#10a37f", icon: Zap,      desc: "Fast & efficient" },
  { id: "llama-3-70b", name: "Llama 3 70B", provider: "NVIDIA",   color: "#3b82f6", icon: BookOpen, desc: "Open-source" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", color: "#8b5cf6", icon: Dna,      desc: "Deep reasoning" },
]

const WORKFLOWS = [
  // ── Research ────────────────────────────────────────────────────────────────
  { cat: "Research", name: "Literature Synthesis Pipeline",   color: "#3b82f6", desc: "Condense papers into a structured survey",           prompt: "I need to synthesize the key findings, methodologies, and gaps from recent literature on [topic]. Please structure the output as: (1) a brief introduction, (2) thematic sections grouping related findings, and (3) open questions worth investigating. Let's start — ask me for the topic and any constraints." },
  { cat: "Research", name: "Research Hypothesis Builder",     color: "#3b82f6", desc: "AI-guided research question formulation",             prompt: "Help me formulate a rigorous, testable research hypothesis. Ask me about: the domain, the gap I've observed, the variables I want to study, and the population or system. Then propose 2–3 candidate hypotheses with justification." },
  { cat: "Research", name: "Systematic Review Assistant",     color: "#3b82f6", desc: "PRISMA-guided systematic review workflow",            prompt: "Guide me through a systematic review following PRISMA guidelines. Start by asking me for the PICO question, then help me define inclusion/exclusion criteria, a search string, data extraction template, and synthesis approach." },
  { cat: "Research", name: "Grant Proposal Writer",           color: "#3b82f6", desc: "Significance, innovation, approach sections",         prompt: "Help me write a compelling grant proposal. I'll need sections for: Specific Aims, Significance, Innovation, Approach, and Expected Outcomes. Start by asking me the project topic, target funding agency, and budget range." },
  { cat: "Research", name: "Research Gap Identifier",         color: "#3b82f6", desc: "Find contradictions and underexplored areas",         prompt: "Analyze the current state of research on [topic] and identify the most significant gaps, contradictions, and underexplored areas. Ask me for the topic and what I've already reviewed, then map the landscape." },
  { cat: "Research", name: "Meta-Analysis Pipeline",          color: "#3b82f6", desc: "Effect sizes, heterogeneity, forest plots",           prompt: "Guide me through a meta-analysis. Ask me for the research question and studies I've identified, then walk me through: effect size calculation, heterogeneity (I² and Q tests), forest plot interpretation, funnel plot for bias, and PRISMA-MA reporting." },
  { cat: "Research", name: "Experimental Design Advisor",     color: "#3b82f6", desc: "Variables, controls, statistical power",              prompt: "Help me design a rigorous experiment. Ask me for: the hypothesis, independent and dependent variables, population/sample, available resources, and any constraints. Then recommend a design with controls, randomisation strategy, and sample size calculation." },
  { cat: "Research", name: "Peer Review Simulator",           color: "#3b82f6", desc: "Structured feedback on manuscript sections",          prompt: "Simulate a rigorous peer review of my manuscript. Ask me to paste a section (abstract, methods, results, or discussion), then evaluate: clarity, methodological rigour, novelty, statistical validity, and provide prioritised, actionable feedback." },
  { cat: "Research", name: "Replication Study Planner",       color: "#3b82f6", desc: "Plan faithful replications of existing studies",      prompt: "Help me plan a replication study. Ask me for the original paper details, then identify: critical parameters to match, acceptable deviations, required sample size for adequate power, and how to report differences per replication guidelines." },
  { cat: "Research", name: "Citation Network Mapper",         color: "#3b82f6", desc: "Trace intellectual lineage of a research area",       prompt: "Map the citation network and intellectual lineage of a research area. Ask me for the topic and a few seed papers, then identify: seminal works, key authors, how ideas evolved, and which threads are currently most active." },

  // ── Biology ─────────────────────────────────────────────────────────────────
  { cat: "Biology",  name: "Protein Structure Analysis",      color: "#10b981", desc: "Domains, active sites, structural features",          prompt: "Analyze protein structure and function. Ask me for a protein name or sequence, then cover: predicted domains, active/binding sites, structural features, known disease associations, and suggestions for AlphaFold or homology modelling." },
  { cat: "Biology",  name: "Genomics Analysis Pipeline",      color: "#10b981", desc: "Variant calling and pathway mapping",                 prompt: "Guide me through a genomics analysis pipeline. Ask me what type of data I have (WGS, WES, RNA-seq, etc.), then walk through: QC, alignment, variant calling or expression quantification, annotation, and biological interpretation." },
  { cat: "Biology",  name: "CRISPR Guide RNA Designer",       color: "#10b981", desc: "On-target efficiency and off-target risk",            prompt: "Help me design optimal CRISPR guide RNAs. Ask me for the target gene and organism, then evaluate: PAM site availability, on-target efficiency scores, predicted off-target sites, and recommend top candidates with delivery considerations." },
  { cat: "Biology",  name: "Drug-Target Interaction Predictor", color: "#10b981", desc: "Binding affinity and mechanism of action",         prompt: "Predict drug-target interactions. Ask me for the drug/compound and target protein, then analyse: binding affinity predictions, mechanism of action, known off-target liabilities, and suggest structural modifications to improve selectivity." },
  { cat: "Biology",  name: "Gene Expression Analysis",        color: "#10b981", desc: "Differential expression between conditions",          prompt: "Guide me through differential gene expression analysis. Ask me for the conditions being compared and the organism, then cover: normalisation, DESeq2/edgeR approach, volcano plot interpretation, and downstream pathway analysis." },
  { cat: "Biology",  name: "Pathway Enrichment Analysis",     color: "#10b981", desc: "KEGG, GO, and Reactome pathway mapping",             prompt: "Perform pathway enrichment analysis on my gene set. Ask me to provide the gene list and background, then map to KEGG, Gene Ontology, and Reactome — interpret the most significant terms and visualise with a dot plot description." },
  { cat: "Biology",  name: "Molecular Docking Prep",          color: "#10b981", desc: "Protein prep, active site, docking parameters",      prompt: "Help me set up a molecular docking study. Ask me for the target receptor and ligand(s), then guide: protein preparation (missing residues, protonation), active site identification, grid box setup, docking software config, and result scoring." },
  { cat: "Biology",  name: "Phylogenetic Tree Builder",        color: "#10b981", desc: "Alignment, tree methods, bootstrap analysis",        prompt: "Guide me through building and interpreting a phylogenetic tree. Ask me for the sequences or organisms, then recommend: alignment method (MUSCLE/MAFFT), substitution model, tree construction (NJ/ML/Bayesian), and how to interpret bootstrap support." },
  { cat: "Biology",  name: "Biomarker Discovery Pipeline",    color: "#10b981", desc: "Feature selection and clinical validation",           prompt: "Help me identify potential biomarkers. Ask me for the disease/condition and data type (proteomics, metabolomics, genomics, etc.), then guide: feature selection, statistical validation, ROC analysis, and pathway plausibility for top candidates." },
  { cat: "Biology",  name: "Sequence Alignment & Annotation", color: "#10b981", desc: "Conserved regions, domains, evolutionary context",   prompt: "Align and annotate biological sequences. Ask me to provide the sequences and context, then identify: conserved regions, functional domains (via Pfam/InterPro logic), signal peptides, and evolutionary relationships across provided sequences." },

  // ── Flywheel ─────────────────────────────────────────────────────────────────
  { cat: "Flywheel", name: "Custom Data SFT Fine-Tuning",     color: "#f59e0b", desc: "Fine-tune on specialised domain datasets",            prompt: "Guide me through supervised fine-tuning on a custom dataset. Ask me about: base model, dataset description, task type, compute available (GPU/VRAM), and desired behaviour. Then recommend: data formatting (JSONL), training config, eval metrics, and deployment strategy." },
  { cat: "Flywheel", name: "Benchmark Harness Configuration", color: "#f59e0b", desc: "Automated benchmarks across checkpoints",             prompt: "Set up a benchmark harness for model evaluation. Ask me for: the model family, task type, and available test data. Then help define: metrics, test set splits, evaluation scripts, checkpoint comparison logic, and how to track regressions over time." },
  { cat: "Flywheel", name: "Dataset Curation Pipeline",       color: "#f59e0b", desc: "Collection, deduplication, quality filtering",        prompt: "Help me curate a high-quality training dataset. Ask me about the task, data sources available, target size, and quality requirements. Then guide: scraping/collection, deduplication (MinHash/exact), quality filters, and final JSONL formatting for fine-tuning." },
  { cat: "Flywheel", name: "LoRA Adapter Training",           color: "#f59e0b", desc: "Rank, alpha, target modules for efficient fine-tuning", prompt: "Set up LoRA adapter training. Ask me for: base model, task, dataset size, and compute budget. Then recommend: rank (r) and alpha, target modules (q_proj/v_proj etc.), learning rate, batch size, and how to merge and export the adapter." },
  { cat: "Flywheel", name: "RLHF Reward Modelling",           color: "#f59e0b", desc: "Preference data, reward model, PPO integration",      prompt: "Guide me through building a reward model for RLHF. Ask me about the task and base model, then cover: preference data collection format, reward model architecture, Bradley-Terry training, calibration, and how to plug it into a PPO training loop." },
  { cat: "Flywheel", name: "Hyperparameter Optimization",     color: "#f59e0b", desc: "Bayesian search, results interpretation",             prompt: "Run hyperparameter optimisation for my model. Ask me for: the model type, objective metric, approximate compute budget, and parameters to tune. Then recommend search strategy (Bayesian/Optuna), search space bounds, and how to interpret and act on results." },
  { cat: "Flywheel", name: "Inference Optimization",          color: "#f59e0b", desc: "Quantization, KV-cache, batching, latency",           prompt: "Optimise inference for my model. Ask me for: model architecture, target hardware, latency/throughput requirements, and acceptable quality tradeoffs. Then guide: FP16/INT8/GPTQ quantisation, KV-cache tuning, dynamic batching, and serving framework selection." },
  { cat: "Flywheel", name: "Model Distillation Pipeline",     color: "#f59e0b", desc: "Teacher-student training, knowledge transfer",        prompt: "Guide me through model distillation. Ask me about the teacher model, desired student size, task, and compute available. Then cover: dataset generation from teacher, KL-divergence loss setup, temperature scaling, evaluation against teacher, and deployment considerations." },

  // ── Write ────────────────────────────────────────────────────────────────────
  { cat: "Write",    name: "Paper Drafting",                  color: "#8b5cf6", desc: "Outline to LaTeX first draft",                        prompt: "Help me draft a research paper from outline to first draft. Ask me for: the topic, target journal/venue, key contributions, and any completed sections. Then build a detailed outline and expand it section by section in academic prose." },
  { cat: "Write",    name: "Citation Fact-Checker",           color: "#8b5cf6", desc: "Live fact-checking against literature",               prompt: "Fact-check my manuscript text against current literature. Ask me to paste a section, then: verify factual claims, flag statements that are unsupported or overclaimed, and suggest specific citations or corrections for each flagged item." },
  { cat: "Write",    name: "Abstract Writer",                 color: "#8b5cf6", desc: "Structured abstracts under 250 words",                prompt: "Write a structured abstract for my paper. Ask me for: the background, objective, methods, key results, and main conclusion. Then produce a polished abstract under 250 words following the structured format (Background / Objective / Methods / Results / Conclusion)." },
  { cat: "Write",    name: "Related Work Generator",          color: "#8b5cf6", desc: "Thematic grouping and differentiation narrative",     prompt: "Generate a comprehensive Related Work section. Ask me for: the paper topic, my key contributions, and any specific papers I know are relevant. Then group prior work thematically and articulate clearly how my work differs from or extends each cluster." },
  { cat: "Write",    name: "LaTeX Formatter",                 color: "#8b5cf6", desc: "Clean LaTeX with equations, tables, figures",         prompt: "Convert my content to clean, publication-ready LaTeX. Ask me to paste the text and describe any tables, figures, or equations. Then produce properly formatted LaTeX with appropriate environments, BibTeX entries, and document class suggestions for the target venue." },
  { cat: "Write",    name: "Journal Submission Formatter",    color: "#8b5cf6", desc: "Style, word limits, cover letter",                    prompt: "Format my manuscript for journal submission. Ask me for: the target journal, current manuscript state, and word/figure limits. Then guide: style adjustments, abstract restructuring, figure formatting, supplementary material, and draft a cover letter." },
  { cat: "Write",    name: "Thesis Outline Builder",          color: "#8b5cf6", desc: "Chapter structure and per-chapter methodology",       prompt: "Build a detailed thesis outline. Ask me for: the research topic, degree level (MSc/PhD), department, and any completed work. Then propose a full chapter structure with research questions, methodology, and expected outcomes for each chapter." },
  { cat: "Write",    name: "Rebuttal Letter Writer",          color: "#8b5cf6", desc: "Point-by-point reviewer response",                   prompt: "Help me write a professional rebuttal letter. Ask me to paste the reviewer comments, then for each point: acknowledge the concern, summarise the change made (or argue why no change is needed), and draft a polite, rigorous response in standard rebuttal format." },
]

const INTEGRATIONS_LIST = [
  { name: "GitHub",         icon: GitBranch, color: "#ededff", desc: "Repositories and version control",   key: "github" },
  { name: "Hugging Face",   icon: Sparkles,  color: "#f59e0b", desc: "Models, datasets, and Spaces",      key: "huggingface" },
  { name: "Weights & Biases", icon: Activity, color: "#f43f5e", desc: "Track experiments",               key: "wandb" },
  { name: "Modal",          icon: Server,    color: "#3b82f6", desc: "On-demand GPU compute",              key: "modal" },
  { name: "Pinecone",       icon: Database,  color: "#10b981", desc: "Vector search database",            key: "pinecone" },
  { name: "OpenAlex",       icon: Globe,     color: "#8b5cf6", desc: "Open academic knowledge graph",     key: "openalex" },
]

const MOCK_NOTIFS = [
  { id: 1, title: "Welcome to Veil Research", body: "Your workspace is ready. Start a session, explore workflows, or connect your integrations.", time: "Just now", read: false, icon: Sparkles, color: "#8b5cf6" },
  { id: 2, title: "New models available", body: "DeepSeek R1 and Llama 3 70B are now live in your Sessions workspace.", time: "2h ago", read: false, icon: Sparkles, color: "#10a37f" },
]

// ─── Markdown renderer ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code({ className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "")
          return match ? (
            <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div"
              customStyle={{ borderRadius: "8px", fontSize: "12px", margin: "6px 0", background: "rgba(0,0,0,0.4)" }}>
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code style={{ background: "rgba(255,255,255,0.12)", padding: "2px 5px", borderRadius: "4px", fontSize: "0.88em", fontFamily: "monospace" }} {...props}>
              {children}
            </code>
          )
        },
        p: ({ children }: any) => <p style={{ margin: "0 0 8px", lineHeight: 1.7 }}>{children}</p>,
        h1: ({ children }: any) => <h1 style={{ fontSize: "16px", fontWeight: 800, color: "#ededff", margin: "12px 0 6px" }}>{children}</h1>,
        h2: ({ children }: any) => <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#ededff", margin: "10px 0 5px" }}>{children}</h2>,
        h3: ({ children }: any) => <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#ededff", margin: "8px 0 4px" }}>{children}</h3>,
        ul: ({ children }: any) => <ul style={{ paddingLeft: "18px", margin: "6px 0" }}>{children}</ul>,
        ol: ({ children }: any) => <ol style={{ paddingLeft: "18px", margin: "6px 0" }}>{children}</ol>,
        li: ({ children }: any) => <li style={{ marginBottom: "3px" }}>{children}</li>,
        blockquote: ({ children }: any) => (
          <blockquote style={{ borderLeft: "3px solid #8b5cf6", paddingLeft: "10px", margin: "6px 0", color: "#7878a8", fontStyle: "italic" }}>{children}</blockquote>
        ),
        a: ({ href, children }: any) => (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#8b5cf6", textDecoration: "underline" }}>{children}</a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

type SessionMeta = { id: string; title: string; model: string; is_public: boolean; updated_at: string }

const MODE_PROMPTS: Record<string, string> = {
  research: "You are a research assistant specializing in academic literature synthesis, scientific reasoning, and hypothesis generation. Help with literature reviews, research design, methodology, and academic writing. Be precise, cite evidence where possible, and structure responses clearly.",
  biology:  "You are an expert in biology and life sciences — molecular biology, genomics, proteomics, bioinformatics, protein design, and biomedical research. Provide accurate, detailed scientific guidance on biological questions and experimental design.",
  flywheel: "You are an ML engineering expert specializing in model training, fine-tuning (SFT, RLHF, LoRA), evaluation, and deployment. Help with dataset curation, training configs, hyperparameter optimization, and production ML systems.",
  write:    "You are an academic writing assistant. Help with research paper structure, argumentation, LaTeX formatting, citation management, grant writing, manuscript revision, and producing publication-ready scientific prose.",
}

const SUGGESTION_CATS = ["For you", "Workflow", "Research", "Biology"] as const
type SuggCat = typeof SUGGESTION_CATS[number]

const ALL_SUGGESTIONS: Record<SuggCat, string[]> = {
  "For you": [
    "Synthesize the latest papers on transformer attention mechanisms",
    "Design an experiment to test CRISPR efficiency in mammalian cells",
    "Write a grant proposal outline for a protein folding study",
    "What are the key differences between RNA-seq and scRNA-seq?",
    "Build a research hypothesis for studying neuroplasticity in aging",
    "Explain AlphaFold and its impact on drug discovery",
    "Help me plan a systematic review on antibiotic resistance",
    "Summarize recent breakthroughs in quantum error correction",
    "Create a literature review on mRNA vaccine platforms",
    "Draft an abstract for a paper on LLMs in clinical decision support",
  ],
  "Workflow": [
    "Guide me through supervised fine-tuning on my custom dataset",
    "Set up a benchmark harness for evaluating model checkpoints",
    "Help me design a LoRA adapter training configuration",
    "Build a dataset curation pipeline for a classification task",
    "Configure hyperparameter optimization with Bayesian search",
    "Optimize inference latency for a transformer model",
    "Set up an RLHF reward model for a summarization task",
    "Design a distillation pipeline from GPT-4 to a smaller model",
  ],
  "Research": [
    "Help me formulate a testable hypothesis for my study",
    "Guide me through a systematic review using PRISMA guidelines",
    "Identify the key research gaps in [topic] from recent literature",
    "Help me design a rigorous experiment with proper controls",
    "Simulate a peer review of my manuscript methods section",
    "Map the intellectual lineage of a research area for me",
    "Calculate the sample size needed for 80% statistical power",
    "Draft a related work section comparing my approach to prior art",
  ],
  "Biology": [
    "Analyze the structural and functional properties of [protein]",
    "Design optimal CRISPR guide RNAs for [gene] in [organism]",
    "Perform pathway enrichment analysis on my gene set",
    "Guide me through differential gene expression analysis",
    "Build and interpret a phylogenetic tree for [organisms]",
    "Predict drug-target interactions for [compound] and [receptor]",
    "Identify potential biomarkers for [disease] from omics data",
    "Set up a molecular docking study for [ligand] and [receptor]",
  ],
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function SessionsView({
  trialModelsUsed, isPro, userEmail, accessToken, starterPrompt, onStarterConsumed,
  sessions, activeId, onSetActiveId, onCreateSession, onUpdateSessions,
}: {
  trialModelsUsed: string[]; isPro: boolean; userEmail: string; accessToken: string
  starterPrompt?: string; onStarterConsumed?: () => void
  sessions: SessionMeta[]; activeId: string | null
  onSetActiveId: (id: string | null) => void
  onCreateSession: () => Promise<string | null>
  onUpdateSessions: (updater: (prev: SessionMeta[]) => SessionMeta[]) => void
}) {
  const bottomRef   = useRef<HTMLDivElement>(null)
  const fileRef     = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef      = useRef<any>(null)
  const [model,     setModel]    = useState("gpt-4o-mini")
  const [messages,  setMessages] = useState<Msg[]>([])
  const [input,     setInput]    = useState("")
  const [loading,   setLoading]  = useState(false)
  const [trialUsed, setTrialUsed] = useState<string[]>(trialModelsUsed)
  const [showGate,  setShowGate]  = useState(false)
  const [webSearch,       setWebSearch]       = useState(false)
  const [fileUploading,   setFileUploading]   = useState(false)
  const [shareToast,      setShareToast]      = useState(false)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [showModePicker,  setShowModePicker]  = useState(false)
  const [selectedMode,    setSelectedMode]    = useState<string | null>(null)
  const [selectedCat,     setSelectedCat]     = useState<SuggCat>("For you")
  const [displayedSuggs,  setDisplayedSuggs]  = useState(() => shuffle(ALL_SUGGESTIONS["For you"]).slice(0, 3))
  const [hoveredMsg,      setHoveredMsg]      = useState<number | null>(null)
  const [isListening,     setIsListening]     = useState(false)
  const [interimText,     setInterimText]     = useState("")
  const [copyToast,       setCopyToast]       = useState<number | null>(null)
  const [visual,          setVisual]          = useState<AnyViz | null>(null)
  const [visualDomain,    setVisualDomain]    = useState("none")
  const [autoVisual,      setAutoVisual]      = useState(true)
  const [visualLoading,   setVisualLoading]   = useState(false)

  const modelObj       = MODELS.find(m => m.id === model)!
  const modelTrialDone = !isPro && trialUsed.includes(model)

  // Load messages when active session changes externally
  useEffect(() => {
    if (!activeId) { setMessages([]); return }
    fetch(`/api/sessions/${activeId}`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setMessages(d.messages ?? []); setModel(d.model) } })
      .catch(() => {})
  }, [activeId])

  // Starter prompt from workflow launch
  useEffect(() => {
    if (starterPrompt) { setInput(starterPrompt); onStarterConsumed?.() }
  }, [starterPrompt])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function saveSession(id: string, msgs: Msg[], title?: string) {
    await fetch(`/api/sessions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ messages: msgs, model, ...(title ? { title } : {}) }),
    })
    onUpdateSessions(prev => prev.map(s =>
      s.id === id ? { ...s, updated_at: new Date().toISOString(), ...(title ? { title } : {}) } : s
    ))
  }

  function exportChat() {
    const title = sessions.find(s => s.id === activeId)?.title ?? "veil-session"
    const md = `# ${title}\n_Exported from Veil Research — ${new Date().toLocaleDateString()}_\n\n` +
      messages.map(m => `**${m.role === "user" ? "You" : "Veil"}:**\n\n${m.content}`).join("\n\n---\n\n")
    const blob = new Blob([md], { type: "text/markdown" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url; a.download = `${title.slice(0, 40).replace(/\s+/g, "-")}.md`; a.click()
    URL.revokeObjectURL(url)
  }

  function toggleVoice() {
    if (isListening) {
      recRef.current?.stop()
      setIsListening(false)
      setInterimText("")
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Voice input is not supported in this browser. Try Chrome or Edge."); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR()
    recRef.current = rec
    rec.continuous      = true
    rec.interimResults  = true
    rec.lang            = "en-US"
    rec.onstart  = () => setIsListening(true)
    rec.onend    = () => { setIsListening(false); setInterimText("") }
    rec.onerror  = () => { setIsListening(false); setInterimText("") }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = ""; let finalText = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " "
        else interim += e.results[i][0].transcript
      }
      if (finalText) setInput(prev => (prev + " " + finalText).trimStart())
      setInterimText(interim)
    }
    rec.start()
  }
  // keep backward-compat alias used in JSX
  const startVoice = toggleVoice

  async function regenerate() {
    const lastAssistant = messages.map(m => m.role).lastIndexOf("assistant")
    if (lastAssistant === -1 || loading) return
    const trimmed = messages.slice(0, lastAssistant)
    setMessages(trimmed)
    setLoading(true)
    const sessionId = activeId
    if (!sessionId) return
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ messages: selectedMode ? [{ role: "system", content: MODE_PROMPTS[selectedMode] }, ...trimmed] : trimmed, model, webSearch }),
      })
      if (!res.ok || !res.headers.get("content-type")?.includes("text/plain")) return
      const reader = res.body!.getReader(); const decoder = new TextDecoder(); let content = ""
      setLoading(false); setMessages([...trimmed, { role: "assistant", content: "" }])
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        content += decoder.decode(value, { stream: true })
        setMessages(prev => { const m = [...prev]; m[m.length - 1] = { role: "assistant", content }; return m })
      }
      await saveSession(sessionId, [...trimmed, { role: "assistant", content }])
    } finally { setLoading(false) }
  }

  async function generateVisual(question: string, domain: string) {
    setVisualLoading(true)
    setVisual(null)

    // Hologram and particles are fully client-side — resolve instantly
    if (domain === "hologram") {
      const l = question.toLowerCase()
      const shape = l.includes("dna")||l.includes("helix") ? "dna" : l.includes("neural")||l.includes("network") ? "neural" : l.includes("crystal") ? "crystal" : l.includes("torus")||l.includes("donut") ? "torus" : l.includes("molecule")||l.includes("atom") ? "molecule" : "sphere"
      setVisual({ type: "hologram", shape, title: question } as AnyViz)
      setVisualLoading(false); return
    }
    if (domain === "particles") {
      const l = question.toLowerCase()
      const pattern = l.includes("galaxy")||l.includes("spiral") ? "galaxy" : l.includes("vortex")||l.includes("spin") ? "vortex" : l.includes("wave") ? "wave" : l.includes("field")||l.includes("force") ? "field" : "nebula"
      setVisual({ type: "particles", pattern, title: question } as AnyViz)
      setVisualLoading(false); return
    }

    const systemMsg = "You are a JSON-only visualization data generator. Your entire response must be a single valid JSON object. No text, no markdown, no explanation. Only the raw JSON."
    const examples: Record<string, string> = {
      flowchart: `{"type":"mermaid","code":"graph TD\\n  A[Start] --> B{Check}\\n  B -->|Yes| C[Do A]\\n  B -->|No| D[Do B]\\n  C --> E[End]\\n  D --> E"}`,
      chart:     `{"type":"chart","chartType":"bar","title":"Comparison","labels":["A","B","C","D"],"datasets":[{"label":"Value","data":[42,71,28,55]}]}`,
      mindmap:   `{"type":"mindmap","center":"Topic","branches":[{"label":"Part 1","color":"#8b5cf6","items":["A","B"]},{"label":"Part 2","color":"#3b82f6","items":["C","D"]},{"label":"Part 3","color":"#10b981","items":["E","F"]}]}`,
      physics:   `{"type":"physics","scene":"projectile","params":{"angle":45,"velocity":30,"gravity":9.8}}`,
      function:  `{"type":"function","expression":"Math.sin(x)","xMin":-6.28,"xMax":6.28,"title":"f(x)"}`,
    }
    const example = examples[domain] ?? examples.mindmap
    const prompt = `Topic: "${question}"\nDomain: ${domain}\n\nGenerate a visualization JSON for this topic. Use REAL values from the topic, not placeholder data.\n\nExample format for ${domain}:\n${example}\n\nReturn ONLY the JSON object. Nothing else.`
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ messages: [{ role: "system", content: systemMsg }, { role: "user", content: prompt }], model: "gpt-4o-mini", webSearch: false }),
      })
      if (!res.ok) return
      const reader = res.body!.getReader(); const decoder = new TextDecoder(); let raw = ""
      while (true) { const { done, value } = await reader.read(); if (done) break; raw += decoder.decode(value, { stream: true }) }
      // Strip markdown code fences and find JSON
      const cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim()
      // Greedily find the outermost JSON object
      const start = cleaned.indexOf("{"); const end = cleaned.lastIndexOf("}")
      if (start !== -1 && end !== -1 && end > start) {
        const jsonStr = cleaned.slice(start, end + 1)
        const parsed = JSON.parse(jsonStr) as AnyViz
        if (parsed?.type) setVisual(parsed)
      }
    } catch (e) {
      console.warn("Visual generation parse error:", e)
    } finally { setVisualLoading(false) }
  }

  function copyMessage(content: string, idx: number) {
    navigator.clipboard.writeText(content).catch(() => {})
    setCopyToast(idx); setTimeout(() => setCopyToast(null), 1500)
  }

  async function shareSession() {
    if (!activeId) return
    const res = await fetch(`/api/sessions/${activeId}/share`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } })
    if (res.ok) {
      const { url } = await res.json()
      navigator.clipboard.writeText(url).catch(() => {})
      onUpdateSessions(prev => prev.map(s => s.id === activeId ? { ...s, is_public: true } : s))
      setShareToast(true)
      setTimeout(() => setShareToast(false), 2500)
    }
  }

  async function handleFile(file: File) {
    setFileUploading(true)
    const form = new FormData(); form.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body: form })
    if (res.ok) {
      const { content, filename } = await res.json()
      setInput(prev => `[File: ${filename}]\n\`\`\`\n${content}\n\`\`\`\n\n${prev}`)
    } else {
      const err = await res.json().catch(() => ({}))
      alert(err.error ?? "Upload failed")
    }
    setFileUploading(false)
  }

  const send = async () => {
    if (!input.trim() || loading) return
    if (modelTrialDone) { setShowGate(true); return }

    let sessionId = activeId
    if (!sessionId) {
      sessionId = await onCreateSession()
      if (sessionId) onSetActiveId(sessionId)
    }
    if (!sessionId) return

    const userMsg: Msg = { role: "user", content: input.trim() }
    const isFirst = messages.length === 0
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput("")
    setLoading(true)

    // Visual engine — detect domain
    const rawInput = userMsg.content
    const isExplicitVisual = /\b(visuali[sz]e|show visual|diagram|chart|plot|graph|draw|animate|simulate|flowchart|mind ?map)\b/i.test(rawInput)
    const domain = isExplicitVisual ? (detectDomain(rawInput) || "mindmap") : detectDomain(rawInput)
    setVisualDomain(domain)

    const apiMessages = selectedMode
      ? [{ role: "system", content: MODE_PROMPTS[selectedMode] }, ...updated]
      : updated

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ messages: apiMessages, model, webSearch }),
      })

      if (!res.ok || !res.headers.get("content-type")?.includes("text/plain")) {
        const data = await res.json()
        if (data.error === "UPGRADE_REQUIRED") { setTrialUsed(t => [...new Set([...t, model])]); setShowGate(true); return }
        const errMsgs = [...updated, { role: "assistant" as const, content: "Service temporarily unavailable. Please try again shortly." }]
        setMessages(errMsgs)
        await saveSession(sessionId, errMsgs)
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let content = ""
      setLoading(false)
      setMessages([...updated, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        content += decoder.decode(value, { stream: true })
        setMessages(prev => { const m = [...prev]; m[m.length - 1] = { role: "assistant", content }; return m })
      }

      if (res.headers.get("X-Trial-Updated") === "true") setTrialUsed(t => [...new Set([...t, model])])

      const finalMsgs = [...updated, { role: "assistant" as const, content }]
      const title = isFirst ? userMsg.content.slice(0, 60) : undefined
      await saveSession(sessionId, finalMsgs, title)

      // Generate visual via dedicated focused call — always when autoVisual is on
      if (autoVisual) {
        const vizDomain = domain !== "none" ? domain : isExplicitVisual ? "mindmap" : "mindmap"
        generateVisual(rawInput, vizDomain)
      }
    } catch {
      const errMsgs = [...updated, { role: "assistant" as const, content: "Something went wrong. Please try again." }]
      setMessages(errMsgs)
      await saveSession(sessionId, errMsgs)
    } finally {
      setLoading(false)
    }
  }

  // ── Empty state (no messages) — Perplexity-style homepage ──────────────────
  if (messages.length === 0) {
    const catIcon: Record<SuggCat, React.ReactNode> = {
      "For you":  <Sparkles size={13} />,
      "Workflow": <RefreshCw size={13} />,
      "Research": <BookOpen size={13} />,
      "Biology":  <Dna size={13} />,
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden", position: "relative", background: "#050508" }}>
        {/* Gate modal */}
        {showGate && (
          <div style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <div style={{ background: "#0f0f1c", borderRadius: "20px", border: "1px solid rgba(139,92,246,0.3)", padding: "36px", maxWidth: "400px", width: "100%", position: "relative" }}>
              <button onClick={() => setShowGate(false)} style={{ position: "absolute", top: "14px", right: "14px", background: "none", border: "none", cursor: "pointer", color: "#7878a8" }}><X size={16} /></button>
              <Lock size={28} color="#8b5cf6" style={{ marginBottom: "16px" }} />
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#ededff", marginBottom: "8px" }}>Subscription required</h3>
              <p style={{ fontSize: "14px", color: "#7878a8", lineHeight: 1.7, marginBottom: "20px" }}>Upgrade to Pro for unlimited messages across all models.</p>
              <a href="/pricing" style={{ display: "block", width: "100%", padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", color: "#fff", fontSize: "14px", fontWeight: 700, textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>Upgrade to Pro →</a>
            </div>
          </div>
        )}

        {/* Web / Share top-right */}
        <div style={{ position: "absolute", top: "16px", right: "20px", zIndex: 10, display: "flex", gap: "6px" }}>
          <button onClick={() => setWebSearch(w => !w)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "8px", border: "none", cursor: "pointer", background: webSearch ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)", outline: webSearch ? "1px solid rgba(59,130,246,0.35)" : "none" }}>
            <Globe size={13} color={webSearch ? "#3b82f6" : "#4a4a6a"} />
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: webSearch ? "#3b82f6" : "#4a4a6a" }}>Web</span>
          </button>
        </div>

        {/* Centered content */}
        <div className="hero-center" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 24px 32px", overflowY: "auto" }}>

          {/* Glow heading */}
          <div className="hero-heading-wrap" style={{ marginBottom: "36px", textAlign: "center", userSelect: "none" }}>
            {isPro ? (
              <h1 style={{
                fontSize: "clamp(52px, 10vw, 96px)", fontWeight: 900,
                letterSpacing: "-0.04em", lineHeight: 1, margin: 0,
                background: "linear-gradient(135deg, #ededff 0%, #a78bfa 40%, #38bdf8 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 40px rgba(139,92,246,0.55)) drop-shadow(0 0 80px rgba(59,130,246,0.3))",
              }}>Veil Pro</h1>
            ) : (
              <h1 style={{
                fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800,
                letterSpacing: "-0.03em", color: "rgba(237,237,255,0.8)", margin: 0, lineHeight: 1.2,
              }}>What do you want to know?</h1>
            )}
          </div>

          {/* Input + mobile interest icons */}
          <div className="hero-input-section" style={{ width: "100%", maxWidth: "700px", position: "relative", marginBottom: "20px" }}>

            {/* Mobile-only interest icon chips */}
            <div className="mobile-interests" style={{ display: "none", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              {([
                { cat: "For you" as SuggCat,  icon: Sparkles,  color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)",  label: "For you"  },
                { cat: "Research" as SuggCat, icon: BookOpen,  color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  label: "Research" },
                { cat: "Biology" as SuggCat,  icon: Dna,       color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  label: "Biology"  },
                { cat: "Workflow" as SuggCat, icon: RefreshCw, color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  label: "Workflow" },
              ] as const).map(item => {
                const Icon = item.icon
                const active = selectedCat === item.cat
                return (
                  <button key={item.cat} onClick={() => {
                    setSelectedCat(item.cat)
                    const pick = shuffle(ALL_SUGGESTIONS[item.cat])[0]
                    setInput(pick ?? "")
                  }} style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 14px", borderRadius: "100px", border: `1px solid ${item.border}`,
                    background: active ? item.bg : "rgba(255,255,255,0.04)",
                    cursor: "pointer", fontSize: "13px", fontWeight: 600, color: active ? item.color : "#7878a8",
                  }}>
                    <Icon size={13} color={active ? item.color : "#7878a8"} />
                    {item.label}
                  </button>
                )
              })}
            </div>
            {/* Model dropdown */}
            {showModelPicker && (
              <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, zIndex: 100, background: "#0f0f1c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "6px", minWidth: "220px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
                {MODELS.map(m => { const Icon = m.icon; const active = model === m.id; return (
                  <button key={m.id} onClick={() => { setModel(m.id); setShowModelPicker(false) }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", border: "none", cursor: "pointer", background: active ? `${m.color}12` : "transparent", textAlign: "left" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `${m.color}14`, border: `1px solid ${m.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={13} color={m.color} /></div>
                    <div><div style={{ fontSize: "13px", fontWeight: 700, color: active ? m.color : "#ededff" }}>{m.name}</div><div style={{ fontSize: "11px", color: "#4a4a6a" }}>{m.provider} · {m.desc}</div></div>
                    {active && <Check size={13} color={m.color} style={{ marginLeft: "auto" }} />}
                  </button>
                )})}
              </div>
            )}
            {/* Mode dropdown */}
            {showModePicker && (
              <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "120px", zIndex: 100, background: "#0f0f1c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "6px", minWidth: "240px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
                <button onClick={() => { setSelectedMode(null); setShowModePicker(false) }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", border: "none", cursor: "pointer", background: !selectedMode ? "rgba(255,255,255,0.06)" : "transparent", textAlign: "left" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Sparkles size={13} color="#7878a8" /></div>
                  <div><div style={{ fontSize: "13px", fontWeight: 700, color: !selectedMode ? "#ededff" : "#9898b8" }}>No mode</div><div style={{ fontSize: "11px", color: "#4a4a6a" }}>General purpose</div></div>
                  {!selectedMode && <Check size={13} color="#7878a8" style={{ marginLeft: "auto" }} />}
                </button>
                {MODES.map(m => { const Icon = m.icon; const active = selectedMode === m.id; return (
                  <button key={m.id} onClick={() => { setSelectedMode(m.id); setShowModePicker(false) }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", border: "none", cursor: "pointer", background: active ? `${m.color}12` : "transparent", textAlign: "left" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: m.bg, border: `1px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={13} color={m.color} /></div>
                    <div><div style={{ fontSize: "13px", fontWeight: 700, color: active ? m.color : "#ededff" }}>{m.label}</div><div style={{ fontSize: "11px", color: "#4a4a6a" }}>Specialised system prompt</div></div>
                    {active && <Check size={13} color={m.color} style={{ marginLeft: "auto" }} />}
                  </button>
                )})}
              </div>
            )}
            {(showModelPicker || showModePicker) && <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => { setShowModelPicker(false); setShowModePicker(false) }} />}

            <div style={{ background: isListening ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.05)", border: isListening ? "1px solid rgba(239,68,68,0.35)" : "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "14px 16px", boxShadow: "0 0 0 1px rgba(139,92,246,0.08), 0 8px 40px rgba(0,0,0,0.4)", transition: "border 0.2s" }}>
              <textarea
                value={input} autoFocus
                onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px" }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder={isListening ? "Listening… speak now" : "Ask anything…"}
                rows={1}
                style={{ width: "100%", background: "none", border: "none", outline: "none", color: "#ededff", fontSize: "16px", lineHeight: 1.6, resize: "none", fontFamily: "inherit", padding: "0", maxHeight: "160px", boxSizing: "border-box" }}
              />
              {interimText && (
                <div style={{ fontSize: "14px", color: "rgba(237,237,255,0.4)", fontStyle: "italic", marginTop: "4px", lineHeight: 1.5 }}>
                  {interimText}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {/* Model pill */}
                  <button onClick={e => { e.stopPropagation(); setShowModePicker(false); setShowModelPicker(v => !v) }} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", background: "rgba(255,255,255,0.04)" }}>
                    <modelObj.icon size={11} color={modelObj.color} />
                    <span className="pill-label" style={{ fontSize: "12px", fontWeight: 600, color: modelObj.color }}>{modelObj.name}</span>
                    <ChevronRight size={10} color="#4a4a6a" style={{ transform: showModelPicker ? "rotate(-90deg)" : "rotate(90deg)" }} />
                  </button>
                  {/* Mode pill */}
                  {(() => { const m = MODES.find(m => m.id === selectedMode); const Icon = m?.icon ?? Sparkles; return (
                    <button onClick={e => { e.stopPropagation(); setShowModelPicker(false); setShowModePicker(v => !v) }} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "100px", border: `1px solid ${m ? m.border : "rgba(255,255,255,0.12)"}`, cursor: "pointer", background: m ? m.bg : "rgba(255,255,255,0.04)" }}>
                      <Icon size={11} color={m?.color ?? "#7878a8"} />
                      <span className="pill-label" style={{ fontSize: "12px", fontWeight: 600, color: m?.color ?? "#7878a8" }}>{m?.label ?? "Mode"}</span>
                      <ChevronRight size={10} color="#4a4a6a" style={{ transform: showModePicker ? "rotate(-90deg)" : "rotate(90deg)" }} />
                    </button>
                  )})()}
                  {/* Attach */}
                  {/* Visuals toggle pill — empty state */}
                  <button onClick={() => setAutoVisual(v => !v)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "100px", border: autoVisual ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.12)", cursor: "pointer", background: autoVisual ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)" }}>
                    <Sparkles size={11} color={autoVisual ? "#a78bfa" : "#7878a8"} />
                    <span style={{ fontSize: "12px", fontWeight: 700, color: autoVisual ? "#a78bfa" : "#7878a8" }}>Visuals</span>
                  </button>
                  <button onClick={() => fileRef.current?.click()} disabled={fileUploading} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", background: "rgba(255,255,255,0.04)" }}>
                    <Paperclip size={11} color="#7878a8" />
                    <span className="pill-label" style={{ fontSize: "12px", fontWeight: 600, color: "#7878a8" }}>{fileUploading ? "Uploading…" : "Attach"}</span>
                  </button>
                  <input ref={fileRef} type="file" accept=".txt,.md,.csv,.json,.js,.ts,.tsx,.jsx,.py,.html,.css,.yaml,.yml,.sh,.sql,.r,.rs,.go" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }} />
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <button onClick={startVoice} title={isListening ? "Stop recording" : "Voice input"} className={isListening ? "mic-active" : ""} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: isListening ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                    {isListening ? <MicOff size={14} color="#ef4444" /> : <Mic size={14} color="#7878a8" />}
                  </button>
                  <button onClick={send} disabled={loading || !input.trim()} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: input.trim() ? `linear-gradient(135deg,${modelObj.color},${modelObj.color}99)` : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed", flexShrink: 0 }}>
                    <Send size={14} color={input.trim() ? "#fff" : "#4a4a6a"} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Category chips */}
          <div className="sugg-cats" style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginBottom: "16px" }}>
            {SUGGESTION_CATS.map(cat => (
              <button key={cat} onClick={() => { setSelectedCat(cat); setDisplayedSuggs(shuffle(ALL_SUGGESTIONS[cat]).slice(0, 3)) }} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "100px", border: "none", cursor: "pointer",
                fontSize: "13px", fontWeight: 600,
                background: selectedCat === cat ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                color: selectedCat === cat ? "#ededff" : "#7878a8",
                outline: selectedCat === cat ? "1px solid rgba(255,255,255,0.15)" : "none",
              }}>
                {catIcon[cat]} {cat}
              </button>
            ))}
          </div>

          {/* Suggestion items */}
          <div className="sugg-items-wrap" style={{ width: "100%", maxWidth: "700px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {displayedSuggs.map((s, i) => (
              <button key={i} className="sugg-item" onClick={() => setInput(s)} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 16px", borderRadius: "12px", border: "none",
                background: "rgba(255,255,255,0.03)", cursor: "pointer", textAlign: "left",
                transition: "background 0.15s", width: "100%",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "13px", color: "#7878a8" }}>↗</span>
                </div>
                <span style={{ fontSize: "13.5px", color: "#ededff", lineHeight: 1.5 }}>{s}</span>
              </button>
            ))}
          </div>

          {/* Shuffle */}
          <button className="shuffle-btn" onClick={() => setDisplayedSuggs(shuffle(ALL_SUGGESTIONS[selectedCat]).slice(0, 3))} style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#4a4a6a" }}>
            <RefreshCw size={12} /> Shuffle
          </button>
        </div>
        <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
      </div>
    )
  }

  return (
    <div className="visual-split-outer" style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden", position: "relative" }}>

      {/* ── Text + controls column ─────────────────────────────────────────── */}
      <div style={{ flex: (visual || visualLoading) ? "0 0 55%" : "1 1 100%", display: "flex", flexDirection: "column", overflow: "hidden", transition: "flex 0.3s ease", minWidth: 0, minHeight: 0 }}>

        {/* Gate modal */}
        {showGate && (
          <div style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <div style={{ background: "#0f0f1c", borderRadius: "20px", border: "1px solid rgba(139,92,246,0.3)", padding: "36px", maxWidth: "400px", width: "100%", position: "relative" }}>
              <button onClick={() => setShowGate(false)} style={{ position: "absolute", top: "14px", right: "14px", background: "none", border: "none", cursor: "pointer", color: "#7878a8" }}><X size={16} /></button>
              <Lock size={28} color="#8b5cf6" style={{ marginBottom: "16px" }} />
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#ededff", marginBottom: "8px" }}>Subscription required</h3>
              <p style={{ fontSize: "14px", color: "#7878a8", lineHeight: 1.7, marginBottom: "20px" }}>Upgrade to Pro for unlimited messages across all models.</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
                {MODELS.filter(m => m.id !== model && !trialUsed.includes(m.id)).map(m => (
                  <button key={m.id} onClick={() => { setModel(m.id); setShowGate(false) }} style={{ padding: "7px 14px", borderRadius: "8px", border: `1px solid ${m.color}30`, background: `${m.color}12`, fontSize: "12.5px", fontWeight: 600, color: m.color, cursor: "pointer" }}>
                    Switch to {m.name}
                  </button>
                ))}
              </div>
              <a href="/pricing" style={{ display: "block", width: "100%", padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", color: "#fff", fontSize: "14px", fontWeight: 700, textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
                Upgrade to Pro →
              </a>
            </div>
          </div>
        )}

        {/* Share toast */}
        {shareToast && (
          <div style={{ position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 60, padding: "10px 20px", borderRadius: "10px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#ededff" }}>
            <Check size={14} color="#10b981" /> Link copied to clipboard
          </div>
        )}

        {/* Top bar */}
        <div className="veil-topbar" style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", minHeight: "44px" }}>
          {visualLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "8px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", border: "2px solid rgba(139,92,246,0.3)", borderTop: "2px solid #8b5cf6", animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: "11.5px", color: "#8b5cf6", fontWeight: 600 }}>Generating visual…</span>
            </div>
          )}
          <button onClick={() => setWebSearch(w => !w)} title="Web search" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "8px", border: "none", cursor: "pointer", background: webSearch ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)", outline: webSearch ? "1px solid rgba(59,130,246,0.35)" : "none" }}>
            <Globe size={13} color={webSearch ? "#3b82f6" : "#4a4a6a"} />
            <span className="pill-label" style={{ fontSize: "11.5px", fontWeight: 600, color: webSearch ? "#3b82f6" : "#4a4a6a" }}>Web</span>
          </button>
          {messages.length > 0 && (
            <button onClick={exportChat} title="Export as Markdown" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "8px", border: "none", cursor: "pointer", background: "rgba(255,255,255,0.04)" }}>
              <Download size={13} color="#7878a8" />
              <span className="pill-label" style={{ fontSize: "11.5px", fontWeight: 600, color: "#7878a8" }}>Export</span>
            </button>
          )}
          {activeId && messages.length > 0 && (
            <button onClick={shareSession} title="Share session" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "8px", border: "none", cursor: "pointer", background: "rgba(255,255,255,0.04)" }}>
              <Share2 size={13} color="#7878a8" />
              <span className="pill-label" style={{ fontSize: "11.5px", fontWeight: 600, color: "#7878a8" }}>Share</span>
            </button>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: "60px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "16px", margin: "0 auto 16px", background: `${modelObj.color}14`, border: `1px solid ${modelObj.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <modelObj.icon size={24} color={modelObj.color} />
              </div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#ededff", marginBottom: "6px" }}>{modelObj.name}</p>
              <p style={{ fontSize: "13px", color: "#7878a8" }}>{modelObj.desc} · {modelObj.provider}</p>
              {webSearch && <div style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "100px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", fontSize: "12px", fontWeight: 600, color: "#3b82f6" }}><Globe size={11} /> Web search on</div>}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {messages.map((msg, i) => (
              <div key={i} onMouseEnter={() => setHoveredMsg(i)} onMouseLeave={() => setHoveredMsg(null)}
                style={{ display: "flex", gap: "10px", flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start", position: "relative" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "9px", flexShrink: 0, background: msg.role === "user" ? "linear-gradient(135deg,#8b5cf6,#3b82f6)" : `${modelObj.color}14`, border: msg.role === "assistant" ? `1px solid ${modelObj.color}30` : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {msg.role === "user" ? <User size={13} color="#fff" /> : <Bot size={13} color={modelObj.color} />}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "72%" }}>
                  <div className="msg-bubble" style={{ padding: "12px 16px", borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px", background: msg.role === "user" ? "linear-gradient(135deg,#8b5cf6,#3b82f6)" : "rgba(15,15,28,0.9)", border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.07)" : "none", fontSize: "14px", lineHeight: 1.7, color: "#ededff", wordBreak: "break-word" }}>
                    {msg.role === "assistant" ? <MarkdownMessage content={msg.content} /> : <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>}
                  </div>
                  {hoveredMsg === i && (
                    <div style={{ display: "flex", gap: "4px", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                      <button onClick={() => copyMessage(msg.content, i)} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "6px", border: "none", cursor: "pointer", background: "rgba(255,255,255,0.06)", fontSize: "11px", color: copyToast === i ? "#10b981" : "#7878a8" }}>
                        {copyToast === i ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                        {copyToast === i ? "Copied" : "Copy"}
                      </button>
                      {msg.role === "assistant" && i === messages.length - 1 && !loading && (
                        <>
                          <button onClick={regenerate} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "6px", border: "none", cursor: "pointer", background: "rgba(255,255,255,0.06)", fontSize: "11px", color: "#7878a8" }}>
                            <RotateCcw size={11} /> Regenerate
                          </button>
                          <button onClick={() => { const lastUser = [...messages].reverse().find(m => m.role === "user"); if (lastUser) generateVisual(lastUser.content, detectDomain(lastUser.content) || "mindmap") }} disabled={visualLoading} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "6px", border: "none", cursor: visualLoading ? "not-allowed" : "pointer", background: "rgba(139,92,246,0.12)", fontSize: "11px", color: "#8b5cf6", outline: "1px solid rgba(139,92,246,0.25)" }}>
                            <Sparkles size={11} /> {visualLoading ? "Generating…" : "Visualize"}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "9px", flexShrink: 0, background: `${modelObj.color}14`, border: `1px solid ${modelObj.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bot size={13} color={modelObj.color} />
                </div>
                <div style={{ padding: "12px 16px", borderRadius: "4px 14px 14px 14px", background: "rgba(15,15,28,0.9)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: "6px", alignItems: "center" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: modelObj.color, opacity: 0.6, animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
          </div>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {modelTrialDone ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: "12px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Lock size={14} color="#8b5cf6" />
                <span style={{ fontSize: "13.5px", color: "#ededff", fontWeight: 600 }}>Trial used for {modelObj.name}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {MODELS.filter(m => !trialUsed.includes(m.id)).slice(0,2).map(m => (
                  <button key={m.id} onClick={() => setModel(m.id)} style={{ padding: "6px 12px", borderRadius: "8px", border: "none", fontSize: "12px", fontWeight: 700, cursor: "pointer", color: m.color, background: `${m.color}14` }}>Try {m.name}</button>
                ))}
                <a href="/pricing" style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, color: "#fff", textDecoration: "none", background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}>Upgrade</a>
              </div>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              {/* Model dropdown */}
              {showModelPicker && (
                <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, zIndex: 100, background: "#0f0f1c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "6px", minWidth: "220px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
                  {MODELS.map(m => {
                    const Icon = m.icon; const active = model === m.id
                    return (
                      <button key={m.id} onClick={() => { setModel(m.id); setShowModelPicker(false) }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", border: "none", cursor: "pointer", background: active ? `${m.color}12` : "transparent", textAlign: "left" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `${m.color}14`, border: `1px solid ${m.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={13} color={m.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: active ? m.color : "#ededff" }}>{m.name}</div>
                          <div style={{ fontSize: "11px", color: "#4a4a6a" }}>{m.provider} · {m.desc}</div>
                        </div>
                        {active && <Check size={13} color={m.color} style={{ marginLeft: "auto" }} />}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Mode dropdown */}
              {showModePicker && (
                <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "120px", zIndex: 100, background: "#0f0f1c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "6px", minWidth: "240px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
                  <button onClick={() => { setSelectedMode(null); setShowModePicker(false) }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", border: "none", cursor: "pointer", background: !selectedMode ? "rgba(255,255,255,0.06)" : "transparent", textAlign: "left" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Sparkles size={13} color="#7878a8" />
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: !selectedMode ? "#ededff" : "#9898b8" }}>No mode</div>
                      <div style={{ fontSize: "11px", color: "#4a4a6a" }}>General purpose</div>
                    </div>
                    {!selectedMode && <Check size={13} color="#7878a8" style={{ marginLeft: "auto" }} />}
                  </button>
                  {MODES.map(m => {
                    const Icon = m.icon; const active = selectedMode === m.id
                    return (
                      <button key={m.id} onClick={() => { setSelectedMode(m.id); setShowModePicker(false) }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", border: "none", cursor: "pointer", background: active ? `${m.color}12` : "transparent", textAlign: "left" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: m.bg, border: `1px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={13} color={m.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: active ? m.color : "#ededff" }}>{m.label}</div>
                          <div style={{ fontSize: "11px", color: "#4a4a6a" }}>Specialised system prompt</div>
                        </div>
                        {active && <Check size={13} color={m.color} style={{ marginLeft: "auto" }} />}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Backdrop to close dropdowns */}
              {(showModelPicker || showModePicker) && (
                <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => { setShowModelPicker(false); setShowModePicker(false) }} />
              )}

              <div style={{ background: isListening ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.04)", border: isListening ? "1px solid rgba(239,68,68,0.35)" : "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "10px 12px", transition: "border 0.2s" }}>
                <textarea
                  value={input}
                  onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px" }}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder={isListening ? "Listening… speak now" : "Ask anything… (Enter to send, Shift+Enter for new line)"}
                  rows={1}
                  style={{ width: "100%", background: "none", border: "none", outline: "none", color: "#ededff", fontSize: "14px", lineHeight: 1.6, resize: "none", fontFamily: "inherit", padding: "0", maxHeight: "160px", boxSizing: "border-box" }}
                />
                {interimText && (
                  <div style={{ fontSize: "13px", color: "rgba(237,237,255,0.4)", fontStyle: "italic", marginTop: "4px" }}>
                    {interimText}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
                  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    {/* Model pill */}
                    <button onClick={e => { e.stopPropagation(); setShowModePicker(false); setShowModelPicker(v => !v) }} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: showModelPicker ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)" }}>
                      <modelObj.icon size={11} color={modelObj.color} />
                      <span className="pill-label" style={{ fontSize: "11.5px", fontWeight: 600, color: modelObj.color }}>{modelObj.name}</span>
                      <ChevronRight size={10} color="#4a4a6a" style={{ transform: showModelPicker ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform 0.15s" }} />
                    </button>
                    {/* Mode pill */}
                    {(() => { const m = MODES.find(m => m.id === selectedMode); const Icon = m?.icon ?? Sparkles; return (
                      <button onClick={e => { e.stopPropagation(); setShowModelPicker(false); setShowModePicker(v => !v) }} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "100px", border: `1px solid ${m ? m.border : "rgba(255,255,255,0.1)"}`, cursor: "pointer", background: m ? m.bg : "rgba(255,255,255,0.04)" }}>
                        <Icon size={11} color={m?.color ?? "#7878a8"} />
                        <span className="pill-label" style={{ fontSize: "11.5px", fontWeight: 600, color: m?.color ?? "#7878a8" }}>{m?.label ?? "Mode"}</span>
                        <ChevronRight size={10} color="#4a4a6a" style={{ transform: showModePicker ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform 0.15s" }} />
                      </button>
                    )})()}
                    {/* Visuals toggle pill */}
                    <button onClick={() => setAutoVisual(v => !v)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "100px", border: autoVisual ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: autoVisual ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)" }}>
                      <Sparkles size={11} color={autoVisual ? "#a78bfa" : "#7878a8"} />
                      <span style={{ fontSize: "11.5px", fontWeight: 700, color: autoVisual ? "#a78bfa" : "#7878a8" }}>Visuals</span>
                    </button>
                    {/* Attach */}
                    <button onClick={() => fileRef.current?.click()} disabled={fileUploading} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: "rgba(255,255,255,0.04)" }}>
                      <Paperclip size={11} color={fileUploading ? "#4a4a6a" : "#7878a8"} />
                      <span className="pill-label" style={{ fontSize: "11.5px", fontWeight: 600, color: fileUploading ? "#4a4a6a" : "#7878a8" }}>{fileUploading ? "Uploading…" : "Attach"}</span>
                    </button>
                    <input ref={fileRef} type="file" accept=".txt,.md,.csv,.json,.js,.ts,.tsx,.jsx,.py,.html,.css,.yaml,.yml,.sh,.sql,.r,.rs,.go" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }} />
                  </div>
                  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    <button onClick={startVoice} title={isListening ? "Stop recording" : "Voice input"} className={isListening ? "mic-active" : ""} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: isListening ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                      {isListening ? <MicOff size={13} color="#ef4444" /> : <Mic size={13} color="#7878a8" />}
                    </button>
                    <button onClick={send} disabled={loading || !input.trim()} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: input.trim() && !loading ? `linear-gradient(135deg,${modelObj.color},${modelObj.color}99)` : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() && !loading ? "pointer" : "not-allowed", flexShrink: 0 }}>
                      <Send size={13} color={input.trim() && !loading ? "#fff" : "#4a4a6a"} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>{/* end text column */}

      {/* ── Visual Panel — show while loading OR when visual is ready ─────── */}
      {(visual || visualLoading) && (
        <div className="visual-panel" style={{ flex: "0 0 45%", overflow: "hidden", minWidth: 0, display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,0.08)", background: "rgba(5,5,10,0.9)" }}>
          {visualLoading && !visual && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(139,92,246,0.25)", borderTop: "3px solid #8b5cf6", animation: "spin 1s linear infinite" }} />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#ededff", marginBottom: "4px" }}>Generating visual…</p>
                <p style={{ fontSize: "12px", color: "#7878a8" }}>AI is building your diagram</p>
              </div>
            </div>
          )}
          {visual && (
            <Suspense fallback={
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid rgba(139,92,246,0.3)", borderTop: "2px solid #8b5cf6", animation: "spin 1s linear infinite" }} />
              </div>
            }>
              <VisualPanel visual={visual} onClose={() => { setVisual(null) }} />
            </Suspense>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes mic-pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}
        .mic-active{animation:mic-pulse 1.2s ease-in-out infinite!important}
        @media(max-width:767px){
          .visual-panel{
            flex: 0 0 100% !important;
            border-left: none !important;
            border-top: 1px solid rgba(255,255,255,0.08) !important;
            min-height: 360px;
            max-height: 50vh;
          }
          .visual-split-outer{
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  )
}

function WorkflowsView({ onLaunch }: { onLaunch: (prompt: string) => void }) {
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const cats = ["All", "Research", "Biology", "Flywheel", "Write"]
  const filtered = WORKFLOWS
    .filter(w => filter === "All" || w.cat === filter)
    .filter(w => !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.desc.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff" }}>Workflows</h2>
        <span style={{ fontSize: "12px", color: "#4a4a6a" }}>{WORKFLOWS.length} available</span>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <Search size={14} color="#4a4a6a" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search workflows…"
          style={{
            width: "100%", padding: "9px 12px 9px 34px", borderRadius: "10px", boxSizing: "border-box",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            color: "#ededff", fontSize: "13px", outline: "none",
          }}
        />
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "24px", flexWrap: "wrap" }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: "6px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
            fontSize: "12.5px", fontWeight: 600,
            color: filter === c ? "#ededff" : "#7878a8",
            background: filter === c ? "rgba(255,255,255,0.1)" : "transparent",
          }}>{c}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "12px" }}>
        {filtered.map((w, i) => (
          <div key={i} style={{
            padding: "20px", borderRadius: "12px",
            background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)",
            borderLeft: `3px solid ${w.color}`,
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: w.color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>{w.cat}</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#ededff", marginBottom: "6px" }}>{w.name}</div>
            <div style={{ fontSize: "12.5px", color: "#7878a8", marginBottom: "14px" }}>{w.desc}</div>
            <button
              onClick={() => onLaunch(w.prompt)}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                fontSize: "12px", fontWeight: 600, color: w.color,
                background: "none", border: "none", cursor: "pointer", padding: 0,
              }}>
              <Play size={11} fill={w.color} /> Launch workflow
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", paddingTop: "60px", color: "#4a4a6a", fontSize: "14px" }}>
          No workflows match &quot;{search}&quot;
        </div>
      )}
    </div>
  )
}

function IntegrationsView({ connected, setConnected }: { connected: Record<string, boolean>; setConnected: (v: Record<string, boolean>) => void }) {
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [show, setShow] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState("")

  const saveKey = (k: string) => {
    if (typeof window !== "undefined") localStorage.setItem(`veil_key_${k}`, keys[k] ?? "")
    setConnected({ ...connected, [k]: !!(keys[k]) })
    setSaved(k)
    setTimeout(() => setSaved(""), 2000)
  }

  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff", marginBottom: "6px" }}>Integrations</h2>
      <p style={{ fontSize: "13.5px", color: "#7878a8", marginBottom: "28px" }}>Link your tools once — credentials flow to every agent and session automatically.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {INTEGRATIONS_LIST.map(intg => {
          const Icon  = intg.icon
          const isConn = connected[intg.key]
          return (
            <div key={intg.key} style={{
              padding: "20px 24px", borderRadius: "14px",
              background: "rgba(15,15,28,0.8)",
              border: `1px solid ${isConn ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.07)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: keys[intg.key] !== undefined ? "14px" : "0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={17} color={isConn ? intg.color : "#4a4a6a"} />
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#ededff" }}>{intg.name}</div>
                    <div style={{ fontSize: "12px", color: "#7878a8" }}>{intg.desc}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {isConn && <span style={{ fontSize: "11px", color: "#10b981", background: "rgba(16,185,129,0.12)", padding: "3px 10px", borderRadius: "100px", fontWeight: 700 }}>Connected</span>}
                  <button
                    onClick={() => setKeys(k => ({ ...k, [intg.key]: k[intg.key] !== undefined ? undefined as unknown as string : "" }))}
                    style={{
                      padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.04)", fontSize: "12.5px", fontWeight: 600,
                      color: "#7878a8", cursor: "pointer",
                    }}
                  >{keys[intg.key] !== undefined ? "Cancel" : isConn ? "Update key" : "Connect"}</button>
                </div>
              </div>
              {keys[intg.key] !== undefined && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type={show[intg.key] ? "text" : "password"}
                      placeholder={`Paste your ${intg.name} API key`}
                      value={keys[intg.key]}
                      onChange={e => setKeys(k => ({ ...k, [intg.key]: e.target.value }))}
                      style={{
                        width: "100%", padding: "10px 36px 10px 12px", borderRadius: "10px", boxSizing: "border-box",
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "#ededff", fontSize: "13px", outline: "none",
                      }}
                    />
                    <button onClick={() => setShow(s => ({ ...s, [intg.key]: !s[intg.key] }))} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#4a4a6a" }}>
                      {show[intg.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button onClick={() => saveKey(intg.key)} style={{
                    padding: "10px 16px", borderRadius: "10px", border: "none",
                    background: saved === intg.key ? "rgba(16,185,129,0.2)" : "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                    color: saved === intg.key ? "#10b981" : "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}>
                    {saved === intg.key ? <><Check size={13} /> Saved</> : <><Save size={13} /> Save</>}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ComputeView() {
  const profiles = [
    { name: "CPU Session",    cores: "2 vCPU",   ram: "8 GB",    gpu: "None",         price: "Free", color: "#10b981", active: true },
    { name: "GPU Starter",    cores: "8 vCPU",   ram: "32 GB",   gpu: "1× A10G",      price: "₹12/hr", color: "#3b82f6", active: false },
    { name: "GPU Pro",        cores: "16 vCPU",  ram: "64 GB",   gpu: "1× A100 40GB", price: "₹40/hr", color: "#8b5cf6", active: false },
    { name: "Multi-GPU",      cores: "32 vCPU",  ram: "128 GB",  gpu: "4× A100 80GB", price: "₹150/hr", color: "#f59e0b", active: false },
  ]
  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff", marginBottom: "6px" }}>Compute</h2>
      <p style={{ fontSize: "13.5px", color: "#7878a8", marginBottom: "28px" }}>Go from a CPU session to a multi-GPU cluster without touching your workflow.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "14px", marginBottom: "32px" }}>
        {profiles.map(p => (
          <div key={p.name} style={{
            padding: "24px", borderRadius: "16px",
            background: p.active ? `${p.color}10` : "rgba(15,15,28,0.8)",
            border: `1px solid ${p.active ? p.color + "40" : "rgba(255,255,255,0.07)"}`,
            borderTop: `2px solid ${p.color}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "#ededff" }}>{p.name}</span>
              {p.active && <span style={{ fontSize: "10px", color: p.color, background: `${p.color}14`, padding: "3px 8px", borderRadius: "100px", fontWeight: 700 }}>Active</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
              {[["CPU", p.cores], ["RAM", p.ram], ["GPU", p.gpu]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "#7878a8" }}>{k}</span>
                  <span style={{ color: "#ededff", fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", fontWeight: 800, color: p.color }}>{p.price}</span>
              {!p.active && (
                <button style={{
                  padding: "5px 12px", borderRadius: "7px", border: `1px solid ${p.color}30`,
                  background: `${p.color}10`, fontSize: "12px", fontWeight: 600,
                  color: p.color, cursor: "pointer",
                }}>Select</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "20px 24px", borderRadius: "14px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#f59e0b", fontWeight: 600 }}>
          <AlertCircle size={14} /> GPU provisioning available at Pro plan launch — ₹199/month
        </div>
      </div>
    </div>
  )
}

function EvaluationsView() {
  const evals = [
    { name: "MMLU Benchmark",    model: "GPT-4o",      status: "completed", score: "87.4%",  color: "#10b981" },
    { name: "HumanEval",         model: "GPT-4o mini", status: "completed", score: "74.2%",  color: "#10b981" },
    { name: "MATH Benchmark",    model: "DeepSeek R1", status: "running",   score: "--",     color: "#f59e0b" },
    { name: "Custom SFT Eval",   model: "Llama 3 70B", status: "queued",    score: "--",     color: "#7878a8" },
  ]
  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff", marginBottom: "4px" }}>Evaluations</h2>
          <p style={{ fontSize: "13px", color: "#7878a8" }}>Run automated benchmarks across your models.</p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "9px 18px", borderRadius: "10px", border: "none",
          background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
          fontSize: "13px", fontWeight: 700, color: "#fff", cursor: "pointer",
        }}><Plus size={14} /> New Evaluation</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {evals.map((e, i) => (
          <div key={i} style={{
            padding: "18px 22px", borderRadius: "12px",
            background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", gap: "16px",
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: e.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ededff" }}>{e.name}</div>
              <div style={{ fontSize: "12px", color: "#7878a8" }}>{e.model}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: e.color }}>{e.score}</div>
              <div style={{ fontSize: "11px", color: "#4a4a6a", textTransform: "capitalize" }}>{e.status}</div>
            </div>
            <ChevronRight size={14} color="#4a4a6a" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Keyboard Shortcuts Modal ─────────────────────────────────────────────────

function KeyboardModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { keys: ["Cmd", "K"],     desc: "Cycle to next model" },
    { keys: ["Cmd", "/"],     desc: "Focus chat input" },
    { keys: ["Cmd", "?"],     desc: "Show keyboard shortcuts" },
    { keys: ["Enter"],        desc: "Send message" },
    { keys: ["Shift", "↵"],  desc: "New line in input" },
    { keys: ["Ctrl", "L"],   desc: "Clear terminal" },
    { keys: ["Ctrl", "C"],   desc: "Interrupt (terminal / cancel)" },
    { keys: ["↑ / ↓"],       desc: "Navigate command history (terminal)" },
    { keys: ["Ctrl", "V"],   desc: "Paste in terminal" },
    { keys: ["Ctrl", "⇧C"],  desc: "Copy selection (terminal)" },
  ]
  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px" }}
      onClick={onClose}>
      <div style={{ background:"#0f0f1c",borderRadius:"20px",border:"1px solid rgba(255,255,255,0.1)",padding:"32px",maxWidth:"480px",width:"100%",position:"relative" }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position:"absolute",top:"14px",right:"14px",background:"none",border:"none",cursor:"pointer",color:"#7878a8" }}><X size={16}/></button>
        <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"24px" }}>
          <Keyboard size={18} color="#8b5cf6"/>
          <h2 style={{ fontSize:"16px",fontWeight:800,color:"#ededff",margin:0 }}>Keyboard Shortcuts</h2>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:"8px" }}>
          {shortcuts.map((s,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:"8px",background:"rgba(255,255,255,0.03)" }}>
              <span style={{ fontSize:"13px",color:"#7878a8" }}>{s.desc}</span>
              <div style={{ display:"flex",gap:"4px" }}>
                {s.keys.map(k => (
                  <kbd key={k} style={{ padding:"2px 7px",borderRadius:"5px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",fontSize:"11px",fontFamily:"monospace",color:"#ededff" }}>{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:"11.5px",color:"#4a4a6a",marginTop:"20px",textAlign:"center" }}>Press Cmd+? anytime to open this</p>
      </div>
    </div>
  )
}

// ─── Notebook View ────────────────────────────────────────────────────────────

function NotebookView() {
  const NOTES_KEY = "veil_notebook_notes"
  const [notes, setNotes] = useState<{ id: string; title: string; body: string; updated: string }[]>(() => {
    if (typeof window === "undefined") return []
    try { return JSON.parse(localStorage.getItem(NOTES_KEY) ?? "[]") } catch { return [] }
  })
  const [active, setActive] = useState<string | null>(notes[0]?.id ?? null)
  const [body,   setBody]   = useState(notes[0]?.body ?? "")

  const save = (id: string, newBody: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, body: newBody, updated: new Date().toISOString() } : n)
    setNotes(updated)
    localStorage.setItem(NOTES_KEY, JSON.stringify(updated))
  }

  const newNote = () => {
    const n = { id: crypto.randomUUID(), title: `Note ${notes.length + 1}`, body: "", updated: new Date().toISOString() }
    const updated = [n, ...notes]
    setNotes(updated)
    localStorage.setItem(NOTES_KEY, JSON.stringify(updated))
    setActive(n.id); setBody("")
  }

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id)
    setNotes(updated)
    localStorage.setItem(NOTES_KEY, JSON.stringify(updated))
    const next = updated[0]
    setActive(next?.id ?? null); setBody(next?.body ?? "")
  }

  const activeNote = notes.find(n => n.id === active)

  return (
    <div style={{ display:"flex",height:"100%",overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width:"220px",flexShrink:0,borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",background:"rgba(8,8,16,0.6)",padding:"16px 12px",gap:"6px",overflowY:"auto" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px" }}>
          <span style={{ fontSize:"11px",fontWeight:700,color:"#4a4a6a",letterSpacing:"0.1em" }}>NOTES</span>
          <button onClick={newNote} style={{ background:"rgba(139,92,246,0.15)",border:"none",borderRadius:"6px",padding:"3px 8px",color:"#8b5cf6",fontSize:"12px",fontWeight:700,cursor:"pointer" }}>+ New</button>
        </div>
        {notes.length === 0 && <p style={{ fontSize:"12px",color:"#4a4a6a",textAlign:"center",marginTop:"20px" }}>No notes yet</p>}
        {notes.map(n => (
          <button key={n.id} onClick={() => { setActive(n.id); setBody(n.body) }} style={{
            width:"100%",padding:"10px 10px",borderRadius:"8px",border:"none",cursor:"pointer",textAlign:"left",
            background:active===n.id ? "rgba(139,92,246,0.1)" : "transparent",
            outline:active===n.id ? "1px solid rgba(139,92,246,0.3)" : "none",
          }}>
            <div style={{ fontSize:"13px",fontWeight:600,color:active===n.id?"#ededff":"#7878a8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{n.title}</div>
            <div style={{ fontSize:"11px",color:"#4a4a6a",marginTop:"2px" }}>{new Date(n.updated).toLocaleDateString()}</div>
          </button>
        ))}
      </div>
      {/* Editor */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {activeNote ? (
          <>
            <div style={{ padding:"14px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <input
                value={activeNote.title}
                onChange={e => { const u=notes.map(n=>n.id===active?{...n,title:e.target.value}:n);setNotes(u);localStorage.setItem(NOTES_KEY,JSON.stringify(u)) }}
                style={{ fontSize:"16px",fontWeight:700,color:"#ededff",background:"none",border:"none",outline:"none",flex:1 }}
              />
              <button onClick={() => deleteNote(active!)} style={{ background:"none",border:"none",cursor:"pointer",color:"#4a4a6a",fontSize:"12px" }}>Delete</button>
            </div>
            <textarea
              value={body}
              onChange={e => { setBody(e.target.value); save(active!, e.target.value) }}
              placeholder="Start writing… Markdown supported."
              style={{ flex:1,background:"none",border:"none",outline:"none",color:"#ededff",fontSize:"14px",lineHeight:1.8,padding:"24px",resize:"none",fontFamily:"inherit" }}
            />
          </>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:"16px" }}>
            <FileText size={40} color="#4a4a6a"/>
            <p style={{ color:"#7878a8",fontSize:"14px" }}>No note selected</p>
            <button onClick={newNote} style={{ padding:"10px 20px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#8b5cf6,#3b82f6)",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer" }}>Create first note</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Hypothesis Builder View ──────────────────────────────────────────────────

function HypothesisView({ accessToken }: { accessToken: string }) {
  const [domain,     setDomain]    = useState("")
  const [question,   setQuestion]  = useState("")
  const [variables,  setVariables] = useState("")
  const [loading,    setLoading]   = useState(false)
  const [result,     setResult]    = useState("")
  const [saved,      setSaved]     = useState<{ id:string;domain:string;result:string }[]>(() => {
    if (typeof window === "undefined") return []
    try { return JSON.parse(localStorage.getItem("veil_hypotheses") ?? "[]") } catch { return [] }
  })

  const generate = async () => {
    if (!domain.trim() || !question.trim()) return
    setLoading(true); setResult("")
    const prompt = `You are a research assistant. Generate a structured scientific hypothesis.

Domain: ${domain}
Research Question: ${question}
${variables ? `Variables: ${variables}` : ""}

Provide:
1. **Hypothesis** (one clear, testable statement)
2. **Rationale** (2-3 sentences)
3. **Null Hypothesis**
4. **Key Variables** (independent, dependent, controlled)
5. **Suggested Methods** (2-3 approaches)
6. **Related Search Terms** (for literature review)`

    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${accessToken}`},
        body:JSON.stringify({ messages:[{role:"user",content:prompt}], model:"gpt-4o-mini" }),
      })
      const reader=res.body!.getReader(); const decoder=new TextDecoder(); let content=""
      while(true){const{done,value}=await reader.read();if(done)break;content+=decoder.decode(value,{stream:true});setResult(content)}
      const newH={id:crypto.randomUUID(),domain,result:content}
      const updated=[newH,...saved.slice(0,9)]
      setSaved(updated); localStorage.setItem("veil_hypotheses",JSON.stringify(updated))
    } catch { setResult("Something went wrong. Please try again.") }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding:"28px",overflowY:"auto",height:"100%",display:"flex",flexDirection:"column",gap:"24px" }}>
      <div>
        <h2 style={{ fontSize:"18px",fontWeight:800,color:"#ededff",marginBottom:"6px" }}>Hypothesis Builder</h2>
        <p style={{ fontSize:"13.5px",color:"#7878a8" }}>Describe your research question — get a structured, testable hypothesis.</p>
      </div>

      <div style={{ display:"flex",flexDirection:"column",gap:"12px",maxWidth:"640px" }}>
        {[
          { label:"Research Domain", val:domain, set:setDomain, placeholder:"e.g. Molecular biology, NLP, Climate science" },
          { label:"Research Question", val:question, set:setQuestion, placeholder:"e.g. Does protein X affect cell proliferation in cancer tissue?" },
          { label:"Key Variables (optional)", val:variables, set:setVariables, placeholder:"e.g. Protein X concentration, cell growth rate, temperature" },
        ].map(f => (
          <div key={f.label}>
            <label style={{ fontSize:"12px",fontWeight:600,color:"#7878a8",display:"block",marginBottom:"6px" }}>{f.label}</label>
            <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder}
              style={{ width:"100%",padding:"10px 14px",borderRadius:"10px",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#ededff",fontSize:"14px",outline:"none" }} />
          </div>
        ))}
        <button onClick={generate} disabled={loading||!domain.trim()||!question.trim()} style={{
          padding:"12px 24px",borderRadius:"11px",border:"none",alignSelf:"flex-start",
          background:loading||!domain.trim()||!question.trim()?"rgba(255,255,255,0.08)":"linear-gradient(135deg,#8b5cf6,#3b82f6)",
          color:loading||!domain.trim()||!question.trim()?"#4a4a6a":"#fff",
          fontSize:"14px",fontWeight:700,cursor:loading||!domain.trim()||!question.trim()?"not-allowed":"pointer",
          display:"flex",alignItems:"center",gap:"8px",
        }}>
          <Lightbulb size={15}/> {loading ? "Generating…" : "Generate Hypothesis"}
        </button>
      </div>

      {result && (
        <div style={{ maxWidth:"640px",padding:"20px 24px",borderRadius:"14px",background:"rgba(15,15,28,0.8)",border:"1px solid rgba(255,255,255,0.07)" }}>
          <MarkdownMessage content={result}/>
        </div>
      )}

      {saved.length > 0 && (
        <div style={{ maxWidth:"640px" }}>
          <h3 style={{ fontSize:"13px",fontWeight:700,color:"#4a4a6a",letterSpacing:"0.08em",marginBottom:"12px" }}>RECENT HYPOTHESES</h3>
          <div style={{ display:"flex",flexDirection:"column",gap:"8px" }}>
            {saved.map(h => (
              <button key={h.id} onClick={()=>setResult(h.result)} style={{
                padding:"12px 16px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.07)",
                background:"rgba(15,15,28,0.6)",cursor:"pointer",textAlign:"left",
              }}>
                <div style={{ fontSize:"13px",fontWeight:600,color:"#ededff" }}>{h.domain}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsView({ email }: { email: string }) {
  const [name,         setName]         = useState(() => typeof window !== "undefined" ? localStorage.getItem("veil_name") ?? "" : "")
  const [openaiKey,    setOpenaiKey]    = useState(() => typeof window !== "undefined" ? localStorage.getItem("veil_key_openai") ?? "" : "")
  const [nvidiaKey,    setNvidiaKey]    = useState(() => typeof window !== "undefined" ? localStorage.getItem("veil_key_nvidia") ?? "" : "")
  const [systemPrompt, setSystemPrompt] = useState(() => typeof window !== "undefined" ? localStorage.getItem("veil_system_prompt") ?? "" : "")
  const [notifEmail,   setNotifEmail]   = useState(() => typeof window !== "undefined" ? localStorage.getItem("veil_notif_email") !== "false" : true)
  const [notifInApp,   setNotifInApp]   = useState(() => typeof window !== "undefined" ? localStorage.getItem("veil_notif_inapp") !== "false" : true)
  const [showKeys,     setShowKeys]     = useState(false)
  const [saved,        setSaved]        = useState(false)
  const router = useRouter()

  const save = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("veil_name", name)
      localStorage.setItem("veil_key_openai", openaiKey)
      localStorage.setItem("veil_key_nvidia", nvidiaKey)
      localStorage.setItem("veil_system_prompt", systemPrompt)
      localStorage.setItem("veil_notif_email", String(notifEmail))
      localStorage.setItem("veil_notif_inapp", String(notifInApp))
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%", maxWidth: "600px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff", marginBottom: "28px" }}>Settings</h2>

      {/* Profile */}
      <Section title="Profile">
        <Field label="Display Name">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
            style={inputStyle} />
        </Field>
        <Field label="Email">
          <input value={email} readOnly style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
        </Field>
      </Section>

      {/* API Keys */}
      <Section title="API Keys" subtitle="Stored locally on this device — never sent to our servers.">
        <Field label="OpenAI API Key">
          <div style={{ position: "relative" }}>
            <input type={showKeys ? "text" : "password"} value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} placeholder="sk-..."
              style={{ ...inputStyle, paddingRight: "40px" }} />
            <button onClick={() => setShowKeys(s => !s)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#4a4a6a" }}>
              {showKeys ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </Field>
        <Field label="NVIDIA API Key">
          <input type={showKeys ? "text" : "password"} value={nvidiaKey} onChange={e => setNvidiaKey(e.target.value)} placeholder="nvapi-..."
            style={inputStyle} />
        </Field>
      </Section>

      <button onClick={save} style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "11px 24px", borderRadius: "11px", border: "none",
        background: saved ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg,#8b5cf6,#3b82f6)",
        color: saved ? "#10b981" : "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer",
        marginBottom: "32px",
      }}>
        {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save changes</>}
      </button>

      {/* Danger */}
      <Section title="Account" subtitle="">
        <button onClick={signOut} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 20px", borderRadius: "10px",
          border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)",
          fontSize: "13.5px", fontWeight: 600, color: "#ef4444", cursor: "pointer",
        }}>
          <LogOut size={14} /> Sign out
        </button>
      </Section>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#ededff", marginBottom: "2px" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "12px", color: "#4a4a6a" }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{children}</div>
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginTop: "24px" }} />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: "12px", fontWeight: 600, color: "#7878a8", display: "block", marginBottom: "6px" }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "10px", boxSizing: "border-box",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#ededff", fontSize: "14px", outline: "none",
}

function NotificationsView() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS)

  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff" }}>Notifications</h2>
        <button onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))} style={{
          padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.04)", fontSize: "12.5px", fontWeight: 600,
          color: "#7878a8", cursor: "pointer",
        }}>Mark all read</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {notifs.map(n => {
          const Icon = n.icon
          return (
            <div key={n.id} onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))} style={{
              padding: "16px 20px", borderRadius: "12px", cursor: "pointer",
              background: n.read ? "rgba(10,10,18,0.6)" : "rgba(15,15,28,0.9)",
              border: `1px solid ${n.read ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)"}`,
              display: "flex", gap: "14px", alignItems: "flex-start",
            }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                background: `${n.color}14`, border: `1px solid ${n.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={16} color={n.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#ededff" }}>{n.title}</span>
                  {!n.read && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8b5cf6", flexShrink: 0 }} />}
                </div>
                <div style={{ fontSize: "13px", color: "#7878a8", lineHeight: 1.6 }}>{n.body}</div>
                <div style={{ fontSize: "11.5px", color: "#4a4a6a", marginTop: "6px" }}>{n.time}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProfileView({ email, trialModelsUsed, isPro, sessions }: { email: string; trialModelsUsed: string[]; isPro: boolean; sessions: SessionMeta[] }) {
  const initials = email.slice(0, 2).toUpperCase()
  const referralCode = "veil-" + btoa(email).replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase()
  const referralUrl  = `https://veilresearch.com?ref=${referralCode}`
  const [refCopied, setRefCopied] = useState(false)
  function copyRef() { navigator.clipboard.writeText(referralUrl).catch(()=>{}); setRefCopied(true); setTimeout(()=>setRefCopied(false), 2000) }

  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff", marginBottom: "28px" }}>Profile</h2>

      {/* Avatar + info */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "20px",
          background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "28px", fontWeight: 800, color: "#fff",
        }}>{initials}</div>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#ededff", marginBottom: "4px" }}>
            {typeof window !== "undefined" ? localStorage.getItem("veil_name") || email.split("@")[0] : email.split("@")[0]}
          </div>
          <div style={{ fontSize: "13.5px", color: "#7878a8", marginBottom: "8px" }}>{email}</div>
          <span style={{
            padding: "4px 12px", borderRadius: "100px", fontSize: "11px", fontWeight: 700,
            color: isPro ? "#10b981" : "#f59e0b",
            background: isPro ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
            border: `1px solid ${isPro ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
          }}>
            {isPro ? "Pro" : "Early Access"}
          </span>
        </div>
      </div>

      {/* Plan */}
      <div style={{ padding: "20px 24px", borderRadius: "14px", background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.08em", marginBottom: "12px" }}>PLAN</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#ededff" }}>{isPro ? "Veil Pro" : "Free Trial"}</div>
            <div style={{ fontSize: "13px", color: "#7878a8", marginTop: "2px" }}>
              {isPro ? "Unlimited access to all models and modes" : "1 free message per model · ₹199/month at launch"}
            </div>
          </div>
          {!isPro && (
            <a href="/pricing" style={{
              padding: "8px 18px", borderRadius: "9px",
              background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
              color: "#fff", fontSize: "13px", fontWeight: 700, textDecoration: "none",
            }}>Upgrade →</a>
          )}
        </div>
      </div>

      {/* Usage */}
      <div style={{ padding: "20px 24px", borderRadius: "14px", background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.08em", marginBottom: "16px" }}>MODELS TRIED</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {MODELS.map(m => {
            const Icon  = m.icon
            const tried = trialModelsUsed.includes(m.id)
            return (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon size={15} color={tried ? m.color : "#4a4a6a"} />
                  <span style={{ fontSize: "13.5px", color: tried ? "#ededff" : "#4a4a6a", fontWeight: tried ? 600 : 400 }}>{m.name}</span>
                </div>
                <span style={{
                  fontSize: "11px", fontWeight: 700,
                  color: tried ? "#10b981" : "#4a4a6a",
                  background: tried ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                  padding: "3px 10px", borderRadius: "100px",
                }}>{tried ? "✓ Tried" : "Not used"}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Usage stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        {[
          { label: "Sessions", value: sessions.length, icon: MessageSquare, color: "#8b5cf6" },
          { label: "Models unlocked", value: `${trialModelsUsed.length} / 4`, icon: Sparkles, color: "#10a37f" },
        ].map(s => (
          <div key={s.label} style={{ padding: "18px 20px", borderRadius: "12px", background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <s.icon size={18} color={s.color} style={{ marginBottom: "8px" }} />
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#ededff" }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#7878a8", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Referral */}
      <div style={{ padding: "20px 24px", borderRadius: "14px", background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.08em", marginBottom: "12px" }}>REFERRAL</div>
        <p style={{ fontSize: "13px", color: "#7878a8", marginBottom: "12px", lineHeight: 1.6 }}>Share your link — when a friend subscribes, you both get 1 week free.</p>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ flex: 1, padding: "9px 12px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12.5px", color: "#7878a8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {referralUrl}
          </div>
          <button onClick={copyRef} style={{ padding: "9px 16px", borderRadius: "9px", border: "none", cursor: "pointer", background: refCopied ? "rgba(16,185,129,0.15)" : "rgba(139,92,246,0.15)", color: refCopied ? "#10b981" : "#8b5cf6", fontSize: "13px", fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", gap: "6px" }}>
            {refCopied ? <Check size={13} /> : <Copy size={13} />} {refCopied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

      {/* Activity */}
      <div style={{ padding: "20px 24px", borderRadius: "14px", background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.08em", marginBottom: "16px" }}>ACCESS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: isPro ? 0 : "20px" }}>
          {["4 frontier AI models", "Research, Biology, Flywheel, Write modes", "Notebook, Hypothesis Builder, Papers", "Terminal, Workflows, Integrations"].map(item => (
            <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <Check size={13} color="#8b5cf6" style={{ marginTop: "3px", flexShrink: 0 }} />
              <span style={{ fontSize: "13.5px", color: "#7878a8" }}>{item}</span>
            </div>
          ))}
        </div>
        {!isPro && (
          <a href="/pricing" style={{ display: "inline-block", marginTop: "12px", padding: "9px 18px", borderRadius: "9px", background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", color: "#fff", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
            Upgrade to Pro →
          </a>
        )}
      </div>
    </div>
  )
}

// ─── API Access View ──────────────────────────────────────────────────────────

// ─── Visuals View ─────────────────────────────────────────────────────────────

function VisualsView({ accessToken }: { accessToken: string }) {
  const [query,   setQuery]   = useState("")
  const [domain,  setDomain]  = useState("mindmap")
  const [loading, setLoading] = useState(false)
  const [visual,  setVisual]  = useState<AnyViz | null>(null)

  const DOMAINS = [
    { id: "mindmap",   label: "Mind Map",  icon: "◉", color: "#8b5cf6" },
    { id: "flowchart", label: "Flowchart", icon: "⬡", color: "#3b82f6" },
    { id: "chart",     label: "Chart",     icon: "▦", color: "#10b981" },
    { id: "hologram",  label: "3D Hologram", icon: "⬡", color: "#00eeff" },
    { id: "particles", label: "Particles", icon: "✦", color: "#bf00ff" },
    { id: "physics",   label: "Physics",   icon: "◈", color: "#f59e0b" },
    { id: "function",  label: "Function",  icon: "∫", color: "#ec4899" },
  ]

  const EXAMPLES: Record<string, string[]> = {
    flowchart: ["How does bubble sort work?", "TCP handshake process", "User login authentication flow"],
    chart:     ["Python vs JS vs Rust popularity", "Cloud provider market share", "CPU vs GPU benchmarks"],
    hologram:  ["Show a 3D DNA double helix", "Visualize a neural network in 3D", "Show a rotating crystal hologram"],
    particles: ["Create a galaxy particle simulation", "Show a vortex particle field", "Visualize a nebula"],
    mindmap:   ["What is machine learning?", "Components of a neural network", "Quantum computing overview"],
    physics:   ["Projectile at 45 degrees", "Pendulum with 30° amplitude", "Wave interference"],
    function:  ["Plot sin(x) * cos(x/2)", "Sigmoid function", "Parabola y = x squared"],
  }

  async function generate(q = query) {
    if (!q.trim()) return
    setQuery(q); setLoading(true); setVisual(null)

    // Hologram and particles are fully client-side — pick the right shape from the query
    if (domain === "hologram") {
      const l = q.toLowerCase()
      const shape = l.includes("dna")||l.includes("helix") ? "dna" : l.includes("neural")||l.includes("network") ? "neural" : l.includes("crystal") ? "crystal" : l.includes("torus")||l.includes("donut") ? "torus" : l.includes("molecule")||l.includes("atom") ? "molecule" : "sphere"
      setVisual({ type:"hologram", shape, title: q } as AnyViz); setLoading(false); return
    }
    if (domain === "particles") {
      const l = q.toLowerCase()
      const pattern = l.includes("galaxy")||l.includes("spiral") ? "galaxy" : l.includes("vortex")||l.includes("spin") ? "vortex" : l.includes("wave") ? "wave" : l.includes("field")||l.includes("force") ? "field" : "nebula"
      setVisual({ type:"particles", pattern, title: q } as AnyViz); setLoading(false); return
    }
    const systemMsg = "You are a JSON-only visualization data generator. Your entire response must be a single valid JSON object. No text, no markdown, no explanation. Only the raw JSON."
    const fmts: Record<string, string> = {
      flowchart: `{"type":"mermaid","code":"graph TD\\n  A[Start] --> B{Decision}\\n  B -->|Yes| C[Action]\\n  B -->|No| D[Alt]\\n  C --> E[End]\\n  D --> E"}`,
      chart:     `{"type":"chart","chartType":"bar","title":"Title","labels":["A","B","C"],"datasets":[{"label":"Value","data":[42,71,28]}]}`,
      mindmap:   `{"type":"mindmap","center":"Topic","branches":[{"label":"B1","color":"#8b5cf6","items":["a","b"]},{"label":"B2","color":"#3b82f6","items":["c","d"]},{"label":"B3","color":"#10b981","items":["e","f"]}]}`,
      physics:   `{"type":"physics","scene":"projectile","params":{"angle":45,"velocity":30,"gravity":9.8}}`,
      function:  `{"type":"function","expression":"Math.sin(x)","xMin":-6.28,"xMax":6.28,"title":"f(x)"}`,
      hologram:  `{"type":"hologram","shape":"sphere","title":"3D Hologram"}`,
      particles: `{"type":"particles","pattern":"galaxy","title":"Particle Field"}`,
    }
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ messages: [{ role: "system", content: systemMsg }, { role: "user", content: `Topic: "${q}"\nGenerate a ${domain} visualization. Use REAL values, not placeholders.\nFormat: ${fmts[domain]}\nReturn ONLY the JSON.` }], model: "gpt-4o-mini", webSearch: false }),
      })
      if (!res.ok) return
      const reader = res.body!.getReader(); const decoder = new TextDecoder(); let raw = ""
      while (true) { const { done, value } = await reader.read(); if (done) break; raw += decoder.decode(value, { stream: true }) }
      const cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim()
      const s = cleaned.indexOf("{"); const e = cleaned.lastIndexOf("}")
      if (s !== -1 && e > s) setVisual(JSON.parse(cleaned.slice(s, e + 1)) as AnyViz)
    } catch { /* silent */ } finally { setLoading(false) }
  }

  const activeDomain = DOMAINS.find(d => d.id === domain)!

  return (
    <div className="visuals-view" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden", background: "#050508" }}>

      {/* ── Top controls bar ──────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: "12px" }}>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>✨</span>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#ededff", margin: 0 }}>Visual Engine</h2>
            <p style={{ fontSize: "12px", color: "#4a4a6a", margin: 0 }}>AI-generated diagrams, charts, and simulations</p>
          </div>
        </div>

        {/* Type pills — horizontal scroll */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px", scrollbarWidth: "none" }}>
          {DOMAINS.map(d => (
            <button key={d.id} onClick={() => setDomain(d.id)} style={{
              flexShrink: 0, display: "flex", alignItems: "center", gap: "5px",
              padding: "6px 14px", borderRadius: "100px", border: "none", cursor: "pointer",
              background: domain === d.id ? `${d.color}20` : "rgba(255,255,255,0.05)",
              outline: domain === d.id ? `1px solid ${d.color}50` : "none",
              fontSize: "12.5px", fontWeight: 600,
              color: domain === d.id ? d.color : "#7878a8",
            }}>
              <span style={{ fontSize: "13px" }}>{d.icon}</span> {d.label}
            </button>
          ))}
        </div>

        {/* Input + button row */}
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generate() } }}
            placeholder={`e.g. ${(EXAMPLES[domain] ?? [])[0] ?? "describe your topic…"}`}
            rows={2}
            style={{ flex: 1, padding: "10px 14px", borderRadius: "12px", boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: `1px solid ${activeDomain.color}30`, color: "#ededff", fontSize: "14px", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5 }}
          />
          <button
            onClick={() => generate()}
            disabled={loading || !query.trim()}
            style={{ flexShrink: 0, padding: "10px 20px", borderRadius: "12px", border: "none", cursor: query.trim() && !loading ? "pointer" : "not-allowed", background: query.trim() && !loading ? `linear-gradient(135deg,${activeDomain.color},#3b82f6)` : "rgba(255,255,255,0.06)", color: query.trim() && !loading ? "#fff" : "#4a4a6a", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", height: "100%" }}
          >
            <Sparkles size={14} /> {loading ? "…" : "Generate"}
          </button>
        </div>

        {/* Example chips */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {(EXAMPLES[domain] ?? []).map(ex => (
            <button key={ex} onClick={() => generate(ex)} style={{ padding: "4px 10px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", background: "rgba(255,255,255,0.03)", fontSize: "11.5px", color: "#7878a8", whiteSpace: "nowrap" }}>
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* ── Visual output ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: `3px solid ${activeDomain.color}30`, borderTop: `3px solid ${activeDomain.color}`, animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: "13px", color: "#7878a8" }}>Generating {activeDomain.label.toLowerCase()}…</p>
          </div>
        )}
        {!loading && !visual && (
          <div style={{ textAlign: "center", padding: "24px" }}>
            <div style={{ fontSize: "52px", marginBottom: "12px" }}>{activeDomain.icon}</div>
            <p style={{ fontSize: "16px", fontWeight: 800, color: "#ededff", marginBottom: "6px" }}>{activeDomain.label}</p>
            <p style={{ fontSize: "13px", color: "#7878a8", maxWidth: "280px" }}>
              Type a topic above or click an example to generate
            </p>
          </div>
        )}
        {!loading && visual && (
          <Suspense fallback={<div />}>
            <div style={{ width: "100%", height: "100%" }}>
              <VisualPanel visual={visual} onClose={() => setVisual(null)} />
            </div>
          </Suspense>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .visuals-view [style*="scrollbar-width"]::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

function ApiAccessView({ accessToken }: { accessToken: string }) {
  const [apiKey,    setApiKey]    = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [keyCopied, setKeyCopied] = useState(false)

  const generate = async () => {
    setLoading(true)
    // Use the Supabase access token as the API key (signed by Supabase, verifiable server-side)
    // In production you'd generate a long-lived JWT or store a custom key
    await new Promise(r => setTimeout(r, 600))
    setApiKey(`veil_sk_${accessToken.slice(0, 32)}`)
    setLoading(false)
  }

  function copyKey() { if (!apiKey) return; navigator.clipboard.writeText(apiKey).catch(()=>{}); setKeyCopied(true); setTimeout(()=>setKeyCopied(false), 2000) }

  const ENDPOINTS = [
    { method: "POST", path: "/api/chat",    desc: "Send a message, stream response" },
    { method: "GET",  path: "/api/sessions", desc: "List your saved sessions" },
    { method: "POST", path: "/api/search",  desc: "Live web search via Tavily" },
    { method: "POST", path: "/api/upload",  desc: "Upload a file and extract text" },
  ]

  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%", maxWidth: "720px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff", marginBottom: "6px" }}>API Access</h2>
      <p style={{ fontSize: "13.5px", color: "#7878a8", marginBottom: "28px" }}>Use Veil programmatically. Pass your API key as a Bearer token in the Authorization header.</p>

      {/* Key generator */}
      <div style={{ padding: "20px 24px", borderRadius: "14px", background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.08em", marginBottom: "16px" }}>YOUR API KEY</div>
        {!apiKey ? (
          <button onClick={generate} disabled={loading} style={{ padding: "10px 22px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
            {loading ? "Generating…" : "Generate API Key"}
          </button>
        ) : (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <code style={{ flex: 1, padding: "10px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12px", color: "#10b981", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {apiKey}
            </code>
            <button onClick={copyKey} style={{ padding: "10px 16px", borderRadius: "9px", border: "none", cursor: "pointer", background: keyCopied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)", color: keyCopied ? "#10b981" : "#7878a8", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>
              {keyCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
        <p style={{ fontSize: "12px", color: "#4a4a6a", marginTop: "10px" }}>Keep this secret. Treat it like a password.</p>
      </div>

      {/* Usage example */}
      <div style={{ padding: "20px 24px", borderRadius: "14px", background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.08em", marginBottom: "14px" }}>EXAMPLE REQUEST</div>
        <pre style={{ background: "rgba(0,0,0,0.4)", borderRadius: "10px", padding: "16px", fontSize: "12px", color: "#ededff", overflowX: "auto", lineHeight: 1.7, margin: 0 }}>{`POST https://veilresearch.com/api/chat
Authorization: Bearer veil_sk_...
Content-Type: application/json

{
  "model": "gpt-4o",
  "messages": [{ "role": "user", "content": "Explain AlphaFold" }],
  "webSearch": false
}`}</pre>
      </div>

      {/* Endpoints */}
      <div style={{ padding: "20px 24px", borderRadius: "14px", background: "rgba(15,15,28,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.08em", marginBottom: "14px" }}>AVAILABLE ENDPOINTS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {ENDPOINTS.map(e => (
            <div key={e.path} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.03)" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: e.method === "POST" ? "#8b5cf6" : "#10b981", background: e.method === "POST" ? "rgba(139,92,246,0.12)" : "rgba(16,185,129,0.12)", padding: "3px 8px", borderRadius: "5px", flexShrink: 0 }}>{e.method}</span>
              <code style={{ fontSize: "12.5px", color: "#ededff", fontFamily: "monospace" }}>{e.path}</code>
              <span style={{ fontSize: "12px", color: "#7878a8", marginLeft: "auto" }}>{e.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Terminal View ────────────────────────────────────────────────────────────

function TerminalView() {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const termRef   = useRef<any>(null)
  const pasteRef  = useRef<(text: string) => void>(() => {})
  const [copyFeedback, setCopyFeedback] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    let disposed = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let termInstance: any = null
    let resizeObs: ResizeObserver | null = null

    let cwd = "/home/user"
    let lineBuffer = ""
    const historyList: string[] = []
    let historyIdx = 0
    let pythonMode = false

    const vfs: Record<string, Record<string, string | null>> = {
      "/home/user":                          { research: null, datasets: null, models: null, ".veilrc": "" },
      "/home/user/research":                 { papers: null, experiments: null },
      "/home/user/research/papers":          { "attention.pdf": "", "alphafold.pdf": "" },
      "/home/user/research/experiments":     { "run.py": "", "results.json": "" },
      "/home/user/datasets":                 { "pubmed.csv": "", "proteins.fasta": "" },
      "/home/user/models":                   { "llama_ft.ckpt": "" },
    }

    const fileContents: Record<string, string> = {
      "/home/user/.veilrc":
        "VEIL_MODE=research\nVEIL_COMPUTE=cpu-free",
      "/home/user/research/experiments/run.py":
        "import torch\nimport torch.nn as nn\n\nmodel = nn.Linear(128, 10)\nprint(\"Model ready:\", model)",
      "/home/user/research/experiments/results.json":
        '{\n  "accuracy": 0.874,\n  "loss": 0.231,\n  "epochs": 10\n}',
    }

    const promptStr = () => {
      const rel = cwd.replace("/home/user", "~")
      return `\x1b[1;32muser\x1b[0m\x1b[90m@veil\x1b[0m:\x1b[1;34m${rel}\x1b[0m$ `
    }

    const resolvePath = (p: string): string => {
      if (p === "~") return "/home/user"
      if (p.startsWith("~/")) return "/home/user/" + p.slice(2)
      if (p.startsWith("/")) return p
      if (p === "..") { const parts = cwd.split("/"); parts.pop(); return parts.join("/") || "/" }
      if (p === ".") return cwd
      return cwd + "/" + p
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function processCommand(term: any, input: string) {
      const parts = input.trim().split(/\s+/)
      const cmd = parts[0]
      const args = parts.slice(1)

      switch (cmd) {
        case "help": {
          const cmds: [string, string][] = [
            ["ls [-la]",    "list directory contents"],
            ["cd <dir>",    "change directory"],
            ["pwd",         "print working directory"],
            ["cat <file>",  "show file contents"],
            ["echo <text>", "print text"],
            ["python3",     "start Python 3.11 REPL"],
            ["pip list",    "show installed packages"],
            ["env",         "print environment variables"],
            ["whoami",      "print current user"],
            ["date",        "print current date/time"],
            ["history",     "show command history"],
            ["clear",       "clear the screen"],
          ]
          term.writeln("")
          term.writeln("\x1b[1;35m  Veil Research Terminal\x1b[0m  \x1b[90mv1.0 · CPU Session (Free)\x1b[0m")
          term.writeln("")
          cmds.forEach(([c, d]) =>
            term.writeln(`  \x1b[1;32m${c.padEnd(18)}\x1b[0m  \x1b[90m${d}\x1b[0m`)
          )
          term.writeln("")
          break
        }
        case "pwd":    term.writeln(cwd); break
        case "whoami": term.writeln("user"); break
        case "date":   term.writeln(new Date().toString()); break
        case "clear":  term.clear(); break

        case "history":
          historyList.forEach((h, i) =>
            term.writeln(`  \x1b[90m${String(i + 1).padStart(4)}\x1b[0m  ${h}`)
          )
          break

        case "env":
          ["VEIL_MODE=research", "VEIL_COMPUTE=cpu-free", "HOME=/home/user",
           "USER=user", "SHELL=/bin/bash", "PYTHON_VERSION=3.11.0", "CUDA_AVAILABLE=false"]
            .forEach(v => term.writeln(v))
          break

        case "ls": {
          const showHidden = args.some(a => a.includes("a"))
          const longFmt    = args.some(a => a.includes("l"))
          const target     = args.find(a => !a.startsWith("-"))
          const path       = target ? resolvePath(target) : cwd
          const dir        = vfs[path]
          if (!dir) { term.writeln(`\x1b[31mls: ${target ?? "."}: No such file or directory\x1b[0m`); break }
          const entries = Object.entries(dir).filter(([n]) => showHidden || !n.startsWith("."))
          if (longFmt) {
            term.writeln(`\x1b[90mtotal ${entries.length * 4}\x1b[0m`)
            entries.forEach(([name, type]) => {
              const isDir = type === null
              term.writeln(
                `\x1b[90mdrwxr-xr-x  1 user user ${(isDir ? "4096" : "1024").padStart(6)}  May  2 12:00\x1b[0m  ` +
                (isDir ? `\x1b[1;34m${name}/\x1b[0m` : name)
              )
            })
          } else {
            term.writeln(
              entries.map(([n, t]) => t === null ? `\x1b[1;34m${n}/\x1b[0m` : n).join("  ")
              || "\x1b[90m(empty)\x1b[0m"
            )
          }
          break
        }

        case "cd": {
          const target  = args[0] ?? "~"
          const newPath = resolvePath(target)
          if (vfs[newPath] !== undefined) { cwd = newPath }
          else term.writeln(`\x1b[31mcd: ${target}: No such directory\x1b[0m`)
          break
        }

        case "cat": {
          if (!args[0]) { term.writeln("\x1b[31mcat: missing file operand\x1b[0m"); break }
          const path    = resolvePath(args[0])
          const content = fileContents[path]
          if (content !== undefined) {
            content.split("\n").forEach(l => term.writeln(l))
          } else {
            const dirEntry = vfs[cwd]
            if (dirEntry && args[0] in dirEntry && dirEntry[args[0]] !== null)
              term.writeln(`\x1b[90m[Binary file — ${args[0]}]\x1b[0m`)
            else
              term.writeln(`\x1b[31mcat: ${args[0]}: No such file or directory\x1b[0m`)
          }
          break
        }

        case "echo":
          term.writeln(args.join(" "))
          break

        case "python":
        case "python3":
          pythonMode = true
          term.writeln("\x1b[1;33mPython 3.11.0\x1b[0m \x1b[90m(Veil Research Runtime)\x1b[0m")
          term.writeln("\x1b[90mType exit() or quit() to return to shell.\x1b[0m")
          term.write(">>> ")
          break

        case "pip":
          if (args[0] === "list") {
            const pkgs: [string, string][] = [
              ["torch","2.1.0"],["transformers","4.35.0"],["numpy","1.26.0"],
              ["pandas","2.1.0"],["scikit-learn","1.3.0"],["matplotlib","3.8.0"],
              ["biopython","1.81"],["datasets","2.14.0"],["accelerate","0.24.0"],["wandb","0.16.0"],
            ]
            term.writeln("\x1b[90mPackage            Version\x1b[0m")
            term.writeln("\x1b[90m------------------ -------\x1b[0m")
            pkgs.forEach(([p, v]) => term.writeln(`${p.padEnd(20)} ${v}`))
          } else {
            term.writeln("\x1b[90mUsage: pip list\x1b[0m")
          }
          break

        case "mkdir":
          if (!args[0]) { term.writeln("\x1b[31mmkdir: missing operand\x1b[0m"); break }
          vfs[cwd + "/" + args[0]] = {}
          vfs[cwd][args[0]] = null
          break

        default:
          term.writeln(`\x1b[31m${cmd}: command not found\x1b[0m \x1b[90m(try 'help')\x1b[0m`)
      }

      if (!pythonMode) term.write(promptStr())
    }

    async function setup() {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import("@xterm/xterm"),
        import("@xterm/addon-fit"),
      ])
      if (disposed || !containerRef.current) return

      const term = new Terminal({
        theme: {
          background: "#050508", foreground: "#ededff",
          cursor: "#8b5cf6", cursorAccent: "#050508",
          selectionBackground: "rgba(139,92,246,0.3)",
          black: "#0a0a12", brightBlack: "#4a4a6a",
          red: "#ef4444", brightRed: "#f87171",
          green: "#10b981", brightGreen: "#34d399",
          yellow: "#f59e0b", brightYellow: "#fbbf24",
          blue: "#3b82f6", brightBlue: "#60a5fa",
          magenta: "#8b5cf6", brightMagenta: "#a78bfa",
          cyan: "#06b6d4", brightCyan: "#22d3ee",
          white: "#ededff", brightWhite: "#ffffff",
        },
        fontFamily: '"JetBrains Mono","Fira Code","Cascadia Code",Menlo,monospace',
        fontSize: 13, lineHeight: 1.5,
        cursorBlink: true, cursorStyle: "block",
        scrollback: 1000,
      })

      const fit = new FitAddon()
      term.loadAddon(fit)
      term.open(containerRef.current)
      fit.fit()
      termInstance = term
      termRef.current = term
      pasteRef.current = (text: string) => {
        const sanitized = text.replace(/\r?\n|\r/g, " ")
        lineBuffer += sanitized
        term.write(sanitized)
      }

      term.writeln("\x1b[1;35m  Veil Research Terminal\x1b[0m  \x1b[90mv1.0 · CPU Session (Free)\x1b[0m")
      term.writeln("\x1b[90m  Type \x1b[0m\x1b[1;32mhelp\x1b[0m\x1b[90m to see available commands.\x1b[0m")
      term.writeln("")
      term.write(promptStr())

      term.onKey(({ key, domEvent }: { key: string; domEvent: KeyboardEvent }) => {
        const code = domEvent.keyCode

        if (pythonMode) {
          if (code === 13) {
            term.writeln("")
            const line = lineBuffer.trim()
            lineBuffer = ""
            if (line === "exit()" || line === "quit()") {
              pythonMode = false
              term.writeln("\x1b[90m[Python REPL exited]\x1b[0m")
              term.write(promptStr())
            } else if (!line) {
              term.write(">>> ")
            } else {
              try {
                if (/^[\d\s+\-*/().]+$/.test(line)) {
                  // eslint-disable-next-line no-eval
                  const result = eval(line)
                  term.writeln(`\x1b[36m${result}\x1b[0m`)
                } else if (/^print\((.+)\)$/.test(line)) {
                  const m = line.match(/^print\((.+)\)$/)!
                  term.writeln(m[1].replace(/^['"`]|['"`]$/g, ""))
                } else if (line.startsWith("import ") || line.startsWith("from ")) {
                  term.writeln("\x1b[90m[Module loaded]\x1b[0m")
                } else {
                  term.writeln("\x1b[90m[Executed]\x1b[0m")
                }
              } catch {
                term.writeln("\x1b[31mSyntaxError: invalid syntax\x1b[0m")
              }
              term.write(">>> ")
            }
          } else if (code === 8 && lineBuffer.length > 0) {
            lineBuffer = lineBuffer.slice(0, -1)
            term.write("\b \b")
          } else if (domEvent.ctrlKey && !domEvent.shiftKey && domEvent.key === "v") {
            navigator.clipboard.readText().then(t => { if (t) pasteRef.current(t) }).catch(() => {})
          } else if (domEvent.ctrlKey && domEvent.shiftKey && domEvent.key === "C") {
            const sel = term.getSelection()
            if (sel) navigator.clipboard.writeText(sel).catch(() => {})
          } else if (key.length === 1 && !domEvent.ctrlKey) {
            lineBuffer += key
            term.write(key)
          }
          return
        }

        if (code === 13) {
          term.writeln("")
          const cmd = lineBuffer.trim()
          lineBuffer = ""
          historyIdx = historyList.length
          if (cmd) { historyList.push(cmd); historyIdx = historyList.length; processCommand(term, cmd) }
          else term.write(promptStr())
        } else if (code === 8) {
          if (lineBuffer.length > 0) { lineBuffer = lineBuffer.slice(0, -1); term.write("\b \b") }
        } else if (code === 38) {
          if (historyIdx > 0) {
            historyIdx--
            const prev = historyList[historyIdx] ?? ""
            term.write("\r" + promptStr() + " ".repeat(lineBuffer.length) + "\r" + promptStr() + prev)
            lineBuffer = prev
          }
        } else if (code === 40) {
          if (historyIdx < historyList.length) {
            historyIdx++
            const next = historyList[historyIdx] ?? ""
            term.write("\r" + promptStr() + " ".repeat(lineBuffer.length) + "\r" + promptStr() + next)
            lineBuffer = next
          }
        } else if (domEvent.ctrlKey && domEvent.key === "l") {
          term.clear(); term.write(promptStr())
        } else if (domEvent.ctrlKey && !domEvent.shiftKey && domEvent.key === "c") {
          term.writeln("^C"); lineBuffer = ""
          pythonMode = false
          term.write(promptStr())
        } else if (domEvent.ctrlKey && !domEvent.shiftKey && domEvent.key === "v") {
          navigator.clipboard.readText().then(t => { if (t) pasteRef.current(t) }).catch(() => {})
        } else if (domEvent.ctrlKey && domEvent.shiftKey && domEvent.key === "C") {
          const sel = term.getSelection()
          if (sel) navigator.clipboard.writeText(sel).catch(() => {})
        } else if (key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey) {
          lineBuffer += key; term.write(key)
        }
      })

      resizeObs = new ResizeObserver(() => { try { fit.fit() } catch { /* ignore */ } })
      resizeObs.observe(containerRef.current!)
    }

    setup()

    return () => {
      disposed = true
      resizeObs?.disconnect()
      termInstance?.dispose()
    }
  }, [])

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#050508" }}>
      <div style={{
        padding: "10px 16px", flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: "12px",
        background: "rgba(10,10,18,0.9)",
      }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {(["#ef4444", "#f59e0b", "#10b981"] as const).map(c => (
            <div key={c} style={{ width: "11px", height: "11px", borderRadius: "50%", background: c, opacity: 0.8 }} />
          ))}
        </div>
        <span style={{
          fontSize: "12px", color: "#4a4a6a",
          fontFamily: '"JetBrains Mono","Fira Code",monospace',
          flex: 1, textAlign: "center",
        }}>
          user@veil — CPU Session (Free)
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => {
              const sel = termRef.current?.getSelection()
              if (sel) {
                navigator.clipboard.writeText(sel).then(() => {
                  setCopyFeedback(true)
                  setTimeout(() => setCopyFeedback(false), 1500)
                }).catch(() => {})
              }
            }}
            title="Copy selection (Ctrl+Shift+C)"
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "3px 9px", borderRadius: "6px", border: "none", cursor: "pointer",
              background: copyFeedback ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
              color: copyFeedback ? "#10b981" : "#7878a8", fontSize: "11px", fontWeight: 600,
            }}
          >
            {copyFeedback ? <Check size={11} /> : <Copy size={11} />}
            {copyFeedback ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.readText().then(t => { if (t) pasteRef.current(t) }).catch(() => {})
            }}
            title="Paste (Ctrl+V)"
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "3px 9px", borderRadius: "6px", border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.06)", color: "#7878a8", fontSize: "11px", fontWeight: 600,
            }}
          >
            <Clipboard size={11} /> Paste
          </button>
        </div>
      </div>
      <div ref={containerRef} style={{ flex: 1, minHeight: 0, padding: "4px 4px 0" }} />
    </div>
  )
}

// ─── Papers View ─────────────────────────────────────────────────────────────

function PapersView() {
  const [query,    setQuery]    = useState("")
  const [results,  setResults]  = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)
  const [label,    setLabel]    = useState("Trending in AI & ML")

  const fetchPapers = async (url: string, sectionLabel: string) => {
    setLoading(true)
    setSearched(true)
    try {
      const res  = await fetch(url)
      const data = await res.json()
      setResults(data.results ?? [])
      setLabel(sectionLabel)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Auto-load trending AI/ML papers on mount
  useEffect(() => {
    fetchPapers(`/api/papers?q=large+language+model&sort=cited_by_count:desc`, "Trending in AI & ML")
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    setLabel(`Results for "${query}"`)
    try {
      const res  = await fetch(`/api/papers?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "28px", overflowY: "auto", height: "100%" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ededff", marginBottom: "6px" }}>Papers</h2>
        <p style={{ fontSize: "13.5px", color: "#7878a8" }}>
          Search academic papers via OpenAlex — 250M+ open-access works.
        </p>
      </div>

      {/* Search bar */}
      <div style={{
        display: "flex", gap: "10px", marginBottom: "28px",
      }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={15}
            color="#4a4a6a"
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") search() }}
            placeholder="Search papers, e.g. &quot;attention is all you need&quot;"
            style={{
              width: "100%", padding: "11px 14px 11px 40px", borderRadius: "12px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#ededff", fontSize: "14px", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          onClick={search}
          disabled={loading || !query.trim()}
          style={{
            padding: "11px 22px", borderRadius: "12px", border: "none",
            background: query.trim() && !loading
              ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
              : "rgba(255,255,255,0.08)",
            color: query.trim() && !loading ? "#fff" : "#4a4a6a",
            fontSize: "14px", fontWeight: 700, cursor: query.trim() && !loading ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", gap: "7px", flexShrink: 0,
          }}
        >
          <Search size={14} />
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "60px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            border: "3px solid rgba(59,130,246,0.3)",
            borderTop: "3px solid #3b82f6",
            animation: "spin 1s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div style={{ textAlign: "center", paddingTop: "60px", color: "#7878a8" }}>
          <Search size={32} color="#4a4a6a" style={{ marginBottom: "14px" }} />
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#ededff", marginBottom: "6px" }}>No papers found</p>
          <p style={{ fontSize: "13.5px" }}>Try different keywords or check your spelling.</p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#4a4a6a", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: "4px" }}>{label}</div>
          {results.map((paper: any, i: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            const authors: string[] = (paper.authorships ?? [])
              .slice(0, 2)
              .map((a: any) => a?.author?.display_name ?? "Unknown") // eslint-disable-line @typescript-eslint/no-explicit-any
            const hasMore    = (paper.authorships ?? []).length > 2
            const authorStr  = hasMore ? authors.join(", ") + " et al." : authors.join(", ")
            const journal    = paper.primary_location?.source?.display_name ?? null
            const year       = paper.publication_year
            const doi        = paper.doi
            const href       = doi ? `https://doi.org/${doi.replace("https://doi.org/", "")}` : null
            const title      = paper.title ?? "Untitled"

            return (
              <div
                key={i}
                style={{
                  padding: "20px", borderRadius: "12px",
                  background: "rgba(15,15,28,0.8)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", flexDirection: "column", gap: "10px",
                  borderLeft: "3px solid #3b82f6",
                }}
              >
                {/* Title */}
                <div>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "14.5px", fontWeight: 700, color: "#ededff",
                        textDecoration: "none", lineHeight: 1.5,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#3b82f6")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#ededff")}
                    >
                      {title}
                    </a>
                  ) : (
                    <span style={{ fontSize: "14.5px", fontWeight: 700, color: "#ededff", lineHeight: 1.5 }}>
                      {title}
                    </span>
                  )}
                </div>

                {/* Meta row */}
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  {year && (
                    <span style={{
                      padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 700,
                      color: "#3b82f6", background: "rgba(59,130,246,0.12)",
                      border: "1px solid rgba(59,130,246,0.25)",
                    }}>
                      {year}
                    </span>
                  )}
                  {authorStr && (
                    <span style={{ fontSize: "12.5px", color: "#7878a8" }}>{authorStr}</span>
                  )}
                  {journal && (
                    <span style={{
                      fontSize: "12px", color: "#4a4a6a", fontStyle: "italic",
                    }}>
                      {journal}
                    </span>
                  )}
                </div>

                {/* DOI link */}
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "12px", color: "#3b82f6", textDecoration: "none",
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      width: "fit-content",
                    }}
                  >
                    <Globe size={11} /> {doi}
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter()
  const [authLoading,      setAuthLoading]      = useState(true)
  const [userEmail,        setUserEmail]        = useState("")
  const [isPro,            setIsPro]            = useState(false)
  const [trialModelsUsed,  setTrialModelsUsed]  = useState<string[]>([])
  const [activeMode,       setActiveMode]       = useState("research")
  const [view,             setView]             = useState<View>("sessions")
  const [connected,        setConnected]        = useState<Record<string, boolean>>({})
  const [unreadCount,      setUnreadCount]      = useState(MOCK_NOTIFS.filter(n => !n.read).length)
  const [sidebarOpen,      setSidebarOpen]      = useState(false)
  const [showKeyboard,     setShowKeyboard]     = useState(false)
  const [accessToken,      setAccessToken]      = useState("")
  const [starterPrompt,    setStarterPrompt]    = useState<string | undefined>(undefined)
  const [sessions,         setSessions]         = useState<SessionMeta[]>([])
  const [activeSessionId,  setActiveSessionId]  = useState<string | null>(null)
  const [sessionsLoading,  setSessionsLoading]  = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push("/login?next=/dashboard"); return }
      const token = session.access_token
      setAccessToken(token)
      setUserEmail(session.user.email ?? "")
      const res = await fetch("/api/subscription/status", {
        headers: { "Authorization": `Bearer ${token}` },
      })
      const d = await res.json()
      setIsPro(d.status === "active")
      setTrialModelsUsed(d.trialModelsUsed ?? [])
      setAuthLoading(false)
      // Load sessions
      setSessionsLoading(true)
      fetch("/api/sessions", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : [])
        .then((data: SessionMeta[]) => {
          setSessions(data)
          if (data.length > 0) setActiveSessionId(data[0].id)
        })
        .catch(() => {})
        .finally(() => setSessionsLoading(false))
    })
  }, [router])

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key === "?") { e.preventDefault(); setShowKeyboard(k => !k) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  if (authLoading) return (
    <div style={{ height: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#050508" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "3px solid rgba(139,92,246,0.3)", borderTop: "3px solid #8b5cf6", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const mode = MODES.find(m => m.id === activeMode)!
  const ModeIcon = mode.icon

  async function dashCreateSession(): Promise<string | null> {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ title: "New Session", model: "gpt-4o-mini" }),
    })
    if (!res.ok) return null
    const s: SessionMeta = await res.json()
    setSessions(prev => [s, ...prev])
    setActiveSessionId(s.id)
    return s.id
  }

  async function dashDeleteSession(id: string) {
    await fetch(`/api/sessions/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } })
    setSessions(prev => {
      const remaining = prev.filter(s => s.id !== id)
      if (activeSessionId === id) setActiveSessionId(remaining.length > 0 ? remaining[0].id : null)
      return remaining
    })
  }

  const NAV = [
    { id: "sessions",      label: "Sessions",     icon: Terminal       },
    { id: "workflows",     label: "Workflows",    icon: Zap            },
    { id: "papers",        label: "Papers",       icon: Search         },
    { id: "notebook",      label: "Notebook",     icon: FileText       },
    { id: "hypothesis",    label: "Hypothesis",   icon: Lightbulb      },
    { id: "integrations",  label: "Integrations", icon: GitBranch      },
    { id: "evaluations",   label: "Evaluations",  icon: BarChart3      },
    { id: "terminal",      label: "Terminal",     icon: TerminalSquare },
  ] as const

  const BOTTOM_NAV = [
    { id: "api-access",    label: "API Access",    icon: Link2,    badge: 0 },
    { id: "settings",      label: "Settings",      icon: Settings, badge: 0 },
    { id: "notifications", label: "Notifications", icon: Bell,     badge: unreadCount },
    { id: "profile",       label: "Profile",       icon: User,     badge: 0 },
  ] as const

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", background: "#050508", overflow: "hidden", position: "relative" }}>

      {/* Sidebar backdrop — mobile only */}
      {sidebarOpen && (
        <div className="veil-backdrop" onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 199,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)",
        }} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`veil-aside${sidebarOpen ? " open" : ""}`} style={{
        width: "220px", flexShrink: 0,
        background: "rgba(8,8,16,0.98)", backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex", flexDirection: "column", padding: "16px 12px",
      }}>
        {/* Sidebar header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", paddingLeft: "6px" }}>
          <span style={{ fontSize: "15px", fontWeight: 800, color: "#ededff", letterSpacing: "-0.02em" }}>
            Veil<span style={{ color: "#8b5cf6" }}>.</span>
          </span>
          <button className="veil-close-btn" onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a4a6a", padding: "4px", display: "flex", alignItems: "center" }}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Main nav */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.1em", marginBottom: "8px", paddingLeft: "6px" }}>WORKSPACE</div>

            {NAV.map(item => {
              const Icon   = item.icon
              const active = view === item.id
              return (
                <button key={item.id} onClick={() => { setView(item.id as View); setSidebarOpen(false) }} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "9px",
                  padding: "8px 10px", borderRadius: "9px", border: "none",
                  marginBottom: "2px", cursor: "pointer", textAlign: "left",
                  fontSize: "13px", fontWeight: active ? 700 : 500,
                  color: active ? "#ededff" : "#7878a8",
                  background: active ? "rgba(255,255,255,0.07)" : "transparent",
                }}>
                  <Icon size={14} color={active ? "#ededff" : "#4a4a6a"} />
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Sessions */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", paddingLeft: "6px" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#4a4a6a", letterSpacing: "0.1em" }}>SESSIONS</span>
              <button onClick={() => { dashCreateSession(); setView("sessions"); setSidebarOpen(false) }} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a4a6a", padding: "2px 4px", borderRadius: "4px", display: "flex", alignItems: "center" }} title="New session">
                <Plus size={12} />
              </button>
            </div>
            {sessionsLoading && <div style={{ fontSize: "12px", color: "#4a4a6a", padding: "4px 10px" }}>Loading…</div>}
            {!sessionsLoading && sessions.length === 0 && (
              <div style={{ fontSize: "12px", color: "#4a4a6a", padding: "4px 10px" }}>No sessions yet</div>
            )}
            {sessions.slice(0, 20).map(s => (
              <div key={s.id} style={{ position: "relative", marginBottom: "1px" }} className="sess-row">
                <button onClick={() => { setActiveSessionId(s.id); setView("sessions"); setSidebarOpen(false) }} style={{
                  width: "100%", padding: "8px 28px 8px 10px", borderRadius: "8px", border: "none", textAlign: "left", cursor: "pointer",
                  background: activeSessionId === s.id ? "rgba(139,92,246,0.12)" : "transparent",
                  outline: activeSessionId === s.id ? "1px solid rgba(139,92,246,0.2)" : "none",
                }}>
                  <div style={{ fontSize: "12.5px", fontWeight: 600, color: activeSessionId === s.id ? "#ededff" : "#9898b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  <div style={{ fontSize: "10.5px", color: "#4a4a6a", marginTop: "1px" }}>{timeAgo(s.updated_at)}</div>
                </button>
                <button onClick={e => { e.stopPropagation(); dashDeleteSession(s.id) }} className="sess-del" style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "3px", color: "#4a4a6a", opacity: 0 }}>
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom nav */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
          {BOTTOM_NAV.map(item => {
            const Icon   = item.icon
            const active = view === item.id
            return (
              <button key={item.id} onClick={() => {
                setView(item.id as View)
                if (item.id === "notifications") setUnreadCount(0)
                setSidebarOpen(false)
              }} style={{
                width: "100%", display: "flex", alignItems: "center", gap: "9px",
                padding: "8px 10px", borderRadius: "9px", border: "none",
                marginBottom: "2px", cursor: "pointer", textAlign: "left",
                fontSize: "13px", fontWeight: active ? 700 : 500,
                color: active ? "#ededff" : "#7878a8",
                background: active ? "rgba(255,255,255,0.07)" : "transparent",
                position: "relative",
              }}>
                <Icon size={14} color={active ? "#ededff" : "#4a4a6a"} />
                {item.label}
                {item.badge > 0 && (
                  <span style={{
                    marginLeft: "auto", minWidth: "18px", height: "18px", borderRadius: "9px",
                    background: "#8b5cf6", fontSize: "10px", fontWeight: 700, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px",
                  }}>{item.badge}</span>
                )}
              </button>
            )
          })}
          {/* Keyboard shortcut hint */}
          <button onClick={() => setShowKeyboard(true)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "9px", border: "none", marginTop: "4px", cursor: "pointer", background: "transparent", fontSize: "12px", color: "#4a4a6a" }}>
            <Keyboard size={13} color="#4a4a6a" /> Shortcuts
            <kbd style={{ marginLeft: "auto", padding: "1px 5px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "10px", color: "#4a4a6a" }}>⌘?</kbd>
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{
          padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(8,8,16,0.8)", backdropFilter: "blur(12px)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Hamburger — always visible */}
            <button
              className="veil-hamburger"
              onClick={() => setSidebarOpen(o => !o)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", display: "flex", flexDirection: "column", gap: "4px", alignItems: "center", borderRadius: "8px" }}
            >
              <span style={{ display: "block", width: "18px", height: "2px", background: "#7878a8", borderRadius: "1px" }} />
              <span style={{ display: "block", width: "18px", height: "2px", background: "#7878a8", borderRadius: "1px" }} />
              <span style={{ display: "block", width: "18px", height: "2px", background: "#7878a8", borderRadius: "1px" }} />
            </button>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#ededff", textTransform: "capitalize" }}>
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isPro && (
              <span style={{
                padding: "4px 12px", borderRadius: "100px", fontSize: "11.5px", fontWeight: 700,
                color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
              }}>Pro</span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "30px", height: "30px", borderRadius: "9px",
                background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 800, color: "#fff", flexShrink: 0,
              }}>{userEmail.slice(0, 2).toUpperCase()}</div>
              <span style={{
                fontSize: "13px", color: "#ededff", fontWeight: 500, maxWidth: "180px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{userEmail}</span>
            </div>
          </div>
        </div>

        {/* View content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {view === "sessions"     && <SessionsView trialModelsUsed={trialModelsUsed} isPro={isPro} userEmail={userEmail} accessToken={accessToken} starterPrompt={starterPrompt} onStarterConsumed={() => setStarterPrompt(undefined)} sessions={sessions} activeId={activeSessionId} onSetActiveId={setActiveSessionId} onCreateSession={dashCreateSession} onUpdateSessions={setSessions} />}
          {view === "workflows"    && <WorkflowsView onLaunch={(prompt) => { setStarterPrompt(prompt); setView("sessions") }} />}
          {view === "integrations" && <IntegrationsView connected={connected} setConnected={setConnected} />}
          {view === "compute"      && <ComputeView />}
          {view === "evaluations"  && <EvaluationsView />}
          {view === "papers"       && <PapersView />}
          {view === "notebook"     && <NotebookView />}
          {view === "hypothesis"   && <HypothesisView accessToken={accessToken} />}
          {view === "terminal"     && <TerminalView />}
          {view === "settings"     && <SettingsView email={userEmail} />}
          {view === "notifications"&& <NotificationsView />}
          {view === "profile"      && <ProfileView email={userEmail} trialModelsUsed={trialModelsUsed} isPro={isPro} sessions={sessions} />}
          {view === "api-access"   && <ApiAccessView accessToken={accessToken} />}
          {view === "visuals"      && <VisualsView accessToken={accessToken} />}
        </div>
      </div>
      {showKeyboard && <KeyboardModal onClose={() => setShowKeyboard(false)} />}
      <style>{`
        /* Session delete btn on hover */
        .sess-row:hover .sess-del { opacity: 1 !important; }

        /* ── Desktop: sidebar always visible, in-flow ── */
        @media (min-width: 768px) {
          .veil-aside {
            position: relative !important;
            top: auto !important;
            height: 100% !important;
            transform: none !important;
            transition: none !important;
            z-index: auto !important;
          }
          .veil-hamburger { display: none !important; }
          .veil-backdrop   { display: none !important; }
          .veil-close-btn  { display: none !important; }
        }

        /* ── Mobile: sidebar overlay + responsive fixes ── */
        @media (max-width: 767px) {
          /* Sidebar overlay */
          .veil-aside {
            position: fixed !important;
            left: 0 !important; top: 0 !important;
            height: 100vh !important;
            z-index: 200 !important;
            transform: translateX(-100%) !important;
            transition: transform 0.22s cubic-bezier(0.4,0,0.2,1) !important;
          }
          .veil-aside.open { transform: translateX(0) !important; }

          /* Prevent iOS zoom on input focus */
          textarea, input[type="text"], input[type="email"] { font-size: 16px !important; }

          /* Message bubbles — wider on mobile */
          .msg-bubble { max-width: 88% !important; }

          /* Hide pill text labels on mobile */
          .pill-label { display: none !important; }

          /* ── Empty state mobile: Perplexity layout ── */

          /* Outer container: space-between so heading is above, input below */
          .hero-center {
            justify-content: space-between !important;
            padding: 0 !important;
            overflow-y: auto !important;
          }

          /* Heading fills the middle space */
          .hero-heading-wrap {
            flex: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-bottom: 0 !important;
            padding: 24px !important;
          }

          /* Input section pinned to bottom, full width */
          .hero-input-section {
            width: 100% !important;
            max-width: 100% !important;
            margin-bottom: 0 !important;
            padding: 12px 16px 20px !important;
            background: #050508 !important;
            border-top: 1px solid rgba(255,255,255,0.06) !important;
          }

          /* Show interest icons on mobile */
          .mobile-interests { display: flex !important; }

          /* Hide desktop suggestion elements on mobile */
          .sugg-cats      { display: none !important; }
          .sugg-items-wrap{ display: none !important; }
          .shuffle-btn    { display: none !important; }
        }

        /* ── Desktop: hide mobile-only elements ── */
        @media (min-width: 768px) {
          .mobile-interests { display: none !important; }
        }

        /* ── Small phones: < 400px ── */
        @media (max-width: 400px) {
          .veil-aside { width: 100vw !important; }
        }
      `}</style>
    </div>
  )
}
