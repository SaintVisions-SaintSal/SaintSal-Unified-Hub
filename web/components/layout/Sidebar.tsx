"use client";
import { Plus, Home, Search, Trophy, Newspaper, Monitor, TrendingUp, Building2, Activity, Zap, MessageCircle, Globe, Briefcase, GraduationCap, Mic, ClipboardList, Layers, CreditCard, User, Crown, Rocket, GitBranch, Key, BarChart3, Tag, Shield, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS } from "@/lib/constants";

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  home: Home, search: Search, trophy: Trophy, newspaper: Newspaper, monitor: Monitor,
  "trending-up": TrendingUp, "building-2": Building2, activity: Activity, zap: Zap,
  "message-circle": MessageCircle, globe: Globe, briefcase: Briefcase,
  "graduation-cap": GraduationCap, mic: Mic, "clipboard-list": ClipboardList,
  layers: Layers, "credit-card": CreditCard, user: User, crown: Crown,
  rocket: Rocket, "git-branch": GitBranch, key: Key, "bar-chart-3": BarChart3, tag: Tag, shield: Shield, star: Star,
};

interface SidebarProps {
  user?: { email: string } | null;
  onAuthClick?: () => void;
}

export default function Sidebar({ user, onAuthClick }: SidebarProps) {
  return (
    <aside className="w-[182px] bg-surface-dark border-r border-border-subtle flex flex-col h-screen flex-shrink-0">
      {/* Logo */}
      <div className="px-3 pt-3 pb-2.5 border-b border-border-subtle">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <span className="text-[12px] font-black text-black">S</span>
          </div>
          <div>
            <div className="text-[12.5px] font-extrabold text-gold leading-none">SaintSal</div>
            <div className="text-[7.5px] text-accent-green font-extrabold tracking-[.15em]">LABS</div>
          </div>
        </div>
        <div className="text-[7px] text-[#1E1E2C] font-semibold tracking-[.07em] uppercase">
          Responsible Intelligence™
        </div>
      </div>

      {/* New Chat */}
      <div className="px-1.5 py-1.5">
        <button
          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-gold text-black text-[11.5px] font-bold hover:bg-gold-light transition-colors"
        >
          <Plus size={11} />
          New Chat
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-1 py-1 space-y-0.5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-1">
            <div className="text-[7.5px] text-[#1E1E2C] font-extrabold tracking-[.1em] px-2 py-1.5 uppercase">
              {section.label}
            </div>
            {section.items.map((item) => {
              const Icon = ICONS[item.icon];
              return (
                <button
                  key={item.id}
                  className={cn(
                    "w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11.5px] mb-0.5 transition-all",
                    "text-[#575762] hover:bg-[#161620] hover:text-[#E8E6E1] font-normal"
                  )}
                >
                  {Icon && <Icon size={12} className="flex-shrink-0" />}
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {"pro" in item && item.pro && (
                    <span className="text-[7.5px] font-extrabold px-1 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">
                      PRO
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-1 py-1.5 border-t border-border-subtle">
        <button
          onClick={() => !user && onAuthClick?.()}
          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[#555] hover:bg-[#161620] hover:text-[#E8E6E1] text-[11.5px] transition-all"
        >
          <div className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
            user ? "bg-gold" : "bg-border-muted"
          )}>
            <span className="text-[8px] font-extrabold text-black">
              {user ? user.email[0].toUpperCase() : "?"}
            </span>
          </div>
          <span className="flex-1 truncate">{user ? user.email.split("@")[0] : "Sign In"}</span>
          <span className={cn(
            "text-[8px] font-bold px-1 py-0.5 rounded",
            user ? "bg-accent-green/10 text-accent-green" : "bg-border-muted text-[#555]"
          )}>
            {user ? "PRO" : "FREE"}
          </span>
        </button>
      </div>
    </aside>
  );
}
