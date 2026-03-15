"use client";
import { useState } from "react";
import { Key, Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface APIKeyConfig {
  name: string;
  provider: string;
  keyPreview: string;
  status: "active" | "expired" | "missing";
  lastUsed: string;
  color: string;
}

const API_CONFIGS: APIKeyConfig[] = [
  { name: "Anthropic (Claude)", provider: "anthropic", keyPreview: "sk-ant-...9f3k", status: "active", lastUsed: "Just now", color: "#F59E0B" },
  { name: "OpenAI (GPT)", provider: "openai", keyPreview: "sk-...7h4d", status: "active", lastUsed: "2min ago", color: "#22C55E" },
  { name: "Google (Gemini)", provider: "gemini", keyPreview: "AIza...Sx8q", status: "active", lastUsed: "5min ago", color: "#818CF8" },
  { name: "xAI (Grok)", provider: "xai", keyPreview: "xai-...8j2m", status: "active", lastUsed: "12min ago", color: "#EC4899" },
  { name: "ElevenLabs", provider: "elevenlabs", keyPreview: "el-...4n7p", status: "active", lastUsed: "1h ago", color: "#F59E0B" },
  { name: "Supabase", provider: "supabase", keyPreview: "eyJ...kQ2", status: "active", lastUsed: "Just now", color: "#22C55E" },
  { name: "Stripe", provider: "stripe", keyPreview: "sk_live_...Mx9", status: "active", lastUsed: "30min ago", color: "#818CF8" },
  { name: "GoHighLevel", provider: "ghl", keyPreview: "ghl-...7kp", status: "active", lastUsed: "3h ago", color: "#22C55E" },
];

export default function APISettings() {
  const [showKeys, setShowKeys] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  const toggleKey = (provider: string) => {
    setShowKeys((prev) => {
      const next = new Set(prev);
      if (next.has(provider)) next.delete(provider);
      else next.add(provider);
      return next;
    });
  };

  const copyKey = (provider: string) => {
    setCopied(provider);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[19px] font-extrabold text-gold mb-1">API Settings</h1>
          <p className="text-[12.5px] text-[#555]">{API_CONFIGS.length} API keys configured · All credentials encrypted</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A2A36] text-[#777] text-[11px] font-semibold hover:text-[#E8E6E1] transition-colors">
          <RefreshCw size={10} />
          Test All
        </button>
      </div>

      {/* API Key Cards */}
      <div className="space-y-2">
        {API_CONFIGS.map((api) => (
          <div key={api.provider} className="bg-[#111116] border border-[#1A1A22] rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: api.color + "15" }}>
                  <Key size={13} style={{ color: api.color }} />
                </div>
                <div>
                  <span className="text-[13px] font-bold text-[#E8E6E1]">{api.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#555]">Last used: {api.lastUsed}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {api.status === "active" ? (
                  <CheckCircle size={10} className="text-accent-green" />
                ) : (
                  <AlertCircle size={10} className="text-red-500" />
                )}
                <span className={cn("text-[9px] font-bold uppercase",
                  api.status === "active" ? "text-accent-green" : "text-red-500")}>{api.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#07070A] rounded-lg px-3 py-2">
              <span className="flex-1 text-[12px] font-mono text-[#555]">
                {showKeys.has(api.provider) ? api.keyPreview.replace("...", "•••••••••") : api.keyPreview}
              </span>
              <button onClick={() => toggleKey(api.provider)} className="text-[#444] hover:text-[#888] transition-colors">
                {showKeys.has(api.provider) ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
              <button onClick={() => copyKey(api.provider)} className="text-[#444] hover:text-gold transition-colors">
                {copied === api.provider ? <Check size={12} className="text-accent-green" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
