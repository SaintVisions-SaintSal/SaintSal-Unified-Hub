"use client";
import { useState } from "react";
import { Search, MapPin, TrendingUp, Home, DollarSign, BarChart3, Filter, ChevronRight, Star, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Property {
  address: string;
  city: string;
  price: string;
  equity: string;
  yield: string;
  type: string;
  status: "NOD" | "Foreclosure" | "Pre-Foreclosure" | "REO" | "Active";
  beds: number;
  baths: number;
  sqft: string;
  saved?: boolean;
}

const PROPERTIES: Property[] = [
  { address: "1847 Pacific Coast Hwy", city: "Huntington Beach, CA", price: "$1,250,000", equity: "$380K", yield: "7.2%", type: "SFR", status: "NOD", beds: 4, baths: 3, sqft: "2,450", saved: true },
  { address: "324 E 17th St", city: "Costa Mesa, CA", price: "$785,000", equity: "$120K", yield: "6.8%", type: "Condo", status: "Pre-Foreclosure", beds: 2, baths: 2, sqft: "1,180" },
  { address: "9921 Adams Ave", city: "Garden Grove, CA", price: "$625,000", equity: "$95K", yield: "8.1%", type: "SFR", status: "Foreclosure", beds: 3, baths: 2, sqft: "1,560" },
  { address: "1100 Main St #412", city: "Irvine, CA", price: "$580,000", equity: "$45K", yield: "5.9%", type: "Condo", status: "Active", beds: 2, baths: 2, sqft: "1,050" },
  { address: "15332 Bolsa Chica St", city: "Westminster, CA", price: "$720,000", equity: "$210K", yield: "7.5%", type: "SFR", status: "NOD", beds: 3, baths: 2, sqft: "1,380" },
  { address: "2200 Harbor Blvd", city: "Costa Mesa, CA", price: "$1,100,000", equity: "$290K", yield: "6.4%", type: "Multi", status: "REO", beds: 6, baths: 4, sqft: "3,200" },
];

const STATUS_COLORS: Record<string, string> = {
  "NOD": "#EF4444",
  "Foreclosure": "#F59E0B",
  "Pre-Foreclosure": "#EC4899",
  "REO": "#818CF8",
  "Active": "#22C55E",
};

const FILTERS = ["All", "NOD", "Foreclosure", "Pre-Foreclosure", "REO", "Active"];

export default function REIntelligence() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = PROPERTIES.filter((p) => {
    if (filter !== "All" && p.status !== filter) return false;
    if (search && !p.address.toLowerCase().includes(search.toLowerCase()) && !p.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      <div className="mb-4">
        <h1 className="text-[19px] font-extrabold text-accent-pink mb-1">Real Estate Intelligence</h1>
        <p className="text-[12.5px] text-[#555]">Orange County market · CookinCapital methodology · {PROPERTIES.length} properties tracked</p>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Avg Price", value: "$843K", icon: DollarSign, color: "#F59E0B" },
          { label: "Avg Yield", value: "6.98%", icon: TrendingUp, color: "#22C55E" },
          { label: "NOD Filings", value: "23", icon: BarChart3, color: "#EF4444" },
          { label: "Properties", value: String(PROPERTIES.length), icon: Home, color: "#818CF8" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#111116] rounded-xl p-2.5 border text-center" style={{ borderColor: s.color + "18" }}>
              <Icon size={13} className="mx-auto mb-1" style={{ color: s.color }} />
              <p className="text-[13px] font-black text-[#E8E6E1]">{s.value}</p>
              <p className="text-[9px] text-[#555] font-semibold uppercase">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search properties..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-[#E8E6E1] text-[12px] outline-none placeholder-[#444] focus:border-accent-pink/40 transition-colors"
          />
        </div>
        <button className="px-3 rounded-lg border border-border bg-surface text-[#555] hover:text-[#E8E6E1] transition-colors">
          <Filter size={13} />
        </button>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-2.5 py-1 rounded-lg text-[10.5px] font-semibold whitespace-nowrap transition-all border",
              filter === f
                ? "border-accent-pink/40 bg-accent-pink/10 text-accent-pink"
                : "border-[#1A1A22] text-[#555] hover:text-[#999]"
            )}>
            {f}
          </button>
        ))}
      </div>

      {/* Property Cards */}
      <div className="space-y-2">
        {filtered.map((p, i) => (
          <div key={i} className="bg-[#111116] border border-[#1A1A22] rounded-xl p-3.5 hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-bold text-[#E8E6E1] group-hover:text-accent-pink transition-colors">{p.address}</span>
                  {p.saved && <Star size={10} className="text-gold fill-gold" />}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={9} className="text-[#444]" />
                  <span className="text-[11px] text-[#555]">{p.city}</span>
                </div>
              </div>
              <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{ background: STATUS_COLORS[p.status] + "18", color: STATUS_COLORS[p.status] }}>
                {p.status}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-2">
              <div>
                <p className="text-[9px] text-[#444] uppercase font-bold">Price</p>
                <p className="text-[12px] text-[#E8E6E1] font-bold">{p.price}</p>
              </div>
              <div>
                <p className="text-[9px] text-[#444] uppercase font-bold">Equity</p>
                <p className="text-[12px] text-accent-green font-bold">{p.equity}</p>
              </div>
              <div>
                <p className="text-[9px] text-[#444] uppercase font-bold">Yield</p>
                <p className="text-[12px] text-gold font-bold">{p.yield}</p>
              </div>
              <div>
                <p className="text-[9px] text-[#444] uppercase font-bold">Type</p>
                <p className="text-[12px] text-[#777] font-bold">{p.type}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10.5px] text-[#555]">
                <span>{p.beds} bd</span>
                <span>{p.baths} ba</span>
                <span>{p.sqft} sqft</span>
              </div>
              <ChevronRight size={12} className="text-[#333] group-hover:text-accent-pink transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
