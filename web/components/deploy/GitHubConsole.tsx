"use client";
import { useState } from "react";
import { GitBranch, GitCommit, GitPullRequest, ExternalLink, RefreshCw, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const REPOS = [
  { name: "saintsallabs-web", org: "saintsal-org", branch: "main", lastCommit: "feat: add streaming search with web grounding", time: "2h ago", status: "passing" },
  { name: "saintsallabs-api", org: "saintsal-org", branch: "main", lastCommit: "fix: SSE connection timeout handling", time: "5h ago", status: "passing" },
  { name: "saintsallabs-mobile", org: "saintsal-org", branch: "main", lastCommit: "chore: update Expo SDK to 52.0.0", time: "1d ago", status: "passing" },
  { name: "builder-core", org: "saintsal-org", branch: "develop", lastCommit: "feat: multi-file project generation", time: "3d ago", status: "failing" },
];

const RECENT_COMMITS = [
  { repo: "saintsallabs-web", hash: "a3f8e21", message: "feat: add streaming search with web grounding", author: "cap", time: "2h ago" },
  { repo: "saintsallabs-web", hash: "b7c4d19", message: "fix: market ticker data refresh interval", author: "cap", time: "4h ago" },
  { repo: "saintsallabs-api", hash: "e2f1a08", message: "fix: SSE connection timeout handling", author: "cap", time: "5h ago" },
  { repo: "saintsallabs-api", hash: "d9e3b44", message: "feat: add social/generate endpoint", author: "cap", time: "8h ago" },
  { repo: "saintsallabs-web", hash: "c1a7f55", message: "style: refine dashboard stats grid layout", author: "cap", time: "12h ago" },
];

export default function GitHubConsole() {
  const [tab, setTab] = useState<"repos" | "commits">("repos");

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[19px] font-extrabold text-accent-purple mb-1">GitHub Console</h1>
          <p className="text-[12.5px] text-[#555]">{REPOS.length} repositories · CI/CD monitoring</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A2A36] text-[#777] text-[11px] font-semibold hover:text-[#E8E6E1] transition-colors">
          <RefreshCw size={10} />
          Sync
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[#07070A] rounded-lg p-0.5 w-fit">
        {(["repos", "commits"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-3.5 py-1.5 rounded-md text-[12px] font-semibold transition-all capitalize",
              tab === t ? "bg-[#1A1A26] text-accent-purple" : "text-[#555] hover:text-[#888]")}>
            {t}
          </button>
        ))}
      </div>

      {tab === "repos" ? (
        <div className="space-y-2">
          {REPOS.map((repo) => (
            <div key={repo.name} className="bg-[#111116] border border-[#1A1A22] rounded-xl p-3.5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GitBranch size={13} className="text-accent-purple" />
                  <div>
                    <span className="text-[13px] font-bold text-[#E8E6E1]">{repo.org}/{repo.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-accent-purple font-mono">{repo.branch}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {repo.status === "passing" ? (
                    <span className="flex items-center gap-1 text-[9px] text-accent-green font-bold uppercase">
                      <CheckCircle size={9} /> Passing
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] text-red-500 font-bold uppercase">
                      <XCircle size={9} /> Failing
                    </span>
                  )}
                  <ExternalLink size={11} className="text-[#444]" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GitCommit size={10} className="text-[#444]" />
                <span className="text-[11px] text-[#777] truncate">{repo.lastCommit}</span>
                <span className="text-[10px] text-[#333] ml-auto flex-shrink-0">{repo.time}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0D0D12] border border-[#1A1A22] rounded-xl overflow-hidden">
          {RECENT_COMMITS.map((c, i) => (
            <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 border-b border-[#131318] last:border-0 hover:bg-[#111116] transition-colors">
              <GitCommit size={12} className="text-accent-purple flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-accent-purple font-mono">{c.hash}</span>
                  <span className="text-[10px] text-[#333]">{c.repo}</span>
                </div>
                <p className="text-[12px] text-[#999] truncate">{c.message}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-[#555]">{c.author}</p>
                <div className="flex items-center gap-0.5 justify-end">
                  <Clock size={8} className="text-[#333]" />
                  <span className="text-[9px] text-[#333]">{c.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
