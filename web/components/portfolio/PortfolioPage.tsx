"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Holding {
  ticker: string;
  name: string;
  shares: number;
  price: number;
  costBasis: number;
  sector: string;
  strategy: string;
}

const HOLDINGS: Holding[] = [
  { ticker: "NVDA", name: "NVIDIA Corp", shares: 150, price: 875.40, costBasis: 420.00, sector: "Tech", strategy: "Growth" },
  { ticker: "AAPL", name: "Apple Inc", shares: 200, price: 198.50, costBasis: 145.00, sector: "Tech", strategy: "Dividend" },
  { ticker: "BTC", name: "Bitcoin", shares: 2.5, price: 104820, costBasis: 42000, sector: "Crypto", strategy: "Growth" },
  { ticker: "TSLA", name: "Tesla Inc", shares: 100, price: 248.30, costBasis: 180.00, sector: "Auto", strategy: "Growth" },
  { ticker: "MSFT", name: "Microsoft", shares: 120, price: 445.20, costBasis: 310.00, sector: "Tech", strategy: "Dividend" },
  { ticker: "ETH", name: "Ethereum", shares: 15, price: 3820, costBasis: 1800, sector: "Crypto", strategy: "Growth" },
  { ticker: "AMZN", name: "Amazon", shares: 80, price: 192.80, costBasis: 125.00, sector: "Tech", strategy: "Growth" },
  { ticker: "SPY", name: "S&P 500 ETF", shares: 50, price: 562.40, costBasis: 440.00, sector: "Index", strategy: "Value" },
];

const STRATEGIES = ["All", "Growth", "Value", "Dividend"];

export default function PortfolioPage() {
  const [strategy, setStrategy] = useState("All");

  const filtered = HOLDINGS.filter((h) => strategy === "All" || h.strategy === strategy);

  const totalValue = filtered.reduce((sum, h) => sum + h.shares * h.price, 0);
  const totalCost = filtered.reduce((sum, h) => sum + h.shares * h.costBasis, 0);
  const totalPnL = totalValue - totalCost;
  const totalReturn = ((totalPnL / totalCost) * 100).toFixed(1);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      <div className="mb-4">
        <h1 className="text-[19px] font-extrabold text-accent-green mb-1">Portfolio</h1>
        <p className="text-[12.5px] text-[#555]">Alpaca paper trading · {HOLDINGS.length} positions · Live tracking</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#111116] rounded-xl p-3 border border-gold/15 text-center">
          <DollarSign size={13} className="text-gold mx-auto mb-1" />
          <p className="text-[15px] font-black text-[#E8E6E1]">${(totalValue / 1000).toFixed(0)}K</p>
          <p className="text-[9px] text-[#555] font-semibold uppercase">Total Value</p>
        </div>
        <div className="bg-[#111116] rounded-xl p-3 border border-accent-green/15 text-center">
          <TrendingUp size={13} className="text-accent-green mx-auto mb-1" />
          <p className={cn("text-[15px] font-black", totalPnL >= 0 ? "text-accent-green" : "text-red-500")}>
            {totalPnL >= 0 ? "+" : ""}${(totalPnL / 1000).toFixed(0)}K
          </p>
          <p className="text-[9px] text-[#555] font-semibold uppercase">Total P&L</p>
        </div>
        <div className="bg-[#111116] rounded-xl p-3 border border-accent-purple/15 text-center">
          <PieChart size={13} className="text-accent-purple mx-auto mb-1" />
          <p className={cn("text-[15px] font-black", Number(totalReturn) >= 0 ? "text-accent-green" : "text-red-500")}>
            {Number(totalReturn) >= 0 ? "+" : ""}{totalReturn}%
          </p>
          <p className="text-[9px] text-[#555] font-semibold uppercase">All-Time Return</p>
        </div>
      </div>

      {/* Strategy Filters */}
      <div className="flex gap-1.5 mb-4">
        {STRATEGIES.map((s) => (
          <button key={s} onClick={() => setStrategy(s)}
            className={cn("px-3 py-1 rounded-lg text-[10.5px] font-semibold transition-all border",
              strategy === s
                ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                : "border-[#1A1A22] text-[#555] hover:text-[#999]"
            )}>
            {s}
          </button>
        ))}
      </div>

      {/* Holdings Table */}
      <div className="bg-[#0D0D12] border border-[#1A1A22] rounded-xl overflow-hidden">
        <div className="grid grid-cols-6 gap-2 px-3.5 py-2.5 text-[8.5px] text-[#333] font-bold uppercase tracking-wider border-b border-[#131318]">
          <span>Ticker</span><span>Shares</span><span>Price</span><span>Value</span><span>P&L</span><span>Return</span>
        </div>
        {filtered.map((h) => {
          const value = h.shares * h.price;
          const pnl = value - h.shares * h.costBasis;
          const ret = ((pnl / (h.shares * h.costBasis)) * 100).toFixed(1);
          const up = pnl >= 0;
          return (
            <div key={h.ticker} className="grid grid-cols-6 gap-2 px-3.5 py-2.5 border-b border-[#0E0E14] last:border-0 hover:bg-[#111116] transition-colors">
              <div>
                <span className="text-[12px] font-bold text-gold">{h.ticker}</span>
                <p className="text-[9px] text-[#444] truncate">{h.name}</p>
              </div>
              <span className="text-[12px] text-[#777] font-mono self-center">{h.shares}</span>
              <span className="text-[12px] text-[#E8E6E1] font-mono self-center">${h.price.toLocaleString()}</span>
              <span className="text-[12px] text-[#E8E6E1] font-bold self-center">${(value / 1000).toFixed(1)}K</span>
              <div className="self-center flex items-center gap-0.5">
                {up ? <TrendingUp size={9} className="text-accent-green" /> : <TrendingDown size={9} className="text-red-500" />}
                <span className={cn("text-[11px] font-bold", up ? "text-accent-green" : "text-red-500")}>
                  {up ? "+" : ""}${(pnl / 1000).toFixed(1)}K
                </span>
              </div>
              <span className={cn("text-[11px] font-bold self-center", up ? "text-accent-green" : "text-red-500")}>
                {up ? "+" : ""}{ret}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
