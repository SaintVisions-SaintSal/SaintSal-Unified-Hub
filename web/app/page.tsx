// SaintSal™ Unified Hub - Live Heartbeat v1.0.1
"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export default function UnifiedHub() {
  const [user, setUser] = useState<any>(null);
  
  // Real-time Heartbeat State
  const [metrics, setMetrics] = useState({
    uptime: 99.982,
    latency: 38,
    nodes: 124,
    renderProgress: 78
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
    });

    // Simulate High-Frequency WebSocket Stream
    const heartbeat = setInterval(() => {
      setMetrics(prev => ({
        uptime: +(prev.uptime + (Math.random() * 0.001 - 0.0005)).toFixed(3),
        latency: Math.max(32, Math.min(45, prev.latency + (Math.random() > 0.5 ? 1 : -1))),
        nodes: Math.max(120, Math.min(130, prev.nodes + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
        renderProgress: prev.renderProgress >= 100 ? 100 : prev.renderProgress + 0.1
      }));
    }, 2000);

    return () => clearInterval(heartbeat);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto border-x border-[#2d281a] shadow-2xl bg-[#12100a] text-slate-100 font-sans antialiased">
      {/* Header Section - Identical UI */}
      <header className="sticky top-0 z-50 flex items-center bg-[#12100a]/80 backdrop-blur-md p-4 border-b border-[#2d281a] justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#12100a] rounded-lg overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(245,163,10,0.2)]">
            <img src="/logo-main.png" alt="SaintSal Labs" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-slate-100 text-lg font-bold leading-none tracking-tight">SaintSal Labs</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#f5a30a] font-bold opacity-80">System Heartbeat</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex size-10 items-center justify-center rounded-full bg-[#1c180f] border border-[#2d281a] hover:bg-[#2d281a] transition-colors">
            <span className="material-symbols-outlined text-xl text-slate-100">search</span>
          </button>
          <button className="relative flex size-10 items-center justify-center rounded-full bg-[#1c180f] border border-[#2d281a] hover:bg-[#2d281a] transition-colors">
            <span className="material-symbols-outlined text-xl text-slate-100">notifications</span>
            <span className="absolute top-2.5 right-2.5 size-2 bg-[#f5a30a] rounded-full border border-[#12100a] animate-ping"></span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* System Health Overview - Pulsing Data */}
        <section className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Live Telemetry</h2>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span> ALL SYSTEMS NOMINAL
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2 rounded-xl p-4 bg-[#1c180f] border border-[#2d281a] hover:border-[#f5a30a]/30 transition-all">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-xs font-medium uppercase">Uptime</p>
                <span className="material-symbols-outlined text-[#f5a30a] text-sm animate-bounce">bolt</span>
              </div>
              <p className="text-2xl font-bold tracking-tight font-mono">{metrics.uptime}<span className="text-sm font-medium opacity-50">%</span></p>
              <p className="text-emerald-500 text-[10px] font-bold">+0.002% vs prev session</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-4 bg-[#1c180f] border border-[#2d281a] hover:border-[#f5a30a]/30 transition-all">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-xs font-medium uppercase">Latency</p>
                <span className="material-symbols-outlined text-[#f5a30a] text-sm">timer</span>
              </div>
              <p className="text-2xl font-bold tracking-tight font-mono">{metrics.latency}<span className="text-sm font-medium opacity-50">ms</span></p>
              <p className="text-emerald-500 text-[10px] font-bold">Optimized (Global Edge)</p>
            </div>
          </div>
        </section>

        {/* Deployment Health - Real Progress */}
        <section className="px-4 py-2">
          <div className="bg-[#f5a30a]/5 border border-[#f5a30a]/20 rounded-xl p-4 shadow-[inset_0_0_20px_rgba(245,163,10,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f5a30a] animate-spin-slow">dynamic_form</span>
                Deployment Orks
              </h3>
              <span className="text-[10px] font-bold opacity-60 text-slate-400 animate-pulse">REFRESHING...</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-[#2d281a] group hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded bg-black flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined text-white text-lg">terminal</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100">Vercel Production</p>
                    <p className="text-[10px] text-slate-500">Main Hub v4.2.1</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase border border-emerald-500/20">Success</span>
                  <p className="text-[9px] mt-1 opacity-40 text-slate-400">2m ago</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-white/5 p-3 rounded-lg border border-[#2d281a]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-[#4623E9] flex items-center justify-center border border-white/10 shadow-[0_0_10px_rgba(70,35,233,0.3)]">
                      <span className="material-symbols-outlined text-white text-lg">cloud_queue</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">Render API Service</p>
                      <p className="text-[10px] text-slate-500">Core Engine 2.1</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#f5a30a] bg-[#f5a30a]/10 px-2 py-0.5 rounded uppercase border border-[#f5a30a]/20">Building</span>
                  </div>
                </div>
                {/* Real-time Progress Bar */}
                <div className="w-full h-1 bg-[#2d281a] rounded-full overflow-hidden mt-1">
                   <div 
                    className="h-full bg-[#f5a30a] transition-all duration-1000 ease-linear shadow-[0_0_8px_#f5a30a]"
                    style={{ width: `${metrics.renderProgress}%` }}
                   />
                </div>
                <p className="text-[9px] opacity-40 text-slate-400 text-right">{Math.floor(metrics.renderProgress)}% complete</p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Suite Grid Status - Pulsing Indicators */}
        <section className="p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">AI Suite Orchestration</h3>
          <div className="grid grid-cols-2 gap-3">
            {['AI Search', 'AI Finance', 'AI Tech Core', 'AI Medical'].map((item, idx) => (
              <div key={item} className="flex flex-col gap-3 rounded-xl border border-[#2d281a] bg-[#1c180f] p-4 group hover:border-[#f5a30a]/40 transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="size-10 rounded-lg bg-[#f5a30a]/10 flex items-center justify-center text-[#f5a30a] group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">
                      {idx === 0 ? 'pageview' : idx === 1 ? 'payments' : idx === 2 ? 'memory' : 'medical_services'}
                    </span>
                  </div>
                  <span className={`size-2 rounded-full ${idx === 1 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{item}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">
                    {idx === 1 ? 'Degraded Latency' : idx === 2 ? '94% Capacity' : 'Operational'}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-3 rounded-xl border border-[#2d281a] bg-[#1c180f] p-4 col-span-2 group hover:border-[#f5a30a]/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-[#f5a30a]/10 flex items-center justify-center text-[#f5a30a]">
                    <span className="material-symbols-outlined">location_city</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">AI Real Estate</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-tight">System Maintenance</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500">ETA: 42m</span>
                    <span className="size-2 bg-slate-500 rounded-full animate-pulse"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map View - Dynamic Counter */}
        <section className="p-4">
          <div className="relative h-40 w-full rounded-xl overflow-hidden border border-[#2d281a] group cursor-crosshair">
            <img 
              className="h-full w-full object-cover opacity-50 grayscale transition-transform duration-[2000ms] group-hover:scale-110" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkMrhpNXRlhBIXLtxbzmHdxfaeiKhguIDekvcEs3YP6YtWCbXKbRVemDSzj8AUo8jMtiagHVeig0_gA0qQGuDVBSbxu8rz2AfxNkSLoA1VPC6oQasDLAVuCec3ocqtx17lscRonzAOhzhhX4FST0YNwtEz1SNJE2EE4Y0MghZPNk6h0GGD8ht8biYhUgIjU7LkUBcLlU2BJmh95Icb9jasMLVvOmGMNR_3EvlMntnl-6L-tb4t1-r0fZK_UzN_WGLNxtkF9yw8zu0n"
              alt="Network"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12100a] via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <p className="text-[10px] font-bold text-[#f5a30a] uppercase tracking-widest">Active Nodes</p>
              <p className="text-lg font-bold text-slate-100 font-mono transition-all duration-500">{metrics.nodes} Global Instances</p>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Nav - Identical UI */}
      <nav className="fixed bottom-0 z-50 w-full max-w-md bg-[#1c180f]/90 backdrop-blur-lg border-t border-[#2d281a] px-6 pb-6 pt-3 flex items-center justify-between">
        <a className="flex flex-col items-center gap-1 text-[#f5a30a]" href="#">
          <span className="material-symbols-outlined text-2xl font-variation-fill">grid_view</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Dashboard</span>
        </a>
        {['monitoring', 'developer_board', 'settings'].map((icon, idx) => (
          <a key={icon} className="flex flex-col items-center gap-1 text-slate-500 transition-colors hover:text-[#f5a30a]" href="#">
            <span className="material-symbols-outlined text-2xl">{icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {idx === 0 ? 'Analytics' : idx === 1 ? 'Dev Tools' : 'Config'}
            </span>
          </a>
        ))}
      </nav>

      {/* External CSS and Icons */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
