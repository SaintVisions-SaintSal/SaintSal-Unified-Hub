"use client";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  ceo: "CEO Console",
  search: "Search",
  sports: "Sports Intelligence",
  news: "News & Geopolitics",
  tech: "Tech Intelligence",
  finance: "Finance",
  realestate: "Real Estate",
  medical: "Medical Intelligence",
  builder: "Builder IDE",
  social: "Social Studio",
  domains: "Domain Hub",
  bizcenter: "Business Center",
  career: "Career Suite",
  voice: "Voice AI",
  bizplan: "Business Plan",
  integrations: "Integrations",
  pricing: "Pricing",
  account: "Account",
  reintelligence: "RE Intelligence",
  portfolio: "Portfolio",
  github: "GitHub Console",
  deploy: "Deployment Hub",
  credits: "Credits & Billing",
  apisettings: "API Settings",
  legal: "Legal & Compliance",
};

interface HeaderProps {
  page: string;
  user?: { email: string } | null;
  onAuthClick?: () => void;
}

export default function Header({ page, user, onAuthClick }: HeaderProps) {
  return (
    <header className="h-[42px] flex items-center justify-between px-4 border-b border-border-subtle bg-surface-dark flex-shrink-0">
      <h1 className="text-[13px] font-bold text-[#E8E6E1] tracking-tight">
        {PAGE_TITLES[page] || "SaintSal™ Labs"}
      </h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-[10px] text-[#555] font-semibold">All systems live</span>
        </div>
        <button
          onClick={() => !user && onAuthClick?.()}
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold transition-colors",
            user ? "bg-gold text-black" : "bg-border-muted text-[#555] hover:bg-[#2A2A36]"
          )}
        >
          {user ? user.email[0].toUpperCase() : "?"}
        </button>
      </div>
    </header>
  );
}
