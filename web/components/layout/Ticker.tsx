"use client";
import { useMarkets } from "@/hooks/useMarkets";

const NEWS_BY_VERTICAL: Record<string, string[]> = {
  sports: ["Lakers advance to Conference Finals", "Mahomes signs richest NFL contract", "Champions League quarters set"],
  news: ["Fed holds rates — signals 2 cuts 2026", "Ukraine ceasefire talks in Geneva", "AI safety pact: OpenAI Google Anthropic"],
  tech: ["Claude 4 Opus new reasoning SOTA", "NVIDIA Blackwell Ultra 10x H100", "React 20 ships native signals"],
  medical: ["FDA approves GLP-1 24% weight loss", "AI matches radiologist in lung CT", "ICD-11 transition October 2026"],
};

const MARKET_VERTICALS = new Set(["search", "finance", "realestate", "dashboard"]);

function fmtTicker(label: string, value: string, change?: string): string {
  if (value === "—") return `${label} —`;
  const arrow = change ? (change.startsWith("+") ? " ▲" : change.startsWith("-") ? " ▼" : " ") : "";
  return `${label} $${value}${arrow}${change || ""}`;
}

export default function Ticker({ vertical }: { vertical: string }) {
  const mkt = useMarkets(MARKET_VERTICALS.has(vertical));

  const mktItems = [
    fmtTicker("SPY", mkt.spx, mkt.spx_chg),
    fmtTicker("QQQ", mkt.ndx, mkt.ndx_chg),
    fmtTicker("DIA", mkt.dow, mkt.dow_chg),
    fmtTicker("BTC", mkt.btc),
    fmtTicker("ETH", mkt.eth),
    mkt.vix !== "—" ? `VIX ${mkt.vix}` : null,
  ].filter(Boolean) as string[];

  const newsItems = NEWS_BY_VERTICAL[vertical] || [];
  const items = [...(MARKET_VERTICALS.has(vertical) ? mktItems : []), ...newsItems];

  if (!items.length) return null;

  const txt = items.join("   •   ");

  return (
    <div className="h-[30px] bg-[#07070A] border-b border-[#131320] flex items-center overflow-hidden flex-shrink-0">
      <div className="flex items-center px-2.5 border-r border-[#191928] flex-shrink-0 gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[9px] font-extrabold text-red-500 tracking-widest">LIVE</span>
      </div>
      <div className="overflow-hidden flex-1">
        <div className="inline-block whitespace-nowrap animate-ticker">
          <span className="text-[11px] text-[#555] pl-4">{txt}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{txt}</span>
        </div>
      </div>
    </div>
  );
}
