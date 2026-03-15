"use client";
import { useState } from "react";
import { Shield, FileText, Scale, Globe, Lock, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "ip", label: "IP & Patents" },
  { id: "privacy", label: "Privacy" },
  { id: "terms", label: "Terms" },
] as const;

type Tab = (typeof TABS)[number]["id"];

const COMPLIANCE_ITEMS = [
  { label: "GDPR Compliance", status: "active", region: "EU/EEA", icon: Globe, desc: "Data protection regulation for EU citizens" },
  { label: "CCPA Compliance", status: "active", region: "California", icon: Shield, desc: "California Consumer Privacy Act compliance" },
  { label: "SOC 2 Type II", status: "in-progress", region: "Global", icon: Lock, desc: "Service Organization Control audit certification" },
  { label: "HIPAA", status: "active", region: "United States", icon: FileText, desc: "Health Insurance Portability & Accountability Act" },
  { label: "AI Safety Standards", status: "active", region: "Global", icon: AlertTriangle, desc: "Responsible AI deployment per HACP Protocol" },
  { label: "PCI DSS", status: "active", region: "Global", icon: Lock, desc: "Payment Card Industry Data Security Standard" },
];

const PATENTS = [
  { number: "US #10,290,222", title: "HACP Protocol — Hybrid Adaptive Communication Platform", status: "Granted", date: "May 14, 2019", coverage: "AI communication, multi-modal processing, adaptive response generation" },
];

const POLICIES = [
  { title: "Privacy Policy", updated: "March 1, 2026", version: "3.2" },
  { title: "Terms of Service", updated: "March 1, 2026", version: "3.2" },
  { title: "Acceptable Use Policy", updated: "February 15, 2026", version: "2.1" },
  { title: "Data Processing Agreement", updated: "January 10, 2026", version: "1.8" },
  { title: "Cookie Policy", updated: "March 1, 2026", version: "2.0" },
];

export default function LegalHub() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Scale size={18} className="text-gold" />
          <h1 className="text-[18px] font-extrabold text-[#E8E6E1]">Legal & Compliance</h1>
        </div>
        <p className="text-[12px] text-[#555]">Regulatory affairs, IP protection, and compliance status for SaintSal™ Labs.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 pb-3 border-b border-[#1A1A22]">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all",
              tab === t.id ? "bg-[#1C1C26] text-gold" : "text-[#555] hover:text-[#888]")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <>
          {/* Status cards */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[
              { label: "Compliance Score", value: "96%", color: "#22C55E" },
              { label: "Active Patents", value: "1", color: "#F59E0B" },
              { label: "Jurisdictions", value: "175+", color: "#818CF8" },
            ].map((s) => (
              <div key={s.label} className="bg-[#111116] rounded-xl p-3.5 border" style={{ borderColor: s.color + "20" }}>
                <div className="text-[20px] font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[11px] text-[#555] font-semibold">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Compliance grid */}
          <p className="text-[9px] text-[#2A2A36] font-extrabold tracking-widest uppercase mb-2">REGULATORY COMPLIANCE</p>
          <div className="space-y-2 mb-4">
            {COMPLIANCE_ITEMS.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="flex items-center justify-between p-3.5 rounded-xl border border-[#1A1A22] bg-[#111116]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Icon size={16} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#E8E6E1]">{c.label}</p>
                      <p className="text-[11px] text-[#555]">{c.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#444] font-mono">{c.region}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold",
                      c.status === "active" ? "bg-[#22C55E]/15 text-[#22C55E]" : "bg-[#F59E0B]/15 text-[#F59E0B]")}>
                      {c.status === "active" ? "Active" : "In Progress"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Entity info */}
          <div className="bg-[#0D0D12] border border-[#1A1A22] rounded-xl p-3.5">
            <p className="text-[9px] text-[#2A2A36] font-extrabold tracking-widest uppercase mb-3">LEGAL ENTITY</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Company", "Saint Vision Technologies LLC"],
                ["Jurisdiction", "State of California"],
                ["Founded", "2024"],
                ["EIN", "On file"],
                ["Registered Agent", "On file"],
                ["Structure", "Single-Member LLC"],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-[10px] text-[#444] font-semibold uppercase">{l}</p>
                  <p className="text-[12.5px] text-[#E8E6E1] font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* IP & Patents */}
      {tab === "ip" && (
        <>
          <p className="text-[9px] text-[#2A2A36] font-extrabold tracking-widest uppercase mb-2">GRANTED PATENTS</p>
          {PATENTS.map((p) => (
            <div key={p.number} className="rounded-xl border border-gold/20 bg-[#111116] p-4 mb-3">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={14} className="text-gold" />
                    <span className="text-[14px] font-extrabold text-gold">{p.number}</span>
                  </div>
                  <p className="text-[13px] font-bold text-[#E8E6E1]">{p.title}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#22C55E]/15 text-[#22C55E] text-[10px] font-bold">{p.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1A1A22]">
                <div>
                  <p className="text-[10px] text-[#444] font-semibold uppercase">Grant Date</p>
                  <p className="text-[12px] text-[#E8E6E1]">{p.date}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#444] font-semibold uppercase">Coverage</p>
                  <p className="text-[12px] text-[#E8E6E1]">{p.coverage}</p>
                </div>
              </div>
            </div>
          ))}

          <p className="text-[9px] text-[#2A2A36] font-extrabold tracking-widest uppercase mb-2 mt-4">TRADEMARKS</p>
          <div className="space-y-2">
            {[
              { mark: "SaintSal™", class: "Software, AI Services", status: "Active" },
              { mark: "Responsible Intelligence™", class: "AI Technology", status: "Active" },
              { mark: "HACP Protocol™", class: "Communication Technology", status: "Active" },
              { mark: "CookinCapital™", class: "Financial Services", status: "Active" },
              { mark: "SaintAthena™", class: "Medical AI", status: "Active" },
            ].map((t) => (
              <div key={t.mark} className="flex items-center justify-between p-3 rounded-xl border border-[#1A1A22] bg-[#111116]">
                <div>
                  <p className="text-[13px] font-bold text-[#E8E6E1]">{t.mark}</p>
                  <p className="text-[11px] text-[#555]">{t.class}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] text-[10px] font-bold">{t.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Privacy */}
      {tab === "privacy" && (
        <>
          <div className="bg-[#111116] border border-[#1A1A22] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock size={16} className="text-gold" />
              <h3 className="text-[14px] font-bold text-[#E8E6E1]">Data Protection Principles</h3>
            </div>
            <div className="space-y-2.5">
              {[
                "User data is encrypted at rest (AES-256) and in transit (TLS 1.3)",
                "No user data is used for model training without explicit consent",
                "Data residency options available for EU, US, and APAC regions",
                "Right to deletion honored within 30 days of request",
                "Annual third-party security audits conducted",
                "HACP Protocol ensures adaptive data handling per jurisdiction",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle size={12} className="text-[#22C55E] mt-0.5 flex-shrink-0" />
                  <p className="text-[12.5px] text-[#B0ADA8] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[9px] text-[#2A2A36] font-extrabold tracking-widest uppercase mb-2">DATA PROCESSING</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Sub-processors", value: "Supabase, Vercel, Anthropic, Stripe" },
              { label: "DPO Contact", value: "privacy@saintsallabs.com" },
              { label: "Data Retention", value: "90 days default, configurable" },
              { label: "Breach Protocol", value: "72-hour notification SLA" },
            ].map((d) => (
              <div key={d.label} className="bg-[#111116] border border-[#1A1A22] rounded-xl p-3">
                <p className="text-[10px] text-[#444] font-semibold uppercase mb-1">{d.label}</p>
                <p className="text-[12px] text-[#E8E6E1] font-semibold">{d.value}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Terms */}
      {tab === "terms" && (
        <>
          <p className="text-[9px] text-[#2A2A36] font-extrabold tracking-widest uppercase mb-2">LEGAL DOCUMENTS</p>
          <div className="space-y-2">
            {POLICIES.map((p) => (
              <div key={p.title} className="flex items-center justify-between p-3.5 rounded-xl border border-[#1A1A22] bg-[#111116] hover:border-[#2A2A36] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#818CF8]/10 flex items-center justify-center">
                    <FileText size={16} className="text-[#818CF8]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#E8E6E1]">{p.title}</p>
                    <p className="text-[11px] text-[#555]">Updated {p.updated} · v{p.version}</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-[#818CF8]/30 text-[#818CF8] hover:bg-[#818CF8]/10 transition-all">
                  <ExternalLink size={10} />View
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3.5 bg-[#0D0D12] border border-[#1A1A22] rounded-xl text-[12px] text-[#444] leading-relaxed">
            All legal documents are effective as of their posted date. Saint Vision Technologies LLC reserves the right to update these policies with 30 days notice to active users. For legal inquiries, contact legal@saintsallabs.com.
          </div>
        </>
      )}
    </div>
  );
}
