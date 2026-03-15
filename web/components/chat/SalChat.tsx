"use client";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Copy, FileText, TrendingUp, Activity, Stethoscope, Building2, Trophy, Briefcase, Globe, Zap, Star, Shield } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import type { Attachment, ToolCall } from "@/hooks/useChat";
import { ACCENT_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* ── Markdown renderer ──────────────────────────────── */
function renderMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.slice(3).split("\n");
      const lang = lines[0].trim();
      const code = lines.slice(1).join("\n").replace(/```$/, "").trimEnd();
      return (
        <div key={i} className="my-2.5 rounded-lg overflow-hidden border border-[#191922]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#0D0D14] border-b border-[#191922]">
            <span className="text-[10px] text-[#444] font-bold uppercase tracking-wider font-mono">{lang || "code"}</span>
            <button onClick={() => navigator.clipboard?.writeText(code)} className="text-[10px] text-[#555] hover:text-[#E8E6E1] transition-colors font-sans">copy</button>
          </div>
          <pre className="p-3.5 text-[#C8D3F5] text-[12.5px] leading-relaxed overflow-x-auto font-mono bg-[#07070B]">{code}</pre>
        </div>
      );
    }
    const html = part
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^### (.+)$/gm, '<div class="text-[13px] font-bold mt-2.5 mb-1 text-[#AAAAAA]">$1</div>')
      .replace(/^## (.+)$/gm, '<div class="text-[14.5px] font-bold mt-3 mb-1.5 text-[#D0CEC9]">$1</div>')
      .replace(/^# (.+)$/gm, '<div class="text-[17px] font-extrabold mt-3.5 mb-2 text-[#E8E6E1]">$1</div>')
      .replace(/^---$/gm, '<hr class="border-none border-t border-[#1A1A22] my-3.5"/>')
      .replace(/^- (.+)$/gm, '<div class="flex gap-2 my-1 pl-1"><span class="text-gold text-[8px] mt-[5px]">●</span><span>$1</span></div>')
      .replace(/^\d+\. (.+)$/gm, '<div class="my-1 pl-1">$1</div>');
    return <span key={i} className="whitespace-pre-wrap leading-[1.78]" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

/* ── Tool Activity Indicator ────────────────────────── */
const TOOL_LABELS: Record<string, string> = {
  exa_search: "Searching web (Exa)",
  tavily_search: "Searching news (Tavily)",
  get_stock_quote: "Fetching stock quote",
  get_stock_bars: "Loading price history",
  get_crypto_price: "Fetching crypto price",
  get_market_snapshot: "Loading market data",
  rentcast_property_value: "Valuating property (RentCast)",
  rentcast_market_stats: "Loading market stats",
  search_cards: "Searching card databases",
  psa_cert_lookup: "Verifying PSA cert",
  pokemon_tcg_search: "Searching Pokémon TCG",
  check_domain_availability: "Checking domain (GoDaddy)",
};

function ToolIndicator({ tools, accent }: { tools: ToolCall[]; accent: string }) {
  if (!tools.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-2 ml-8">
      {tools.map((t) => (
        <div key={t.id} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold"
          style={{ background: accent + "12", border: `1px solid ${accent}30`, color: accent }}>
          {t.status === "running" ? (
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
          ) : (
            <span className="text-[10px]">✓</span>
          )}
          {TOOL_LABELS[t.name] || t.name}
        </div>
      ))}
    </div>
  );
}

/* ── Message ──────────────────────────────────────── */
function Message({ msg, accent }: { msg: ReturnType<typeof useChat>["messages"][0]; accent: string }) {
  const isUser = msg.role === "user";
  const handleCopy = () => navigator.clipboard?.writeText(msg.content);

  return (
    <div className="flex gap-2.5 py-2 items-start animate-fade-up">
      <div
        className="w-6 h-6 rounded-lg flex-shrink-0 mt-0.5 flex items-center justify-center"
        style={{ background: isUser ? "#1E1E28" : `linear-gradient(135deg, ${accent}, ${accent}88)`, borderRadius: isUser ? "50%" : "7px" }}
      >
        <span className="text-[9.5px] font-extrabold" style={{ color: isUser ? "#666" : "#000" }}>
          {isUser ? "C" : "S"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-[12px] font-bold" style={{ color: isUser ? "#777" : accent }}>
            {isUser ? "You" : "SAL"}
          </span>
          {!isUser && !msg.streaming && msg.content && (
            <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-[#3A3A44] hover:text-[#888] transition-colors">
              <Copy size={9} />Copy
            </button>
          )}
        </div>
        {/* Image attachments */}
        {isUser && msg.attachments && msg.attachments.length > 0 && (
          <div className="flex gap-2 mb-2">
            {msg.attachments.map((a, i) => (
              <div key={i} className="relative">
                <img src={a.url} alt={a.name} className="w-20 h-20 rounded-lg object-cover border border-[#1A1A22]" />
                <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[8px] text-center text-[#aaa] rounded-b-lg truncate px-0.5">{a.name}</span>
              </div>
            ))}
          </div>
        )}
        <div className={cn("text-[13.5px] leading-[1.76]", isUser ? "text-[#999]" : "text-[#D4D1CB]", msg.streaming ? "cursor-blink" : "")}>
          {isUser ? <span className="whitespace-pre-wrap">{msg.content}</span> : renderMarkdown(msg.content)}
          {msg.streaming && !msg.content && (
            <span className="inline-flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: accent, animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Article card ─────────────────────────────────── */
interface Article {
  cat: string; cc: string; title: string; img: string; prompt: string;
}

function ArtCard({ a, onPrompt }: { a: Article; onPrompt: (p: string) => void }) {
  return (
    <div onClick={() => onPrompt(a.prompt)}
      className="flex-shrink-0 w-[224px] bg-[#111116] border border-[#1C1C24] rounded-xl overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,.5)] transition-all">
      <div className="h-[112px] overflow-hidden relative">
        <img src={`https://images.unsplash.com/${a.img}&auto=format`} alt={a.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          onError={(e) => (e.currentTarget.style.display = "none")} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(8,8,11,.9)]" />
        <span className="absolute top-1.5 left-1.5 text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded"
          style={{ background: a.cc + "28", color: a.cc, border: `1px solid ${a.cc}44` }}>{a.cat}</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[12px] font-semibold leading-snug text-[#C5C2BB]">{a.title}</p>
      </div>
    </div>
  );
}

/* ── Per-vertical quick actions ───────────────────── */
const QUICK_ACTIONS: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; prompt: string }[]> = {
  finance: [
    { icon: TrendingUp, label: "Analyze NVDA", prompt: "Full analysis of NVDA stock — technicals, fundamentals, 12-month price target" },
    { icon: Activity, label: "Portfolio Allocation", prompt: "Build an optimal portfolio allocation for 2026 — $50K, moderate risk, growth-focused" },
    { icon: Zap, label: "Risk Alerts", prompt: "Current market risk factors and alerts I should know about today" },
    { icon: Globe, label: "Crypto Brief", prompt: "Bitcoin, Ethereum, Solana — current prices, trend analysis, key levels to watch" },
  ],
  medical: [
    { icon: Stethoscope, label: "ICD Lookup", prompt: "Help me find the correct ICD-10 code — describe the condition and I'll identify the code" },
    { icon: FileText, label: "SOAP Note", prompt: "Generate a SOAP note template — Patient: 55yo male, Chief complaint: chest pain x3 days, BP 145/92" },
    { icon: Activity, label: "Drug Check", prompt: "Drug interaction check — provide medication list to analyze interactions, contraindications, and alerts" },
    { icon: Zap, label: "Clinical Calc", prompt: "Clinical calculator — provide patient data for GFR, BMI, MELD, CHADS-VASC, or Wells score" },
  ],
  sports: [
    { icon: Trophy, label: "Live Scores", prompt: "Current live scores and results across NBA, NFL, MLB, and soccer today" },
    { icon: Activity, label: "My Teams", prompt: "Track these teams: Lakers, Dodgers, Rams, LAFC — latest scores, standings, upcoming games" },
    { icon: TrendingUp, label: "Fantasy Picks", prompt: "Best fantasy sports pickups and sleepers this week across all major sports" },
    { icon: Zap, label: "Prop Bets", prompt: "Today's most interesting prop bets and player stat lines across major sports" },
  ],
  realestate: [
    { icon: Building2, label: "Deal Analyzer", prompt: "Analyze this deal: $450K SFR, $2,800/mo rent, 20% down, 7% rate — full ROI and cash flow analysis" },
    { icon: TrendingUp, label: "Market Report", prompt: "Orange County real estate market report — median prices, inventory levels, days on market, trends" },
    { icon: Zap, label: "Comps Search", prompt: "Find comparable sales for a 3BR/2BA 1,800 sqft home in Irvine, CA — last 90 days" },
    { icon: Globe, label: "BRRRR Analysis", prompt: "Best BRRRR markets 2026 — entry price under $200K, strong rent-to-price ratios, appreciation potential" },
  ],
  news: [
    { icon: Globe, label: "Top Stories", prompt: "Top 5 most important news stories happening right now — global, political, economic" },
    { icon: TrendingUp, label: "Market Impact", prompt: "What news events are moving markets today — stocks, bonds, crypto, commodities" },
    { icon: Zap, label: "AI Headlines", prompt: "Latest AI and technology headlines — product launches, funding rounds, regulation, breakthroughs" },
  ],
  tech: [
    { icon: Zap, label: "Code Review", prompt: "Help me review and optimize code — paste your code and I'll analyze for performance, security, and best practices" },
    { icon: Globe, label: "API Guide", prompt: "Show me how to integrate the most popular APIs — Stripe, OpenAI, Supabase, Twilio — with code examples" },
    { icon: TrendingUp, label: "Stack Audit", prompt: "Audit my tech stack for 2026 — recommend the best frameworks, databases, hosting, and tools" },
  ],
  career: [
    { icon: Briefcase, label: "Resume Review", prompt: "Review and optimize my resume for a Senior Full-Stack Engineer position at a top tech company" },
    { icon: Activity, label: "Interview Prep", prompt: "Prepare me for a technical interview — system design, behavioral questions, and coding challenges" },
    { icon: TrendingUp, label: "Salary Nego", prompt: "Salary negotiation strategy for a $200K+ offer — counter strategies, total comp, equity, benefits" },
  ],
  cards: [
    { icon: Star, label: "Pokémon 30th", prompt: "Pokémon 30th Anniversary — most iconic and valuable cards from 1996 to 2026, price trends, grail cards, investment picks" },
    { icon: TrendingUp, label: "Market Trends", prompt: "Current Pokémon TCG market trends — which sets and cards are rising in value, what to buy and hold in 2026" },
    { icon: Shield, label: "Grading Guide", prompt: "Complete guide to PSA, BGS, and CGC grading — when to grade, cost analysis, population reports, grade premiums by card" },
    { icon: Star, label: "Base Set Value", prompt: "Complete Base Set Pokémon value guide — every holo, 1st Edition vs Unlimited, Shadowless premiums, current PSA 10 prices" },
  ],
};

function QuickActions({ vertical, onAction, accent }: { vertical: string; onAction: (prompt: string) => void; accent: string }) {
  const actions = QUICK_ACTIONS[vertical];
  if (!actions) return null;
  return (
    <div className="flex gap-1.5 flex-wrap mb-3 mt-1">
      {actions.map((a, i) => {
        const Icon = a.icon;
        return (
          <button key={i} onClick={() => onAction(a.prompt)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all hover:scale-[1.02]"
            style={{ borderColor: accent + "30", color: accent + "cc", background: accent + "08" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent + "60"; e.currentTarget.style.background = accent + "14"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = accent + "30"; e.currentTarget.style.background = accent + "08"; }}>
            <Icon size={11} />
            {a.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Landing content ──────────────────────────────── */
const LANDING: Record<string, { accent: string; tagline: string; articles: Article[]; starters: string[] }> = {
  search: { accent: "#F59E0B", tagline: "Research anything. Know everything.", articles: [
    { cat: "AI", cc: "#818CF8", title: "Claude 4 Opus Sets New Reasoning Benchmark", img: "photo-1677442135703-1787eea5ce01?w=400&h=200&fit=crop", prompt: "Compare Claude 4 Opus vs GPT-5 vs Gemini 2.5 Pro — capabilities, benchmarks, pricing, best use cases" },
    { cat: "ECONOMY", cc: "#22C55E", title: "Fed Holds Rates — Signals Two Cuts in 2026", img: "photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop", prompt: "Analyze the Fed rate decision — inflation data, economic outlook, market reaction, and investor implications" },
  ], starters: ["Latest AI model comparisons and benchmarks 2026", "What is happening in the global economy right now", "Top tech acquisitions to watch in Q2 2026"] },
  finance: { accent: "#22C55E", tagline: "Markets. Macro. Money.", articles: [
    { cat: "MARKETS", cc: "#22C55E", title: "S&P 500 Hits Record 6,847 — Tech Leads Rally", img: "photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop", prompt: "Deep S&P 500 analysis at record highs — sector leadership, valuations, Fed impact, earnings season" },
    { cat: "CRYPTO", cc: "#F59E0B", title: "Bitcoin Breaks $105,000 After ETF Expansion", img: "photo-1518546305927-5a555bb7020d?w=400&h=200&fit=crop", prompt: "Bitcoin at $105K — ETF inflows, institutional accumulation, on-chain metrics, price targets Q2 2026" },
  ], starters: ["Analyze NVDA stock — technicals, fundamentals, 12-month target", "Build a diversified portfolio for $50,000 in 2026", "Bitcoin and crypto outlook Q2 2026"] },
  realestate: { accent: "#EC4899", tagline: "Find deals. Analyze fast. Move first.", articles: [
    { cat: "OC MARKET", cc: "#EC4899", title: "Orange County Prices Hit $1.24M Median", img: "photo-1570129477492-45c003edd2be?w=400&h=200&fit=crop", prompt: "Comprehensive Orange County real estate market analysis — price trends, inventory, investment opportunities 2026" },
    { cat: "RATES", cc: "#22C55E", title: "30-Year Mortgage Drops to 6.09% — 3-Year Low", img: "photo-1560518883-ce09059eeffa?w=400&h=200&fit=crop", prompt: "Impact of 6.09% mortgage rates on buying power, affordability, and real estate investment returns" },
  ], starters: ["Analyze: $450K SFR, $2,800 rent, 20% down, 7% rate — good investment?", "Best BRRRR markets 2026 under $50K out of pocket", "How to find and acquire foreclosures in California"] },
  tech: { accent: "#818CF8", tagline: "Build. Analyze. Ship.", articles: [
    { cat: "DEV", cc: "#22C55E", title: "Next.js 15 Production Architecture Guide", img: "photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop", prompt: "Complete Next.js 15 production architecture — App Router, Server Components, streaming, and deployment" },
    { cat: "AI", cc: "#818CF8", title: "RAG Architecture: The Production Playbook", img: "photo-1620712943543-bcc4688e7485?w=400&h=200&fit=crop", prompt: "Build a production RAG system — vector DB selection, chunking, retrieval optimization with code examples" },
  ], starters: ["Build a full-stack Next.js 15 app with auth and Stripe", "Explain RAG architecture with working Python code", "Best AI APIs to integrate in production apps 2026"] },
  medical: { accent: "#818CF8", tagline: "Clinical intelligence. Always on.", articles: [
    { cat: "FDA", cc: "#22C55E", title: "New GLP-1 Shows 24% Weight Reduction in Trials", img: "photo-1576091160399-112ba8d25d1d?w=400&h=200&fit=crop", prompt: "Clinical analysis of new GLP-1: mechanism, phase 3 results vs Ozempic, side effects, prescribing" },
    { cat: "CMS", cc: "#F59E0B", title: "ICD-11 Transition Timeline: October 2026", img: "photo-1559757175-0eb30cd8c063?w=400&h=200&fit=crop", prompt: "What providers need to know about ICD-11 — changes, documentation requirements, EHR timeline" },
  ], starters: ["ICD-10 codes for type 2 diabetes with complications", "SOAP note: 55yo male, chest pain 3 days, BP 145/92", "Metformin 1000mg — full drug profile and patient counseling"] },
  builder: { accent: "#F59E0B", tagline: "Code it. Create it. Ship it.", articles: [
    { cat: "FULL-STACK", cc: "#818CF8", title: "Build a Production SaaS App in One Prompt", img: "photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop", prompt: "Build a complete Next.js 15 SaaS with dark amber theme, Stripe checkout, Supabase auth, and animated hero" },
    { cat: "AI APP", cc: "#22C55E", title: "AI Dashboard with Real-Time Charts", img: "photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop", prompt: "Build a React dashboard with dark amber theme, Recharts line and bar charts, animated stats, live refresh" },
  ], starters: ["Build a full Next.js 15 app with Stripe and auth", "Create a Cloudflare Worker for lead capture to GoHighLevel", "Build a React dashboard with charts and dark amber theme"] },
  sports: { accent: "#22C55E", tagline: "Scores, stats, strategy — all of it.", articles: [
    { cat: "NBA", cc: "#EC4899", title: "Lakers vs Warriors: Epic Game 7 Breakdown", img: "photo-1546519638-68e109498ffc?w=400&h=200&fit=crop", prompt: "Break down Lakers vs Warriors Game 7 — key plays, player performances, tactical adjustments, implications" },
    { cat: "NFL", cc: "#22C55E", title: "Mahomes Signs Richest Contract in NFL History", img: "photo-1560272564-c83b66b1ad12?w=400&h=200&fit=crop", prompt: "Analyze Mahomes new contract — structure, guaranteed money, cap implications, historical comparison" },
  ], starters: ["NBA playoffs picture and bracket predictions", "Best fantasy sports pickups this week", "NFL 2026 draft top 10 prospects full breakdown"] },
  news: { accent: "#EF4444", tagline: "What is happening. Why it matters.", articles: [
    { cat: "GEOPOLITICS", cc: "#EF4444", title: "Ukraine Ceasefire Talks Enter Critical Phase", img: "photo-1529107386315-e1a2ed48a620?w=400&h=200&fit=crop", prompt: "Deep analysis of Ukraine ceasefire negotiations — parties, sticking points, historical context, likely outcomes" },
    { cat: "AI POLICY", cc: "#818CF8", title: "OpenAI, Google, Anthropic Sign AI Safety Pact", img: "photo-1677442135703-1787eea5ce01?w=400&h=200&fit=crop", prompt: "Analyze the AI safety pact — what is in it, enforcement mechanisms, global AI governance implications" },
  ], starters: ["Biggest news stories today March 2026", "Federal Reserve policy outlook and market impact", "Top geopolitical risks to watch in 2026"] },
  career: { accent: "#F59E0B", tagline: "Your career, engineered.", articles: [
    { cat: "AI JOBS", cc: "#818CF8", title: "Top AI Engineering Roles Paying $400K+ in 2026", img: "photo-1521737711867-e3b97375f902?w=400&h=200&fit=crop", prompt: "Analyze the highest paying AI engineering roles in 2026 — required skills, salary ranges, companies hiring, career path" },
    { cat: "STRATEGY", cc: "#22C55E", title: "The Resume That Got 12 FAANG Interviews", img: "photo-1586281380349-632531db7ed4?w=400&h=200&fit=crop", prompt: "Break down what makes a standout tech resume in 2026 — ATS optimization, formatting, quantified achievements, keywords" },
  ], starters: ["Optimize my resume for a Senior Full-Stack Engineer role", "Prepare me for a system design interview at a top tech company", "Salary negotiation strategy for a $200K+ offer"] },
  bizplan: { accent: "#818CF8", tagline: "From idea to investor-ready.", articles: [
    { cat: "STARTUP", cc: "#22C55E", title: "AI Startup Raises $50M Seed With This Pitch Deck", img: "photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop", prompt: "Analyze what makes a winning AI startup pitch deck — structure, financials, market sizing, traction metrics" },
    { cat: "FINANCE", cc: "#F59E0B", title: "3-Year Financial Projections That VCs Actually Trust", img: "photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop", prompt: "Build realistic 3-year financial projections for a SaaS startup — revenue model, unit economics, burn rate, path to profitability" },
  ], starters: ["Write a complete business plan for an AI-powered SaaS platform", "Build 3-year financial projections for a $50K bootstrapped startup", "Market analysis and TAM/SAM/SOM for a real estate tech company"] },
  bizcenter: { accent: "#818CF8", tagline: "Form. File. Launch.", articles: [
    { cat: "LLC", cc: "#22C55E", title: "Wyoming vs Delaware vs Nevada: Best State for Your LLC", img: "photo-1450101499163-c8848e968f86?w=400&h=200&fit=crop", prompt: "Compare Wyoming, Delaware, and Nevada for LLC formation — costs, taxes, privacy, asset protection, annual requirements" },
    { cat: "TAX", cc: "#F59E0B", title: "S-Corp Election Saves Average Founder $12K/Year", img: "photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop", prompt: "Explain S-Corp election for an LLC — when to elect, tax savings calculation, payroll requirements, state-specific rules" },
  ], starters: ["Help me form a Wyoming LLC with S-Corp election", "What business licenses do I need for a tech company in California?", "Create an operating agreement for a 2-member LLC"] },
  domains: { accent: "#22C55E", tagline: "Name it. Claim it. Own it.", articles: [
    { cat: "BRANDING", cc: "#22C55E", title: "Premium .com Domains Averaging $4,200 in 2026", img: "photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop", prompt: "Best strategies for finding and acquiring premium .com domain names in 2026 — aftermarket, expired, brand-matching" },
    { cat: "DNS", cc: "#818CF8", title: "Cloudflare DNS Setup: The Production Playbook", img: "photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop", prompt: "Complete Cloudflare DNS setup guide — nameservers, A records, CNAME, MX for email, SSL modes, page rules" },
  ], starters: ["Brainstorm 20 premium domain names for an AI startup", "Set up DNS records for my domain on Cloudflare with email routing", "Evaluate the value of a 5-letter .com domain"] },
  voice: { accent: "#22C55E", tagline: "Talk to SAL. Get answers.", articles: [
    { cat: "VOICE AI", cc: "#22C55E", title: "Real-Time Voice AI Hits Human-Level Latency", img: "photo-1589254065878-42c9da997008?w=400&h=200&fit=crop", prompt: "State of real-time voice AI in 2026 — latency benchmarks, best models, streaming architectures, production deployment" },
    { cat: "AGENTS", cc: "#818CF8", title: "Voice Agents Replace 40% of Call Center Roles", img: "photo-1596524430615-b46475ddff6e?w=400&h=200&fit=crop", prompt: "How voice AI agents are transforming customer service — use cases, ROI, implementation, ethical considerations" },
  ], starters: ["What can you help me with today?", "Give me a quick market briefing for today", "Summarize the top 3 things I should know right now"] },
  social: { accent: "#EC4899", tagline: "Create once. Post everywhere.", articles: [
    { cat: "STRATEGY", cc: "#EC4899", title: "How One Post Generated $240K in Pipeline", img: "photo-1611162617213-7d7a39e9b1d7?w=400&h=200&fit=crop", prompt: "Analyze viral B2B social media strategies — hooks, storytelling, engagement tactics, conversion optimization" },
    { cat: "AI CONTENT", cc: "#818CF8", title: "AI-Generated Content Outperforms Human 3:1 on LinkedIn", img: "photo-1432888622747-4eb9a8efeb07?w=400&h=200&fit=crop", prompt: "Best practices for AI-assisted social media content — authenticity, platform algorithms, scheduling, A/B testing" },
  ], starters: ["Write posts about SaintSal Labs launching in 175+ countries", "Create a LinkedIn thought leadership series about Responsible AI", "Generate a week of social content for a tech startup launch"] },
  cards: { accent: "#FFCB05", tagline: "Collect smarter. Grade wiser. Invest better.", articles: [
    { cat: "POKÉMON 30TH", cc: "#FFCB05", title: "Base Set Charizard Hits $420K — 30th Anniversary Surge", img: "photo-1613771404784-3a5686aa2be3?w=400&h=200&fit=crop", prompt: "Full analysis of Pokémon Base Set Charizard — PSA 10 prices, 1st Edition vs Unlimited, Shadowless variants, 30th anniversary market impact" },
    { cat: "GRADING", cc: "#C7282D", title: "PSA vs BGS vs CGC: The Definitive Grading Guide", img: "photo-1606107557195-0e29a4b5b4aa?w=400&h=200&fit=crop", prompt: "Compare PSA, BGS, and CGC grading — turnaround times, costs, label types, grade premiums, population reports, which to choose for each card type" },
    { cat: "MARKET", cc: "#22C55E", title: "Pokémon TCG 2026 Market Outlook — What to Buy Now", img: "photo-1542779283-429940ce8336?w=400&h=200&fit=crop", prompt: "Pokémon TCG market outlook 2026 — rising sets, undervalued cards, Japanese exclusives to watch, investment strategy for the 30th anniversary" },
  ], starters: [
    "What are the top 10 most valuable Pokémon cards of all time?",
    "Pokémon 30th Anniversary — which cards will spike in value?",
    "PSA 10 population report for Base Set holos — which are rare?",
    "Best Pokémon cards under $100 to invest in right now",
  ] },
};

/* ── Main SalChat ──────────────────────────────────── */
export interface SalChatHandle {
  send: (text: string, attachments?: Attachment[]) => void;
  exportChat: (format: "txt" | "pdf") => void;
}

interface SalChatProps {
  vertical: string;
  className?: string;
  userEmail?: string | null;
}

const SalChat = forwardRef<SalChatHandle, SalChatProps>(({ vertical, className, userEmail }, ref) => {
  const { messages, isStreaming, activeTools, thinkingText, sendMessage, exportChat } = useChat(vertical, userEmail);
  const scrollRef = useRef<HTMLDivElement>(null);
  const accent = ACCENT_COLORS[vertical] || "#F59E0B";
  const land = LANDING[vertical];
  const hasMessages = messages.length > 0;

  useImperativeHandle(ref, () => ({
    send: sendMessage,
    exportChat,
  }));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className={cn("flex-1 overflow-y-auto px-4 pb-24", className)}>
      {!hasMessages && land && (
        <div className="pt-5 animate-fade-up">
          <div className="mb-4">
            <div className="text-[11px] font-extrabold tracking-widest uppercase mb-1 opacity-70" style={{ color: accent }}>
              SAL Intelligence
            </div>
            <div className="text-[22px] font-extrabold text-[#E8E6E1] leading-tight mb-2">{land.tagline}</div>
          </div>
          {/* Quick Actions toolbar */}
          <QuickActions vertical={vertical} onAction={sendMessage} accent={accent} />
          <div className="flex gap-2.5 overflow-x-auto pb-2.5 mb-4 scrollbar-none">
            {land.articles.map((a, i) => <ArtCard key={i} a={a} onPrompt={sendMessage} />)}
          </div>
          <div className="space-y-1.5">
            {land.starters.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                className="block w-full px-3 py-2.5 rounded-lg border border-[#1A1A22] bg-transparent text-[#666] text-[13px] text-left cursor-pointer transition-all hover:text-current hover:border-current/30 hover:bg-current/5"
                style={{ "--tw-text-opacity": "1" } as React.CSSProperties}
                onMouseEnter={(e) => { e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = accent + "44"; e.currentTarget.style.background = accent + "08"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "#1A1A22"; e.currentTarget.style.background = "transparent"; }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Quick Actions shown above messages when conversation started */}
      {hasMessages && QUICK_ACTIONS[vertical] && (
        <div className="pt-2">
          <QuickActions vertical={vertical} onAction={sendMessage} accent={accent} />
        </div>
      )}
      {messages.map((m) => <Message key={m.id} msg={m} accent={accent} />)}
      {/* Tool activity indicators during streaming */}
      {isStreaming && activeTools.length > 0 && (
        <ToolIndicator tools={activeTools} accent={accent} />
      )}
      {/* Thinking text */}
      {isStreaming && thinkingText && (
        <div className="flex items-center gap-2 ml-8 mb-2 text-[11px] text-[#555] italic">
          <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
          {thinkingText}
        </div>
      )}
    </div>
  );
});

SalChat.displayName = "SalChat";
export default SalChat;
