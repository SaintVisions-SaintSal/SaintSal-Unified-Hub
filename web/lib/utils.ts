import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchBTCPrice(): Promise<string> {
  try {
    const r = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot", { next: { revalidate: 60 } });
    const d = await r.json();
    return parseFloat(d?.data?.price || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
  } catch {
    return "104,820";
  }
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + "..." : str;
}
