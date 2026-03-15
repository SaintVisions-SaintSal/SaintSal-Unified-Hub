"use client";
import { DollarSign, Cpu, Hammer, Building2, TrendingUp, Activity, Clock, ChevronRight } from "lucide-react";
import { useMarkets } from "@/hooks/useMarkets";

const METRICS = [
  { label: "Monthly Recurring Revenue", value: "$420,000", change: "+12.4%", up: true, icon: DollarSign, color: "#F59E0B" },
  { label: "AI Token Usage", value: "1.2B", change: "+8.1%", up: true, icon: Cpu, color: "#818CF8" },
  { label: "Active Builds", value: "84", change: "+15", up: true, icon: Hammer, color: "#22C55E" },
  { label: "Real Estate Portfolio", value: "$12.4M", change: "+3.2%", up: true, icon: Building2, color: "#EC4899" },
];

const INSIGHTS = [
  { title: "Claude token costs decreased 18% after prompt optimization", time: "2h ago", color: "#22C55E" },
  { title: "Builder deploys up 42% — Vercel edge nodes at 94% efficiency", time: "4h ago", color: "#818CF8" },
  { title: "Real estate lead pipeline: 23 new properties flagged for analysis", time: "6h ago", color: "#EC4899" },
  { title: "Stripe MRR crossed $420K — Pro tier conversion at 8.7%", time: "8h ago", color: "#F59E0B" },
];

const INFRA = [
  { label: "API Gateway", status: "healthy", latency: "24ms" },
  { label: "Supabase DB", status: "healthy", latency: "12ms" },
  { label: "Vercel Edge", status: "healthy", latency: "8ms" },
  { label: "Render WS", status: "healthy", latency: "31ms" },
  { label: "Cloudflare CDN", status: "healthy", latency: "4ms" },
  { label: "Stripe Webhooks", status: "healthy", latency: "18ms" },
];

export default function CEODashboard() {
  const mkt = useMarkets(true);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      {/* Header */}
      <div className="mb-5">
        <p className="text-[11px] text-[#333] font-bold tracking-widest uppercase mb-0.5">EXECUTIVE CONSOLE</p>
        <h1 className="text-[20px] font-extrabold text-gold mb-0.5">Good morning, Cap.</h1>
        <p className="text-[12.5px] text-[#555]">Saint Vision Technologies LLC · All systems operational</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {METRICS.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-[#111116] rounded-xl p-3.5 border hover:-translate-y-0.5 hover:shadow-lg transition-all"
              style={{ borderColor: m.color + "20" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: m.color + "15" }}>
                  <Icon size={13} style={{ color: m.color }} />
                </div>
                <span className="text-[10px] text-[#555] font-semibold uppercase tracking-wide">{m.label}</span>
              </div>
              <div className="text-[20px] font-black text-[#E8E6E1] mb-0.5">{m.value}</div>
              <div className="flex items-center gap-1">
                <TrendingUp size={10} className="text-accent-green" />
                <span className="text-[11px] text-accent-green font-semibold">{m.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Strategic Insights */}
      <div className="bg-[#0D0D12] border border-[#1A1A22] rounded-xl p-3.5 mb-4">
        <p className="text-[9px] text-gold font-extrabold tracking-widest uppercase mb-3">AI STRATEGIC INSIGHTS</p>
        <div className="space-y-2.5">
          {INSIGHTS.map((insight, i) => (
            <div key={i} className="flex items-start gap-2.5 group cursor-pointer">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: insight.color }} />
              <div className="flex-1">
                <p className="text-[12px] text-[#999] group-hover:text-[#E8E6E1] transition-colors leading-relaxed">{insight.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={8} className="text-[#333]" />
                  <span className="text-[9.5px] text-[#333]">{insight.time}</span>
                </div>
              </div>
              <ChevronRight size={12} className="text-[#333] group-hover:text-[#555] transition-colors mt-0.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Infrastructure Health */}
      <div className="bg-[#0D0D12] border border-[#1A1A22] rounded-xl p-3.5 mb-4">
        <p className="text-[9px] text-accent-green font-extrabold tracking-widest uppercase mb-3">INFRASTRUCTURE HEALTH</p>
        <div className="space-y-1.5">
          {INFRA.map((svc) => (
            <div key={svc.label} className="flex items-center justify-between py-1.5 border-b border-[#131318] last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                <span className="text-[11.5px] text-[#777] font-medium">{svc.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#444] font-mono">{svc.latency}</span>
                <span className="text-[8.5px] text-accent-green font-bold uppercase tracking-wider">{svc.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Markets Row */}
      <div className="bg-[#0D0D12] border border-[#1A1A22] rounded-xl p-3.5">
        <p className="text-[9px] text-[#2A2A36] font-extrabold tracking-widest uppercase mb-3">LIVE MARKETS</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "S&P 500", value: mkt.spx, change: "+0.3%" },
            { label: "NASDAQ", value: mkt.ndx, change: "+0.4%" },
            { label: "BTC", value: `$${mkt.btc}`, change: "+1.2%" },
            { label: "DOW", value: mkt.dow, change: "+0.2%" },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-[9px] text-[#444] font-semibold uppercase">{m.label}</p>
              <p className="text-[12px] text-[#E8E6E1] font-bold">{m.value}</p>
              <p className="text-[9px] text-accent-green font-semibold">{m.change}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
