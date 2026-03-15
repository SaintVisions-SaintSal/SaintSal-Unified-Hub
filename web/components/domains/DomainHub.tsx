"use client";
import { useState } from "react";
import { Globe, Shield, ExternalLink, Plus, Search, Settings, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Domain {
  name: string;
  provider: string;
  ssl: "active" | "pending" | "error";
  deployment: string;
  status: "live" | "pending" | "error";
  dns: { type: string; name: string; value: string; ttl: string }[];
}

const DOMAINS: Domain[] = [
  {
    name: "saintsallabs.com",
    provider: "GoDaddy",
    ssl: "active",
    deployment: "Vercel",
    status: "live",
    dns: [
      { type: "A", name: "@", value: "76.76.21.21", ttl: "3600" },
      { type: "CNAME", name: "www", value: "cname.vercel-dns.com", ttl: "3600" },
      { type: "MX", name: "@", value: "mx1.resend.com", ttl: "3600" },
      { type: "TXT", name: "@", value: "v=spf1 include:resend.com ~all", ttl: "3600" },
    ],
  },
  {
    name: "saintbiz.io",
    provider: "Cloudflare",
    ssl: "active",
    deployment: "Cloudflare Pages",
    status: "live",
    dns: [
      { type: "A", name: "@", value: "172.67.182.1", ttl: "Auto" },
      { type: "CNAME", name: "www", value: "saintbiz.io", ttl: "Auto" },
    ],
  },
  {
    name: "cookincapital.com",
    provider: "GoDaddy",
    ssl: "active",
    deployment: "Vercel",
    status: "live",
    dns: [
      { type: "A", name: "@", value: "76.76.21.21", ttl: "3600" },
      { type: "CNAME", name: "www", value: "cname.vercel-dns.com", ttl: "3600" },
    ],
  },
  {
    name: "cookin.io",
    provider: "GoDaddy",
    ssl: "pending",
    deployment: "Render",
    status: "pending",
    dns: [
      { type: "A", name: "@", value: "216.24.57.1", ttl: "3600" },
    ],
  },
];

const STATUS_ICON = {
  live: <CheckCircle size={10} className="text-accent-green" />,
  active: <CheckCircle size={10} className="text-accent-green" />,
  pending: <Clock size={10} className="text-gold" />,
  error: <AlertCircle size={10} className="text-red-500" />,
};

export default function DomainHub() {
  const [expanded, setExpanded] = useState<string | null>("saintsallabs.com");
  const [search, setSearch] = useState("");

  const filtered = DOMAINS.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[19px] font-extrabold text-accent-green mb-1">Domain Hub</h1>
          <p className="text-[12.5px] text-[#555]">{DOMAINS.length} domains · DNS management · SSL tracking</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold text-black text-[11.5px] font-bold hover:bg-gold-light transition-colors">
          <Plus size={11} />
          Add Domain
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search domains..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-[#E8E6E1] text-[12.5px] outline-none placeholder-[#444] focus:border-gold/40 transition-colors"
        />
      </div>

      {/* Domain List */}
      <div className="space-y-2">
        {filtered.map((domain) => (
          <div key={domain.name} className="bg-[#111116] border border-[#1A1A22] rounded-xl overflow-hidden">
            {/* Domain header */}
            <button
              onClick={() => setExpanded(expanded === domain.name ? null : domain.name)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-[#161620] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-green/10 flex items-center justify-center">
                  <Globe size={14} className="text-accent-green" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#E8E6E1]">{domain.name}</span>
                    {STATUS_ICON[domain.status]}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#555]">{domain.provider}</span>
                    <span className="text-[10px] text-[#333]">·</span>
                    <span className="text-[10px] text-[#555]">{domain.deployment}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Shield size={9} className={domain.ssl === "active" ? "text-accent-green" : "text-gold"} />
                  <span className={cn("text-[9px] font-bold uppercase", domain.ssl === "active" ? "text-accent-green" : "text-gold")}>
                    SSL {domain.ssl}
                  </span>
                </div>
                <ExternalLink size={11} className="text-[#444]" />
              </div>
            </button>

            {/* DNS Records (expanded) */}
            {expanded === domain.name && (
              <div className="border-t border-[#131318] p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[9px] text-gold font-extrabold tracking-widest uppercase">DNS RECORDS</p>
                  <button className="flex items-center gap-1 text-[10px] text-[#555] hover:text-gold transition-colors">
                    <Settings size={9} />
                    Manage
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="grid grid-cols-4 gap-2 text-[8.5px] text-[#333] font-bold uppercase tracking-wider pb-1.5 border-b border-[#131318]">
                    <span>Type</span><span>Name</span><span>Value</span><span>TTL</span>
                  </div>
                  {domain.dns.map((record, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 text-[11px] py-1.5 border-b border-[#0E0E14] last:border-0">
                      <span className="text-gold font-mono font-bold">{record.type}</span>
                      <span className="text-[#777] font-mono">{record.name}</span>
                      <span className="text-[#555] font-mono truncate">{record.value}</span>
                      <span className="text-[#444] font-mono">{record.ttl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
