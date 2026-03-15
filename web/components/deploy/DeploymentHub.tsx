"use client";
import { useState } from "react";
import { Rocket, Globe, Server, Cloud, CheckCircle, Clock, Activity, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const DEPLOYMENTS = [
  { name: "saintsallabs.com", platform: "Vercel", region: "US East (iad1)", status: "live", url: "https://saintsallabs.com", lastDeploy: "2h ago", branch: "main" },
  { name: "saintsallabs-api", platform: "Render", region: "Oregon (PDX)", status: "live", url: "https://saintsallabs-api.onrender.com", lastDeploy: "5h ago", branch: "main" },
  { name: "saintbiz.io", platform: "Cloudflare Pages", region: "Global Edge", status: "live", url: "https://saintbiz.io", lastDeploy: "1d ago", branch: "main" },
];

const API_KEYS = [
  { name: "Claude (Anthropic)", key: "sk-ant-...9f3k", status: "active", usage: "1.2M tokens/day" },
  { name: "Grok (xAI)", key: "xai-...8j2m", status: "active", usage: "340K tokens/day" },
  { name: "ElevenLabs", key: "el-...4n7p", status: "active", usage: "12K chars/day" },
  { name: "Gemini (Google)", key: "AIza...Sx8q", status: "active", usage: "890K tokens/day" },
  { name: "OpenAI", key: "sk-...7h4d", status: "active", usage: "420K tokens/day" },
];

const BUILD_LOG = [
  { time: "19:42:01", level: "info", message: "Build started — saintsallabs-web@main" },
  { time: "19:42:03", level: "info", message: "Installing dependencies..." },
  { time: "19:42:18", level: "success", message: "Dependencies installed (234 packages)" },
  { time: "19:42:19", level: "info", message: "Running type check..." },
  { time: "19:42:24", level: "success", message: "Type check passed — 0 errors" },
  { time: "19:42:25", level: "info", message: "Building production bundle..." },
  { time: "19:42:52", level: "success", message: "Build complete — 2.3MB bundle" },
  { time: "19:42:53", level: "info", message: "Deploying to Vercel Edge Network..." },
  { time: "19:42:58", level: "success", message: "Deployment live at saintsallabs.com" },
];

const LEVEL_COLORS: Record<string, string> = {
  info: "#555",
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",
};

export default function DeploymentHub() {
  const [tab, setTab] = useState<"deploys" | "apis" | "logs">("deploys");

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      <div className="mb-4">
        <h1 className="text-[19px] font-extrabold text-gold mb-1">Deployment Hub</h1>
        <p className="text-[12.5px] text-[#555]">Infrastructure management · API keys · Build logs</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Current Status", value: "All Live", color: "#22C55E", icon: CheckCircle },
          { label: "Active Environment", value: "Production", color: "#F59E0B", icon: Zap },
          { label: "API Latency", value: "24ms", color: "#818CF8", icon: Activity },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#111116] rounded-xl p-3 border text-center" style={{ borderColor: s.color + "18" }}>
              <Icon size={14} className="mx-auto mb-1" style={{ color: s.color }} />
              <p className="text-[13px] font-black text-[#E8E6E1]">{s.value}</p>
              <p className="text-[9px] text-[#555] font-semibold uppercase">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[#07070A] rounded-lg p-0.5 w-fit">
        {(["deploys", "apis", "logs"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-3.5 py-1.5 rounded-md text-[12px] font-semibold transition-all capitalize",
              tab === t ? "bg-[#1A1A26] text-gold" : "text-[#555] hover:text-[#888]")}>
            {t === "apis" ? "API Keys" : t === "logs" ? "Build Log" : "Deployments"}
          </button>
        ))}
      </div>

      {tab === "deploys" && (
        <div className="space-y-2">
          {DEPLOYMENTS.map((d) => (
            <div key={d.name} className="bg-[#111116] border border-[#1A1A22] rounded-xl p-3.5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {d.platform === "Vercel" ? <Globe size={14} className="text-[#E8E6E1]" /> :
                   d.platform === "Render" ? <Server size={14} className="text-accent-purple" /> :
                   <Cloud size={14} className="text-gold" />}
                  <div>
                    <span className="text-[13px] font-bold text-[#E8E6E1]">{d.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#555]">{d.platform}</span>
                      <span className="text-[10px] text-[#333]">·</span>
                      <span className="text-[10px] text-[#555]">{d.region}</span>
                    </div>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[9px] text-accent-green font-bold uppercase">
                  <CheckCircle size={9} /> {d.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Clock size={9} className="text-[#444]" />
                  <span className="text-[10.5px] text-[#555]">{d.lastDeploy}</span>
                  <span className="text-[10px] text-accent-purple font-mono ml-2">{d.branch}</span>
                </div>
                <ChevronRight size={12} className="text-[#333]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "apis" && (
        <div className="bg-[#0D0D12] border border-[#1A1A22] rounded-xl overflow-hidden">
          {API_KEYS.map((k) => (
            <div key={k.name} className="flex items-center justify-between px-3.5 py-3 border-b border-[#131318] last:border-0">
              <div>
                <p className="text-[12px] font-bold text-[#E8E6E1]">{k.name}</p>
                <p className="text-[10px] text-[#444] font-mono">{k.key}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-accent-green font-bold uppercase">{k.status}</span>
                <p className="text-[10px] text-[#555]">{k.usage}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "logs" && (
        <div className="bg-[#0A0A0E] border border-[#1A1A22] rounded-xl p-3.5 font-mono">
          {BUILD_LOG.map((l, i) => (
            <div key={i} className="flex gap-3 py-1 text-[11px]">
              <span className="text-[#333] flex-shrink-0">{l.time}</span>
              <span className="flex-shrink-0 uppercase text-[9px] font-bold tracking-wider w-14" style={{ color: LEVEL_COLORS[l.level] }}>{l.level}</span>
              <span className="text-[#777]">{l.message}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#131318]">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            <span className="text-[10px] text-accent-green">Ready</span>
          </div>
        </div>
      )}
    </div>
  );
}
