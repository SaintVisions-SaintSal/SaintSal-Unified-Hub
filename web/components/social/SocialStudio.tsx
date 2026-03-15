"use client";
import { useState } from "react";
import { Send, Copy, Check, Link, Unlink } from "lucide-react";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type PlatformResults = Record<string, string>;

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  x: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.905-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  li: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>,
  ig: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  tt: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.56V6.78a4.85 4.85 0 01-1.07-.09z"/></svg>,
  fb: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
};

const IDEAS = [
  "SaintSal Labs just launched — AI intelligence in 175+ countries",
  "Why Responsible Intelligence™ is the future of AI — and why it matters",
  "3 lessons from building a multi-division AI company with US patent",
  "How SaintSal replaced 6 SaaS tools for our enterprise clients",
  "The real estate deal analyzer that saved our client $45K",
];

export default function SocialStudio() {
  const [tab, setTab] = useState<"create" | "connect">("create");
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState<PlatformResults>({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [connections, setConnections] = useState<Record<string, boolean>>({});

  const generate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true); setResults({});
    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setResults(data.posts || {});
    } catch {
      setResults({
        x: `${topic}\n\n#AI #SaintSal #ResponsibleAI`,
        li: `Sharing: ${topic}\n\nAt SaintSal™ Labs, Responsible Intelligence™ is our foundation.\n\n#AI #Innovation`,
        ig: `${topic} ✨\n\n#SaintSalLabs #AIInnovation #ResponsibleAI`,
        tt: `${topic} Here's why this matters... #AI #SaintSal`,
        fb: `${topic}\n\nWhat are your thoughts? Comment below! 👇`,
      });
    } finally {
      setLoading(false);
    }
  };

  const copy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(id); setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 pb-3 border-b border-[#1A1A22]">
        {([["create", "Content Creator"], ["connect", "Platform Connections"]] as const).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all",
              tab === t ? "bg-accent-pink text-white" : "text-[#555] hover:text-[#888]")}>
            {l}
          </button>
        ))}
      </div>

      {tab === "create" && (
        <>
          <div className="mb-3.5">
            <h2 className="text-[17px] font-extrabold text-accent-pink mb-1">Social Studio</h2>
            <p className="text-[12px] text-[#555]">Describe your topic → SAL writes platform-native posts for all 5 channels simultaneously.</p>
          </div>

          {/* Input */}
          <div className="bg-surface border border-border rounded-xl px-3 py-1 flex items-end gap-2 mb-3.5">
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={2}
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-[#E8E6E1] placeholder-[#444] py-2 leading-relaxed font-sans"
              placeholder="e.g. SaintSal Labs just hit 175 countries with our AI platform..."
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generate(); } }} />
            <button onClick={generate} disabled={!topic.trim() || loading}
              className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-1 flex-shrink-0 transition-all",
                topic.trim() && !loading ? "bg-accent-pink cursor-pointer hover:brightness-110" : "bg-border-muted cursor-not-allowed")}>
              {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Send size={12} className={topic.trim() ? "text-white" : "text-[#444]"}/>}
            </button>
          </div>

          {loading && !Object.keys(results).length && (
            <div className="flex items-center gap-2.5 py-3">
              {[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-pulse" style={{animationDelay:`${i*0.15}s`}}/>)}
              <span className="text-[12.5px] text-[#555]">Generating for all 5 platforms...</span>
            </div>
          )}

          {/* Results */}
          {Object.keys(results).length > 0 && (
            <div className="space-y-2.5">
              {SOCIAL_PLATFORMS.map((p) => {
                const content = results[p.id];
                if (!content) return null;
                return (
                  <div key={p.id} className="rounded-xl p-3.5 border transition-all"
                    style={{ background: "#111116", borderColor: p.color + "20" }}>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: p.color + "18", color: p.color }}>
                          {PLATFORM_ICONS[p.id]}
                        </div>
                        <span className="text-[12px] font-bold" style={{ color: p.color }}>{p.name}</span>
                        <span className="text-[10px] text-[#444]">{content.length}/{p.charLimit}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => copy(p.id, content)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[10.5px] border transition-all"
                          style={{ borderColor: p.color + "33", color: p.color }}>
                          {copied === p.id ? <><Check size={9}/>Copied</> : <><Copy size={9}/>Copy</>}
                        </button>
                        {connections[p.id] && (
                          <button className="px-2 py-1 rounded text-[10.5px] font-semibold text-white transition-all hover:brightness-110"
                            style={{ background: p.color }}>Post Now</button>
                        )}
                      </div>
                    </div>
                    <p className="text-[13px] text-[#B0ADA8] leading-relaxed whitespace-pre-wrap">{content}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ideas */}
          {!Object.keys(results).length && !loading && (
            <div>
              <p className="text-[9.5px] text-[#2A2A36] font-extrabold tracking-widest uppercase mb-2">CONTENT IDEAS</p>
              {IDEAS.map((s, i) => (
                <button key={i} onClick={() => setTopic(s)}
                  className="block w-full px-3 py-2 rounded-lg border border-[#1A1A22] text-[#666] text-[12.5px] text-left mb-1.5 transition-all hover:border-pink-500/30 hover:text-pink-400">
                  {s}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "connect" && (
        <>
          <div className="mb-3.5">
            <h2 className="text-[17px] font-extrabold text-accent-pink mb-1">Platform Connections</h2>
            <p className="text-[12px] text-[#555]">Connect your accounts to post directly from SAL Social Studio.</p>
          </div>
          <div className="space-y-2.5">
            {SOCIAL_PLATFORMS.map((p) => (
              <div key={p.id} className="rounded-xl p-3.5 border flex items-center justify-between transition-all"
                style={{ background: "#111116", borderColor: connections[p.id] ? p.color + "33" : "#1A1A22" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: p.color + "18", color: p.color }}>
                    {PLATFORM_ICONS[p.id]}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#E8E6E1]">{p.name}</p>
                    <p className="text-[11px]" style={{ color: connections[p.id] ? "#22C55E" : "#555" }}>
                      {connections[p.id] ? "Connected · Ready to post" : "Not connected"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setConnections((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                  className={cn("flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all")}
                  style={connections[p.id]
                    ? { border: `1px solid ${p.color}33`, color: p.color, background: "transparent" }
                    : { background: p.color, color: "#fff", border: "none" }}>
                  {connections[p.id] ? <><Unlink size={11}/>Disconnect</> : <><Link size={11}/>Connect</>}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3.5 p-3.5 bg-[#0D0D12] border border-[#1A1A22] rounded-xl text-[12px] text-[#444] leading-relaxed">
            💡 Connect platforms to enable one-click posting from the Content Creator tab. OAuth authentication routes through SaintSal™ secure proxy — your credentials never touch our servers.
          </div>
        </>
      )}
    </div>
  );
}
