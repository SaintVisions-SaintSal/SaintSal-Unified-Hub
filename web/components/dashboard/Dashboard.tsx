"use client";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Zap, Globe, Cpu, Shield, Search, DollarSign, Building2, Activity } from "lucide-react";
import { useMarkets } from "@/hooks/useMarkets";

const STATS = [
  { label: "Countries", value: "175+", sub: "Global deployment", color: "#F59E0B", icon: Globe },
  { label: "AI Models", value: "53", sub: "Multi-model stack", color: "#22C55E", icon: Cpu },
  { label: "API Connectors", value: "88", sub: "Live integrations", color: "#818CF8", icon: Zap },
  { label: "Patent", value: "#10,290,222", sub: "HACP Protocol", color: "#EC4899", icon: Shield },
];

const QUICK = [
  { id: "search", label: "Research", icon: Search, color: "#F59E0B" },
  { id: "finance", label: "Finance", icon: DollarSign, color: "#22C55E" },
  { id: "builder", label: "Builder", icon: Zap, color: "#818CF8" },
  { id: "social", label: "Social", icon: Activity, color: "#EC4899" },
  { id: "realestate", label: "Real Estate", icon: Building2, color: "#F59E0B" },
  { id: "medical", label: "Medical", icon: Activity, color: "#818CF8" },
];

const MARKETS_DISPLAY = [
  { key: "spx", label: "S&P 500", change: "+0.3%", up: true },
  { key: "ndx", label: "NASDAQ", change: "+0.4%", up: true },
  { key: "btc", label: "BTC", prefix: "$", change: "+1.2%", up: true },
  { key: "dow", label: "DOW", change: "+0.2%", up: true },
];

export default function Dashboard() {
  const router = useRouter();
  const mkt = useMarkets(true);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      {/* Welcome */}
      <div className="mb-4">
        <p className="text-[11px] text-[#333] font-bold tracking-widest uppercase mb-0.5">SaintSal™ Labs</p>
        <h1 className="text-[20px] font-extrabold text-gold mb-0.5">Good morning, Cap.</h1>
        <p className="text-[12.5px] text-[#555]">Responsible Intelligence™ · Patent #10,290,222 · All systems live</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#111116] rounded-xl p-3.5 border hover:-translate-y-0.5 hover:shadow-lg transition-all"
              style={{ borderColor: s.color + "20" }}>
              <div className="text-[17px] font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[12px] font-bold text-[#E8E6E1] mb-0.5">{s.label}</div>
              <div className="text-[10.5px] text-[#444]">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Quick access */}
      <div className="mb-4">
        <p className="text-[9px] text-[#2A2A36] font-extrabold tracking-widest uppercase mb-2">QUICK ACCESS</p>
        <div className="grid grid-cols-3 gap-1.5">
          {QUICK.map((q) => {
            const Icon = q.icon;
            return (
              <button key={q.id} onClick={() => router.push(`/${q.id}`)}
                className="py-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all"
                style={{ background: "#111116", borderColor: q.color + "18" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = q.color + "44"; e.currentTarget.style.background = q.color + "08"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = q.color + "18"; e.currentTarget.style.background = "#111116"; }}>
                <Icon size={14} style={{ color: q.color }} />
                <span className="text-[10.5px] text-[#777] font-semibold">{q.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live markets */}
      <div className="bg-[#0D0D12] border border-[#1A1A22] rounded-xl p-3.5">
        <p className="text-[9px] text-[#2A2A36] font-extrabold tracking-widest uppercase mb-3">LIVE MARKETS</p>
        <div className="grid grid-cols-2 gap-1.5">
          {MARKETS_DISPLAY.map((m) => {
            const val = mkt[m.key as keyof typeof mkt];
            return (
              <div key={m.key} className="flex justify-between items-center py-1.5 border-b border-[#131318]">
                <span className="text-[11px] text-[#555] font-semibold">{m.label}</span>
                <div className="text-right">
                  <div className="text-[12px] text-[#E8E6E1] font-bold">{m.prefix || ""}{val}</div>
                  <div className={`text-[9.5px] flex items-center gap-0.5 justify-end ${m.up ? "text-accent-green" : "text-red-500"}`}>
                    {m.up ? <TrendingUp size={8}/> : <TrendingDown size={8}/>}
                    {m.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System health */}
      <div className="bg-[#0D0D12] border border-[#1A1A22] rounded-xl p-3.5 mt-2.5">
        <p className="text-[9px] text-[#2A2A36] font-extrabold tracking-widest uppercase mb-3">SYSTEM HEALTH</p>
        <div className="flex items-end gap-0.5 h-10 mb-3">
          {[60,80,70,100,90,40,75,100,85,100,100,100,95,70,90,100,100,20,100,80].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-gold/60" style={{ height: `${h}%`, opacity: 0.4 + (h / 200) }} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-[#131318] pt-3">
          {[["API Latency","24ms"],["Error Rate","0.02%"],["Uptime","99.99%"]].map(([l,v])=>(
            <div key={l}>
              <p className="text-[9px] text-[#555] uppercase font-bold tracking-tight">{l}</p>
              <p className="text-[12px] font-bold text-[#E8E6E1]">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
