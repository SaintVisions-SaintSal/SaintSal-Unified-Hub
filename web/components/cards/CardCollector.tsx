"use client";
import { useState, useCallback } from "react";
import {
  Search, Star, Shield, TrendingUp, ExternalLink, Copy, Check,
  Sparkles, Award, BarChart3, Hash, ChevronRight, Loader2, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ──────────────────────────────────────── */
interface CardResult {
  source: string;
  name: string;
  set?: string;
  number?: string;
  rarity?: string;
  image?: string;
  price?: number;
  priceRange?: { low: number; high: number };
  grade?: string;
  gradeCompany?: string;
  url?: string;
  lastSold?: string;
  population?: number;
}

/* ── Source badge colors ─────────────────────────── */
const SOURCE_META: Record<string, { label: string; color: string; bg: string }> = {
  ebay: { label: "eBay", color: "#E53238", bg: "#E5323818" },
  pokemontcg: { label: "Pokémon TCG", color: "#FFCB05", bg: "#FFCB0518" },
  psa: { label: "PSA", color: "#C7282D", bg: "#C7282D18" },
  justtcg: { label: "JustTCG", color: "#22C55E", bg: "#22C55E18" },
};

/* ── Pokemon 30th Anniversary spotlight ──────────── */
const POKEMON_30TH = [
  { name: "Base Set Charizard", query: "pokemon base set charizard holo 4/102", img: "🔥", desc: "The crown jewel. PSA 10 sells $300K+" },
  { name: "1st Ed. Shadowless Pikachu", query: "pokemon 1st edition shadowless pikachu 58/102", img: "⚡", desc: "The mascot. 1st Ed. Shadowless = grail" },
  { name: "Gold Star Rayquaza", query: "pokemon gold star rayquaza ex deoxys", img: "🌟", desc: "Ultra-rare pull. Modern vintage crossover" },
  { name: "Illustrator Pikachu", query: "pokemon illustrator pikachu promo", img: "🎨", desc: "Only ~40 exist. $5M+ record sale" },
  { name: "Shining Charizard Neo", query: "pokemon shining charizard neo destiny", img: "✨", desc: "Neo Destiny secret rare. Always in demand" },
  { name: "Crystal Charizard", query: "pokemon crystal type charizard skyridge", img: "💎", desc: "Skyridge e-Series. Beautiful & rare" },
];

const TRENDING_SEARCHES = [
  "Pokemon 25th Anniversary Golden Box",
  "PSA 10 Charizard VMAX Shiny",
  "Japanese Promo Pikachu 2026",
  "Scarlet & Violet Illustration Rare",
  "Obsidian Flames Charizard ex",
  "Crown Zenith Galarian Gallery",
];

/* ── Quick search categories ─────────────────────── */
const QUICK_CATS = [
  { label: "Pokémon", icon: Sparkles, query: "pokemon", color: "#FFCB05" },
  { label: "PSA 10", icon: Shield, query: "PSA 10 graded", color: "#C7282D" },
  { label: "Vintage", icon: Star, query: "vintage 1999 pokemon", color: "#F59E0B" },
  { label: "Modern Hits", icon: TrendingUp, query: "pokemon illustration rare 2025", color: "#818CF8" },
  { label: "Japanese", icon: Award, query: "japanese pokemon promo", color: "#EC4899" },
  { label: "Graded Slabs", icon: BarChart3, query: "BGS PSA CGC graded slab", color: "#22C55E" },
];

/* ── Format price ────────────────────────────────── */
function fmt(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
}

/* ── Main Component ──────────────────────────────── */
export default function CardCollector() {
  const [query, setQuery] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [results, setResults] = useState<CardResult[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "psa" | "pokemon30">("search");
  const [selectedCard, setSelectedCard] = useState<CardResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setResults([]);
    setSources([]);
    setSourceFilter(null);
    setSelectedCard(null);
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, type: "search" }),
      });
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
        setSources(data.sources || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const doPSALookup = useCallback(async () => {
    if (!certNumber.trim()) return;
    setLoading(true);
    setResults([]);
    setSources([]);
    setSelectedCard(null);
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: certNumber, type: "psa", certNumber }),
      });
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
        setSources(data.sources || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [certNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  const handlePSA = (e: React.FormEvent) => {
    e.preventDefault();
    doPSALookup();
  };

  const copyText = (t: string) => {
    navigator.clipboard?.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const filteredResults = sourceFilter
    ? results.filter((r) => r.source === sourceFilter)
    : results;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* ── Left panel ───────────────────────────── */}
      <div className="w-[340px] flex flex-col border-r border-border-subtle overflow-hidden flex-shrink-0">
        {/* Header */}
        <div className="px-3.5 py-2.5 border-b border-[#0F0F18] flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FFCB05] to-[#CC3333] flex items-center justify-center">
            <Star size={11} className="text-black" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#FFCB05] tracking-wider">SAL CARDS</span>
            <span className="text-[8px] text-[#555] ml-1.5 font-mono">COLLECTOR INTELLIGENCE</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#0F0F18] px-2 pt-1">
          {([
            { key: "search", label: "Search", icon: Search },
            { key: "psa", label: "PSA Verify", icon: Shield },
            { key: "pokemon30", label: "Pokémon 30th", icon: Sparkles },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn("flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold transition-all border-b-2 -mb-px",
                  activeTab === tab.key ? "text-[#FFCB05] border-[#FFCB05]" : "text-[#555] border-transparent hover:text-[#888]")}>
                <Icon size={11} />{tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ── Search tab ──────────────────── */}
          {activeTab === "search" && (
            <div className="p-3.5 space-y-3">
              <form onSubmit={handleSearch} className="flex gap-1.5">
                <div className="flex-1 flex items-center bg-[#0D0D12] border border-[#1A1A22] rounded-xl px-3 gap-2">
                  <Search size={12} className="text-[#444] flex-shrink-0" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="Charizard Base Set Holo..."
                    className="flex-1 bg-transparent border-none outline-none text-[12.5px] text-[#E8E6E1] placeholder-[#444] py-2.5" />
                  {query && (
                    <button type="button" onClick={() => setQuery("")} className="text-[#444] hover:text-[#888]"><X size={10} /></button>
                  )}
                </div>
                <button type="submit" disabled={loading || !query.trim()}
                  className={cn("px-3.5 rounded-xl text-[11px] font-bold transition-all",
                    loading ? "bg-[#1A1A22] text-[#555]" : "bg-[#FFCB05] text-black hover:bg-[#FFD84D]")}>
                  {loading ? <Loader2 size={12} className="animate-spin" /> : "Search"}
                </button>
              </form>

              {/* Quick categories */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CATS.map((c) => {
                  const Icon = c.icon;
                  return (
                    <button key={c.label} onClick={() => { setQuery(c.query); doSearch(c.query); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#1A1A22] text-[10px] font-semibold transition-all hover:border-[#2A2A36]"
                      style={{ color: c.color }}>
                      <Icon size={9} />{c.label}
                    </button>
                  );
                })}
              </div>

              {/* Trending */}
              {results.length === 0 && !loading && (
                <div>
                  <p className="text-[9px] text-[#333] font-extrabold tracking-widest uppercase mb-2">TRENDING SEARCHES</p>
                  {TRENDING_SEARCHES.map((s) => (
                    <button key={s} onClick={() => { setQuery(s); doSearch(s); }}
                      className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[11px] text-[#666] hover:text-[#FFCB05] hover:bg-[#1A1A26] transition-all">
                      <TrendingUp size={9} className="flex-shrink-0" />
                      <span className="truncate">{s}</span>
                      <ChevronRight size={9} className="ml-auto text-[#333]" />
                    </button>
                  ))}
                </div>
              )}

              {/* Source filter */}
              {sources.length > 1 && (
                <div className="flex gap-1.5 flex-wrap">
                  <button onClick={() => setSourceFilter(null)}
                    className={cn("px-2 py-1 rounded text-[9px] font-bold transition-all",
                      !sourceFilter ? "bg-[#FFCB05] text-black" : "bg-[#111116] text-[#666] hover:text-[#aaa]")}>
                    All ({results.length})
                  </button>
                  {sources.map((s) => {
                    const meta = SOURCE_META[s];
                    const count = results.filter((r) => r.source === s).length;
                    return (
                      <button key={s} onClick={() => setSourceFilter(sourceFilter === s ? null : s)}
                        className={cn("px-2 py-1 rounded text-[9px] font-bold transition-all",
                          sourceFilter === s ? "text-black" : "text-[#666] hover:text-[#aaa]")}
                        style={{
                          background: sourceFilter === s ? meta?.color : "#111116",
                          borderColor: meta?.color + "30",
                        }}>
                        {meta?.label || s} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── PSA tab ─────────────────────── */}
          {activeTab === "psa" && (
            <div className="p-3.5 space-y-3">
              <div className="p-3 rounded-xl border border-[#C7282D30] bg-[#C7282D08]">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={14} className="text-[#C7282D]" />
                  <span className="text-[13px] font-bold text-[#E8E6E1]">PSA Cert Verification</span>
                </div>
                <p className="text-[11px] text-[#888] mb-3">Enter a PSA certification number to verify grade, population data, and authenticity.</p>
                <form onSubmit={handlePSA} className="flex gap-1.5">
                  <div className="flex-1 flex items-center bg-[#0D0D12] border border-[#1A1A22] rounded-xl px-3 gap-2">
                    <Hash size={12} className="text-[#C7282D] flex-shrink-0" />
                    <input value={certNumber} onChange={(e) => setCertNumber(e.target.value)}
                      placeholder="e.g. 12345678"
                      className="flex-1 bg-transparent border-none outline-none text-[12.5px] text-[#E8E6E1] placeholder-[#444] py-2.5 font-mono" />
                  </div>
                  <button type="submit" disabled={loading || !certNumber.trim()}
                    className={cn("px-3.5 rounded-xl text-[11px] font-bold transition-all",
                      loading ? "bg-[#1A1A22] text-[#555]" : "bg-[#C7282D] text-white hover:bg-[#D83338]")}>
                    {loading ? <Loader2 size={12} className="animate-spin" /> : "Verify"}
                  </button>
                </form>
              </div>

              {/* PSA result display */}
              {results.length > 0 && results[0].source === "psa" && (
                <div className="p-3.5 rounded-xl border border-[#C7282D30] bg-[#111116]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#C7282D] flex items-center justify-center text-white font-black text-[14px]">
                      {results[0].grade || "?"}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#E8E6E1]">{results[0].name}</p>
                      <p className="text-[10px] text-[#666]">{results[0].set} {results[0].number ? `#${results[0].number}` : ""}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-[#0D0D12]">
                      <p className="text-[9px] text-[#555] font-bold mb-0.5">GRADE</p>
                      <p className="text-[#C7282D] font-bold">{results[0].gradeCompany} {results[0].grade}</p>
                    </div>
                    {results[0].population !== undefined && (
                      <div className="p-2 rounded-lg bg-[#0D0D12]">
                        <p className="text-[9px] text-[#555] font-bold mb-0.5">POPULATION</p>
                        <p className="text-[#FFCB05] font-bold">{results[0].population?.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  {results[0].url && (
                    <a href={results[0].url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 mt-2.5 text-[10px] text-[#C7282D] hover:text-[#E53238] transition-colors font-semibold">
                      <ExternalLink size={9} /> View on PSA
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Pokemon 30th tab ────────────── */}
          {activeTab === "pokemon30" && (
            <div className="p-3.5 space-y-3">
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#FFCB0510] to-[#CC333310] border border-[#FFCB0520]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[18px]">🎉</span>
                  <span className="text-[14px] font-extrabold text-[#FFCB05]">Pokémon 30th Anniversary</span>
                </div>
                <p className="text-[11px] text-[#888] leading-relaxed">
                  February 27, 2026 marks 30 years since Pokémon Red & Green launched in Japan.
                  From Base Set to Scarlet & Violet — explore the most iconic and valuable cards of all time.
                </p>
              </div>

              <p className="text-[9px] text-[#333] font-extrabold tracking-widest uppercase">ICONIC GRAILS</p>
              {POKEMON_30TH.map((card) => (
                <button key={card.name} onClick={() => { setQuery(card.query); setActiveTab("search"); doSearch(card.query); }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-[#1A1A22] bg-[#111116] text-left hover:border-[#FFCB0530] hover:bg-[#FFCB0508] transition-all group">
                  <span className="text-[20px] flex-shrink-0">{card.img}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-[#E8E6E1] group-hover:text-[#FFCB05] transition-colors">{card.name}</p>
                    <p className="text-[10px] text-[#555] truncate">{card.desc}</p>
                  </div>
                  <ChevronRight size={10} className="text-[#333] group-hover:text-[#FFCB05] flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Results grid ──────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Results header */}
        <div className="px-4 py-2.5 border-b border-[#0F0F18] flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-[#555] font-bold">
            {loading ? "Searching..." : results.length > 0 ? `${filteredResults.length} result${filteredResults.length !== 1 ? "s" : ""}` : "Search for cards to see results"}
          </span>
          {sources.length > 0 && (
            <div className="flex gap-1 ml-auto">
              {sources.map((s) => {
                const meta = SOURCE_META[s];
                return (
                  <span key={s} className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                    style={{ color: meta?.color, background: meta?.bg }}>
                    {meta?.label || s}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Results grid or detail */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-60">
              <Loader2 size={28} className="text-[#FFCB05] animate-spin" />
              <span className="text-[12px] text-[#555]">Searching eBay, Pokémon TCG, JustTCG...</span>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40 px-8">
              <Star size={36} className="text-[#FFCB05]" />
              <p className="text-[14px] font-bold text-[#E8E6E1] text-center">Card Collector Intelligence</p>
              <p className="text-[11px] text-[#555] text-center max-w-[300px]">
                Search across eBay sold listings, Pokémon TCG database, JustTCG pricing, and PSA grading — all in one place.
              </p>
            </div>
          )}

          {!loading && selectedCard && (
            <div className="p-4 animate-fade-up">
              <button onClick={() => setSelectedCard(null)} className="flex items-center gap-1.5 text-[10px] text-[#555] hover:text-[#FFCB05] mb-3 transition-colors">
                ← Back to results
              </button>
              <div className="flex gap-5">
                {selectedCard.image && (
                  <div className="w-[240px] flex-shrink-0">
                    <img src={selectedCard.image} alt={selectedCard.name}
                      className="w-full rounded-xl border border-[#1A1A22] shadow-[0_8px_32px_rgba(0,0,0,.5)]"
                      onError={(e) => (e.currentTarget.style.display = "none")} />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-[18px] font-extrabold text-[#E8E6E1] mb-1">{selectedCard.name}</p>
                    {selectedCard.set && <p className="text-[12px] text-[#888]">{selectedCard.set} {selectedCard.number ? `#${selectedCard.number}` : ""}</p>}
                    {selectedCard.rarity && <p className="text-[11px] text-[#FFCB05] font-semibold mt-0.5">{selectedCard.rarity}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {selectedCard.price !== undefined && (
                      <div className="p-3 rounded-xl bg-[#111116] border border-[#1A1A22]">
                        <p className="text-[9px] text-[#555] font-bold mb-1">MARKET PRICE</p>
                        <p className="text-[20px] font-extrabold text-[#22C55E]">{fmt(selectedCard.price)}</p>
                      </div>
                    )}
                    {selectedCard.priceRange && (
                      <div className="p-3 rounded-xl bg-[#111116] border border-[#1A1A22]">
                        <p className="text-[9px] text-[#555] font-bold mb-1">PRICE RANGE</p>
                        <p className="text-[14px] font-bold text-[#E8E6E1]">{fmt(selectedCard.priceRange.low)} – {fmt(selectedCard.priceRange.high)}</p>
                      </div>
                    )}
                    {selectedCard.grade && (
                      <div className="p-3 rounded-xl bg-[#111116] border border-[#1A1A22]">
                        <p className="text-[9px] text-[#555] font-bold mb-1">GRADE</p>
                        <p className="text-[14px] font-bold text-[#C7282D]">{selectedCard.gradeCompany} {selectedCard.grade}</p>
                      </div>
                    )}
                    {selectedCard.lastSold && (
                      <div className="p-3 rounded-xl bg-[#111116] border border-[#1A1A22]">
                        <p className="text-[9px] text-[#555] font-bold mb-1">LAST SOLD</p>
                        <p className="text-[11px] font-semibold text-[#888]">{new Date(selectedCard.lastSold).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {selectedCard.url && (
                      <a href={selectedCard.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1A1A22] text-[11px] text-[#888] hover:text-[#FFCB05] hover:border-[#FFCB0530] transition-all">
                        <ExternalLink size={10} /> View Source
                      </a>
                    )}
                    <button onClick={() => copyText(`${selectedCard.name}${selectedCard.set ? ` - ${selectedCard.set}` : ""}${selectedCard.price ? ` - ${fmt(selectedCard.price)}` : ""}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1A1A22] text-[11px] text-[#888] hover:text-[#FFCB05] hover:border-[#FFCB0530] transition-all">
                      {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy Info</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !selectedCard && filteredResults.length > 0 && (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 p-4">
              {filteredResults.map((card, i) => {
                const meta = SOURCE_META[card.source];
                return (
                  <div key={`${card.source}-${i}`} onClick={() => setSelectedCard(card)}
                    className="rounded-xl border border-[#1A1A22] bg-[#111116] overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:border-[#FFCB0530] hover:shadow-[0_8px_32px_rgba(0,0,0,.4)] transition-all">
                    {card.image && (
                      <div className="h-[140px] overflow-hidden bg-[#0A0A10] flex items-center justify-center">
                        <img src={card.image} alt={card.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => (e.currentTarget.parentElement!.style.display = "none")} />
                      </div>
                    )}
                    <div className="p-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                          style={{ color: meta?.color, background: meta?.bg }}>
                          {meta?.label || card.source}
                        </span>
                        {card.rarity && (
                          <span className="text-[8px] text-[#FFCB05] font-semibold truncate">{card.rarity}</span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-[#E8E6E1] leading-snug mb-1 line-clamp-2">{card.name}</p>
                      {card.set && <p className="text-[9px] text-[#555] mb-1.5 truncate">{card.set}</p>}
                      <div className="flex items-center justify-between">
                        {card.price !== undefined ? (
                          <span className="text-[14px] font-extrabold text-[#22C55E]">{fmt(card.price)}</span>
                        ) : card.priceRange ? (
                          <span className="text-[11px] font-bold text-[#888]">{fmt(card.priceRange.low)} – {fmt(card.priceRange.high)}</span>
                        ) : (
                          <span className="text-[10px] text-[#444]">No price data</span>
                        )}
                        {card.grade && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#C7282D18] text-[#C7282D]">
                            {card.gradeCompany} {card.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
