"use client";
import { useState, useEffect } from "react";

export interface MarketData {
  btc: string; eth: string;
  spx: string; ndx: string; dow: string;
  spx_chg?: string; ndx_chg?: string; dow_chg?: string;
  btc_chg?: string; eth_chg?: string;
  vix: string; y10: string; oil: string;
  timestamp?: number;
}

const DEFAULT: MarketData = {
  btc: "—", eth: "—",
  spx: "—", ndx: "—", dow: "—",
  vix: "—", y10: "—", oil: "—",
};

export function useMarkets(enabled = true) {
  const [data, setData] = useState<MarketData>(DEFAULT);

  useEffect(() => {
    if (!enabled) return;
    const fetchData = () =>
      fetch("/api/markets").then((r) => r.json()).then(setData).catch(() => {});
    fetchData();
    const t = setInterval(fetchData, 30000); // poll every 30s
    return () => clearInterval(t);
  }, [enabled]);

  return data;
}
