"use client";
import { useState } from "react";
import { Zap, Shield, CreditCard, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    credits: "100",
    model: "SAL Mini",
    features: ["100 credits/mo", "Search + Chat", "7 verticals", "Community support"],
    color: "#555",
    stripe: null,
  },
  {
    name: "Starter",
    price: "$27",
    credits: "500",
    model: "SAL Pro",
    features: ["500 credits/mo", "All verticals", "Social Studio", "GitHub connect", "Email support"],
    color: "#F59E0B",
    stripe: "https://buy.stripe.com/starter",
  },
  {
    name: "Pro",
    price: "$97",
    credits: "2,000",
    model: "SAL Max",
    features: ["2,000 credits/mo", "Full Builder IDE", "Voice AI", "Video gen", "Career Suite", "API access", "Priority support"],
    color: "#22C55E",
    badge: "POPULAR",
    stripe: "https://buy.stripe.com/pro",
  },
  {
    name: "Teams",
    price: "$297",
    credits: "10,000",
    model: "SAL Max Fast",
    features: ["10K credits/mo", "5 seats", "GHL CRM", "Cloudflare deploy", "Builder deploy", "Team workspace"],
    color: "#818CF8",
    stripe: "https://buy.stripe.com/teams",
  },
  {
    name: "Enterprise",
    price: "$497",
    credits: "Unlimited",
    model: "All Models",
    features: ["Unlimited credits", "Unlimited seats", "White-label", "HACP\u2122 license", "Custom fine-tune", "Dedicated CSM", "SLA uptime"],
    color: "#EC4899",
    stripe: "https://buy.stripe.com/enterprise",
  },
];

const TOP_UPS = [
  { credits: "250", price: "$12", bonus: null },
  { credits: "500", price: "$22", bonus: "Save 12%" },
  { credits: "1,000", price: "$40", bonus: "Save 20%" },
  { credits: "5,000", price: "$175", bonus: "Save 30%" },
];

export default function CreditTopUp() {
  const [tab, setTab] = useState<"plans" | "topup">("plans");
  const [currentCredits] = useState(999993);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      <div className="mb-4">
        <h1 className="text-[19px] font-extrabold text-gold mb-1">Credits & Billing</h1>
        <p className="text-[12.5px] text-[#555]">Manage your plan and purchase additional credits</p>
      </div>

      {/* Current Balance */}
      <div className="bg-[#111116] border border-gold/20 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Zap size={18} className="text-gold" />
            </div>
            <div>
              <p className="text-[10px] text-[#555] font-semibold uppercase tracking-wider">CREDIT BALANCE</p>
              <p className="text-[22px] font-black text-gold">{currentCredits.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-accent-green font-semibold">Pro Plan</p>
            <p className="text-[10px] text-[#555]">$97/mo</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[#07070A] rounded-lg p-0.5 w-fit">
        {(["plans", "topup"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-3.5 py-1.5 rounded-md text-[12px] font-semibold transition-all",
              tab === t ? "bg-[#1A1A26] text-gold" : "text-[#555] hover:text-[#888]")}>
            {t === "plans" ? "Subscription Plans" : "Buy Credits"}
          </button>
        ))}
      </div>

      {tab === "plans" ? (
        <div className="space-y-2.5">
          {PLANS.map((p) => (
            <div key={p.name} className="bg-[#111116] rounded-xl p-3.5 border relative hover:-translate-y-0.5 hover:shadow-lg transition-all"
              style={{ borderColor: p.color + "28" }}>
              {"badge" in p && p.badge && (
                <div className="absolute top-2.5 right-2.5 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded tracking-widest text-black"
                  style={{ background: p.color }}>{p.badge}</div>
              )}
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-[20px] font-black" style={{ color: p.color }}>{p.price}</span>
                <span className="text-[11px] text-[#555]">/mo</span>
                <span className="text-[13px] font-bold text-[#E8E6E1] ml-1.5">{p.name}</span>
              </div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] text-[#555] font-mono">{p.credits} credits</span>
                <span className="text-[10px] text-[#333]">·</span>
                <span className="text-[10px] text-[#555]">{p.model}</span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                {p.features.map((f) => (
                  <span key={f} className="text-[11px] text-[#777] flex items-center gap-1">
                    <Check size={9} style={{ color: p.color }} />{f}
                  </span>
                ))}
              </div>
              {p.stripe ? (
                <a href={p.stripe} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold border transition-all hover:brightness-110"
                  style={{ borderColor: p.color, color: p.color }}>
                  <CreditCard size={11} />
                  {p.name === "Enterprise" ? "Contact Sales" : `Subscribe to ${p.name}`}
                </a>
              ) : (
                <span className="text-[11px] text-[#444] font-semibold">Current Plan</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {TOP_UPS.map((t) => (
            <div key={t.credits} className="bg-[#111116] border border-gold/15 rounded-xl p-3.5 flex items-center justify-between hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Zap size={15} className="text-gold" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#E8E6E1]">{t.credits} Credits</p>
                  {t.bonus && <span className="text-[10px] text-accent-green font-semibold">{t.bonus}</span>}
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-gold text-black text-[12px] font-bold hover:bg-gold-light transition-colors">
                {t.price}
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-3 px-1">
            <Shield size={10} className="text-[#333]" />
            <span className="text-[10px] text-[#333]">Secured by Stripe · SSL encrypted · PCI DSS compliant</span>
          </div>
        </div>
      )}
    </div>
  );
}
