"use client";
import { useState } from "react";
import { X, Eye, EyeOff, Chrome } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: { email: string }) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  const submitEmailPassword = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        if (data.user) onSuccess({ email: data.user.email ?? email });
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        if (data.user) onSuccess({ email: data.user.email ?? email });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const submitMagicLink = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) throw err;
      setMagicSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) throw err;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  };

  if (magicSent) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()}
          className="bg-[#0F0F16] border border-gold/15 rounded-2xl p-6 w-[350px] max-w-full animate-fade-up shadow-2xl text-center">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">✉️</span>
          </div>
          <h2 className="text-[15px] font-bold text-[#E8E6E1] mb-2">Check your email</h2>
          <p className="text-[12.5px] text-[#555] mb-4">
            We sent a magic link to <span className="text-gold font-semibold">{email}</span>. Click the link to sign in.
          </p>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#333] text-[#777] text-[12px] hover:text-[#E8E6E1] transition-colors">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-[#0F0F16] border border-gold/15 rounded-2xl p-6 w-[350px] max-w-full animate-fade-up shadow-2xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                <span className="text-[9px] font-black text-black">S</span>
              </div>
              <span className="text-[13px] font-extrabold text-gold">SaintSal™ Labs</span>
            </div>
            <p className="text-[11px] text-[#555]">Responsible Intelligence™</p>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-[#E8E6E1] transition-colors mt-0.5">
            <X size={15} />
          </button>
        </div>

        <div className="flex gap-1 mb-5 bg-[#07070A] rounded-lg p-0.5">
          {(["signin", "signup"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              className={cn("flex-1 py-1.5 rounded-md text-[12px] font-semibold transition-all",
                mode === m ? "bg-[#1A1A26] text-gold" : "text-[#555] hover:text-[#888]")}>
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <button onClick={signInWithGoogle} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#2A2A36] text-[#E8E6E1] text-[13px] font-semibold hover:bg-[#161620] transition-all mb-3">
          <Chrome size={14} />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-[#1E1E2A]" />
          <span className="text-[10px] text-[#333] font-semibold">OR</span>
          <div className="flex-1 h-px bg-[#1E1E2A]" />
        </div>

        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email address"
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-[#E8E6E1] text-[13.5px] outline-none mb-2.5 placeholder-[#444] font-sans focus:border-gold/40 transition-colors"
        />

        <div className="relative mb-3">
          <input value={password} onChange={(e) => setPassword(e.target.value)}
            type={showPass ? "text" : "password"} placeholder="Password"
            className="w-full px-3 py-2.5 pr-10 rounded-lg border border-border bg-surface text-[#E8E6E1] text-[13.5px] outline-none placeholder-[#444] font-sans focus:border-gold/40 transition-colors"
            onKeyDown={(e) => { if (e.key === "Enter") submitEmailPassword(); }}
          />
          <button onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors">
            {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>

        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] mb-3">{error}</div>
        )}

        <button onClick={submitEmailPassword} disabled={!email || !password || loading}
          className={cn("w-full py-2.5 rounded-lg text-[13.5px] font-bold transition-all flex items-center justify-center gap-2 mb-2",
            email && password ? "bg-gold text-black cursor-pointer hover:bg-gold-light" : "bg-border-muted text-[#444] cursor-not-allowed")}>
          {loading ? (
            <><div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" /><span>Authenticating...</span></>
          ) : mode === "signin" ? "Sign In" : "Create Account"}
        </button>

        <button onClick={submitMagicLink} disabled={!email || loading}
          className="w-full py-2 text-[12px] text-[#555] hover:text-gold transition-colors font-semibold mb-3">
          Send magic link instead
        </button>

        <p className="text-center text-[10px] text-[#2A2A36] leading-snug">
          Protected by Supabase · HACP Protocol · Patent #10,290,222
        </p>
      </div>
    </div>
  );
}
