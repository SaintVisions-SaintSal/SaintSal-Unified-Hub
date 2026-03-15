"use client";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Circle, Code, Eye, File, ChevronRight, ChevronDown, Copy, Check, Rocket, GitBranch, Terminal, Settings, Image, Video, Wand2, Sparkles, Film, Music, Type, Camera, Palette, Zap, Plus, Trash2, Download, RotateCcw, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBuilderProject } from "@/hooks/useBuilderProject";
import type { BuilderFile, BuilderChatMessage } from "@/lib/builder-types";

/* ── Syntax highlighting ────────────────────────────── */
function highlight(code: string, lang: string): string {
  if (["js", "jsx", "ts", "tsx", "json"].includes(lang)) {
    return code
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/(\/\/.*)/g, '<span style="color:#555">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#555">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span style="color:#98C379">$1</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|default|class|extends|new|this|async|await|try|catch|throw|typeof|instanceof)\b/g, '<span style="color:#C678DD">$1</span>')
      .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, '<span style="color:#D19A66">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#D19A66">$1</span>');
  }
  if (["html", "xml", "svg"].includes(lang)) {
    return code
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/(&lt;\/?)([\w-]+)/g, '$1<span style="color:#E06C75">$2</span>')
      .replace(/([\w-]+)(=)/g, '<span style="color:#D19A66">$1</span>$2')
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#98C379">$1</span>');
  }
  if (lang === "css") {
    return code
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/([\w-]+)(?=\s*:)/g, '<span style="color:#D19A66">$1</span>')
      .replace(/(#[0-9a-fA-F]{3,8})\b/g, '<span style="color:#98C379">$1</span>')
      .replace(/(\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms)?)\b/g, '<span style="color:#D19A66">$1</span>');
  }
  return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ── File icon colors ───────────────────────────────── */
function fileColor(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    jsx: "#61DAFB", tsx: "#3178C6", js: "#F7DF1E", ts: "#3178C6",
    html: "#E34F26", css: "#1572B6", json: "#F59E0B", py: "#3776AB",
    md: "#888", sh: "#22C55E", sql: "#336791", yaml: "#CB171E", yml: "#CB171E",
    env: "#22C55E", mjs: "#F7DF1E", cjs: "#F7DF1E",
  };
  return map[ext] || "#666";
}

/* ── File tree builder ──────────────────────────────── */
interface TreeNode { name: string; fullPath: string; children?: TreeNode[]; }

function buildTree(fileNames: string[]): TreeNode[] {
  const root: TreeNode[] = [];
  for (const path of fileNames.sort()) {
    const parts = path.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const fullPath = parts.slice(0, i + 1).join("/");
      const isFile = i === parts.length - 1;
      let existing = current.find((n) => n.name === name);
      if (!existing) {
        existing = { name, fullPath, ...(isFile ? {} : { children: [] }) };
        current.push(existing);
      }
      if (!isFile && existing.children) current = existing.children;
    }
  }
  return root;
}

/* ── Tree renderer ──────────────────────────────────── */
function FileTreeItem({ node, depth, activeFile, onSelect, onDelete }: {
  node: TreeNode; depth: number; activeFile: string | null; onSelect: (path: string) => void; onDelete?: (path: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const isDir = !!node.children;
  const isActive = node.fullPath === activeFile;

  return (
    <div>
      <div className="group flex items-center">
        <button
          onClick={() => isDir ? setOpen(!open) : onSelect(node.fullPath)}
          className={cn(
            "flex-1 flex items-center gap-1.5 py-1 px-1.5 rounded text-[11px] font-mono transition-all hover:bg-[#1A1A26]",
            isActive && "bg-[#1A1A26] text-gold"
          )}
          style={{ paddingLeft: depth * 12 + 6 }}
        >
          {isDir ? (open ? <ChevronDown size={10} className="text-[#555]" /> : <ChevronRight size={10} className="text-[#555]" />) : <File size={10} style={{ color: fileColor(node.name) }} />}
          <span className={isActive ? "text-gold" : isDir ? "text-[#888]" : "text-[#AAA]"}>{node.name}</span>
        </button>
        {!isDir && onDelete && (
          <button onClick={() => onDelete(node.fullPath)}
            className="opacity-0 group-hover:opacity-100 px-1 text-[#333] hover:text-red-500 transition-all">
            <X size={9} />
          </button>
        )}
      </div>
      {isDir && open && node.children?.map((child) => (
        <FileTreeItem key={child.fullPath} node={child} depth={depth + 1} activeFile={activeFile} onSelect={onSelect} onDelete={onDelete} />
      ))}
    </div>
  );
}

/* ── Chat message renderer ──────────────────────────── */
function renderMsg(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.slice(3).split("\n");
      const lang = lines[0].trim();
      const code = lines.slice(1).join("\n").replace(/```$/, "").trimEnd();
      return (
        <div key={i} className="my-2 rounded-lg overflow-hidden border border-[#191922]">
          <div className="flex items-center justify-between px-2.5 py-1 bg-[#0D0D14] border-b border-[#191922]">
            <span className="text-[9px] text-[#444] font-bold uppercase tracking-wider font-mono">{lang || "code"}</span>
            <button onClick={() => navigator.clipboard?.writeText(code)} className="text-[10px] text-[#555] hover:text-[#E8E6E1]">copy</button>
          </div>
          <pre className="p-3 text-[12px] leading-relaxed overflow-x-auto font-mono bg-[#07070B]"
            dangerouslySetInnerHTML={{ __html: highlight(code, lang) }} />
        </div>
      );
    }
    // Handle bold, file lists, etc.
    const html = part
      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-[#E8E6E1]'>$1</strong>")
      .replace(/^• (.+)$/gm, '<div class="flex gap-1.5 my-0.5 pl-1"><span class="text-gold text-[8px] mt-[5px]">●</span><span class="text-[#888] font-mono text-[11px]">$1</span></div>');
    return <span key={i} className="whitespace-pre-wrap leading-relaxed text-[13px] text-[#D4D1CB]" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

/* ── Preview HTML builder ───────────────────────────── */
function buildPreviewHTML(files: Record<string, BuilderFile>): string {
  const htmlFile = Object.values(files).find((f) => f.language === "html");
  const cssFile = Object.values(files).find((f) => f.language === "css");
  const jsxFile = Object.values(files).find((f) => ["jsx", "tsx"].includes(f.language));
  const jsFile = Object.values(files).find((f) => ["js", "ts"].includes(f.language) && !f.path.includes("config") && !f.path.includes(".d.ts"));

  if (htmlFile) {
    let html = htmlFile.content;
    if (cssFile) html = html.replace("</head>", `<style>${cssFile.content}</style></head>`);
    return html;
  }
  if (jsxFile) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0C0C0F;color:#E8E6E1}</style>
${cssFile ? `<style>${cssFile.content}</style>` : ""}
<script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
</head><body><div id="root"></div>
<script type="text/babel">${jsxFile.content}\nReactDOM.createRoot(document.getElementById('root')).render(React.createElement(typeof App!=='undefined'?App:()=>React.createElement('div',null,'No App component found')));<\/script></body></html>`;
  }
  if (jsFile) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;background:#0C0C0F;color:#E8E6E1;padding:20px}pre{white-space:pre-wrap}</style></head><body><pre id="out"></pre>
<script>const _log=console.log;const _out=[];console.log=(...a)=>{_out.push(a.map(x=>typeof x==='object'?JSON.stringify(x,null,2):String(x)).join(' '));document.getElementById('out').textContent=_out.join('\\n')};${jsFile.content}<\/script></body></html>`;
  }
  return "";
}

/* ── Deploy targets ─────────────────────────────────── */
const DEPLOY_TARGETS = [
  { name: "Vercel", color: "#000", bg: "#fff", desc: "Edge-optimized deployment", icon: "▲" },
  { name: "Cloudflare", color: "#F38020", bg: "#F38020" + "18", desc: "Workers + Pages" },
  { name: "GitHub", color: "#818CF8", bg: "#818CF8" + "18", desc: "Push to repository" },
];

/* ── Image prompt engines ──────────────────────────── */
const IMAGE_ENGINES = [
  { name: "DALL-E 3", icon: Sparkles, color: "#22C55E", desc: "OpenAI flagship" },
  { name: "Midjourney", icon: Palette, color: "#818CF8", desc: "Artistic" },
  { name: "Stable Diffusion", icon: Camera, color: "#F59E0B", desc: "Open-source" },
];

const IMAGE_STARTERS = [
  "Dark luxury tech dashboard UI with amber gold accents and glass morphism",
  "Professional CEO headshot, cinematic lighting, shallow depth of field",
  "Isometric 3D city made of circuit boards and neural networks",
  "Minimalist AI app icon, gold gradient on matte black",
];

/* ── Video types ──────────────────────────────────── */
const VIDEO_TYPES = [
  { name: "TikTok/Reels", icon: Film, duration: "15-60s", desc: "Short-form" },
  { name: "YouTube", icon: Video, duration: "8-15 min", desc: "Long-form" },
  { name: "Product Demo", icon: Camera, duration: "2-5 min", desc: "Showcase" },
  { name: "Ad/Commercial", icon: Sparkles, duration: "15-30s", desc: "Conversion" },
];

const VIDEO_STARTERS = [
  "TikTok: SaintSal Labs AI platform launch — hook + 3 points + CTA",
  "YouTube: How AI replaces SaaS tools — intro, 5 sections, outro",
  "Product demo: AI real estate deal analyzer",
  "Reels: CEO day in the life using AI — 30s trending format",
];

/* ── Starters ───────────────────────────────────────── */
const STARTERS = [
  { label: "SaaS Landing Page", prompt: "Build a SaaS landing page with dark amber theme, hero section, pricing cards, testimonials, and Stripe checkout integration", icon: Rocket },
  { label: "Lead Capture Form", prompt: "Create a lead capture form with multi-step wizard, validation, that posts to GoHighLevel CRM via webhook. Include thank you page", icon: Zap },
  { label: "Analytics Dashboard", prompt: "Build a React analytics dashboard with Recharts bar/line/pie charts, animated stat cards, date range picker, and dark theme", icon: Terminal },
  { label: "Full Next.js App", prompt: "Generate a complete Next.js 15 app with Supabase auth, protected routes, user profile page, settings, and dark amber theme", icon: Code },
];

/* ── Main BuilderIDE ────────────────────────────────── */
export interface BuilderIDEHandle { send: (text: string) => void; }

type RightTab = "code" | "preview" | "images" | "video" | "deploy";

const BuilderIDE = forwardRef<BuilderIDEHandle, { className?: string }>((_, ref) => {
  const builder = useBuilderProject();
  const {
    project, files, chat, activeFile, isGenerating, buildLog, fileList,
    generateProject, editProject, updateFile, deleteFile, setActiveFile,
    exportProject, downloadFiles, clearProject, stopGeneration, runs, rollback,
  } = builder;

  const [rightTab, setRightTab] = useState<RightTab>("code");
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [imageEngine, setImageEngine] = useState("DALL-E 3");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedPrompts, setGeneratedPrompts] = useState<{ engine: string; prompt: string; params: string }[]>([]);
  const [videoType, setVideoType] = useState("TikTok/Reels");
  const [videoTopic, setVideoTopic] = useState("");
  const [generatedScript, setGeneratedScript] = useState<{ hook: string; script: string; shotList: string; runwayPrompt: string; captions: string; music: string } | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    send: (text: string) => {
      if (project) editProject(text);
      else generateProject(text);
    },
  }));

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chat]);

  const currentFile = activeFile ? files[activeFile] : null;
  const tree = buildTree(fileList);
  const hasProject = project !== null;

  const handleChatSend = () => {
    const text = chatInput.trim();
    if (!text || isGenerating) return;
    setChatInput("");
    if (hasProject) editProject(text);
    else generateProject(text);
  };

  const handleChatKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  const copyCode = () => {
    if (currentFile) {
      navigator.clipboard?.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const copyText = (text: string) => navigator.clipboard?.writeText(text);

  const generateImagePrompts = () => {
    if (!imagePrompt.trim()) return;
    const base = imagePrompt.trim();
    setGeneratedPrompts([
      { engine: "DALL-E 3", prompt: `${base}, ultra-detailed, professional quality, 8K resolution, studio lighting`, params: "1024x1024 | HD | Vivid" },
      { engine: "Midjourney", prompt: `${base} --ar 16:9 --v 6.1 --style raw --q 2`, params: "16:9 | v6.1 | 2x | Raw" },
      { engine: "Stable Diffusion", prompt: `(masterpiece, best quality, ultra detailed) ${base}, cinematic composition, volumetric lighting`, params: "30 steps | CFG 7.5 | DPM++ 2M" },
    ]);
  };

  const generateVideoScript = () => {
    if (!videoTopic.trim()) return;
    const topic = videoTopic.trim();
    const vt = VIDEO_TYPES.find((t) => t.name === videoType);
    setGeneratedScript({
      hook: `[HOOK - 3s]\n"${topic.split(" ").slice(0, 5).join(" ")}... here's what nobody tells you."`,
      script: `[SCRIPT - ${vt?.duration || "60s"}]\n\nINTRO: ${topic}\n\n1. The Problem → Most people still do this manually...\n2. The Solution → With SAL, you can...\n3. The Proof → Real results...\n\nCTA: Follow for more. Link in bio.`,
      shotList: `Shot 1: Face to camera (hook)\nShot 2: Screen recording\nShot 3: Before/after split\nShot 4: Results dashboard\nShot 5: CTA`,
      runwayPrompt: `Cinematic footage of ${topic.toLowerCase()}, smooth camera, professional lighting, 4K, dark amber tones`,
      captions: `Bold white text, gold highlights\nCenter-bottom, dark blur bg\nInter Bold, 24px`,
      music: `Electronic/Ambient, 120 BPM\nMood: Innovative, premium\nEpidemic Sound "Tech Innovation"`,
    });
  };

  const RIGHT_TABS: { key: RightTab; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
    { key: "code", icon: Code, label: "Code" },
    { key: "preview", icon: Eye, label: "Preview" },
    { key: "images", icon: Image, label: "Images" },
    { key: "video", icon: Video, label: "Video" },
    { key: "deploy", icon: Rocket, label: "Deploy" },
  ];

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ── Left: Chat + Input ──────────────────── */}
      <div className="w-[38%] flex flex-col border-r border-border-subtle overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 border-b border-[#0F0F18] flex items-center gap-1.5 flex-shrink-0">
          <Circle size={6} className="text-gold fill-gold" />
          <span className="text-[10.5px] font-bold text-gold tracking-wider">SAL BUILDER</span>
          {project && (
            <span className="text-[9px] text-[#555] font-mono ml-1 truncate">{project.name}</span>
          )}
          <span className="text-[9px] text-[#333] ml-auto font-mono">{fileList.length} files</span>
          {hasProject && (
            <div className="flex items-center gap-1 ml-1">
              <button onClick={downloadFiles} className="text-[#333] hover:text-gold transition-colors" title="Download files">
                <Download size={10} />
              </button>
              <button onClick={clearProject} className="text-[#333] hover:text-red-500 transition-colors" title="New project">
                <Plus size={10} />
              </button>
            </div>
          )}
        </div>

        {/* Chat messages */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {chat.length === 0 && (
            <div className="pt-3 animate-fade-up">
              <p className="text-[14px] font-bold text-[#E8E6E1] mb-1">What do you want to build?</p>
              <p className="text-[11px] text-[#555] mb-4">Describe any app — SAL generates complete, deployable code with a real project structure.</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {STARTERS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <button key={i} onClick={() => generateProject(s.prompt)}
                      className="flex items-start gap-2 p-2.5 rounded-xl border border-[#1A1A22] bg-[#111116] text-left hover:border-gold/20 hover:bg-gold/5 transition-all">
                      <Icon size={12} className="text-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-[#888] mb-0.5">{s.label}</p>
                        <p className="text-[9px] text-[#444] line-clamp-2">{s.prompt.slice(0, 60)}...</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {chat.map((m) => (
            <div key={m.id} className="py-1.5 animate-fade-up">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black"
                  style={{ background: m.role === "user" ? "#1E1E28" : "linear-gradient(135deg,#F59E0B,#D97706)", borderRadius: m.role === "user" ? "50%" : "5px", color: m.role === "user" ? "#666" : "#000" }}>
                  {m.role === "user" ? "C" : "S"}
                </div>
                <span className="text-[11px] font-bold" style={{ color: m.role === "user" ? "#777" : "#F59E0B" }}>
                  {m.role === "user" ? "You" : "SAL"}
                </span>
              </div>
              <div>{renderMsg(m.content)}</div>
            </div>
          ))}
          {isGenerating && chat.length > 0 && !chat[chat.length - 1].content && (
            <span className="inline-flex gap-1 ml-7">{[0,1,2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />)}</span>
          )}
        </div>

        {/* Chat input */}
        <div className="px-2.5 py-2 border-t border-[#0F0F18] flex-shrink-0">
          <div className="flex items-end gap-1.5 bg-[#0D0D12] border border-[#1A1A22] rounded-xl px-2.5 py-1">
            <textarea
              ref={textareaRef}
              value={chatInput}
              onChange={(e) => { setChatInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
              onKeyDown={handleChatKey}
              placeholder={hasProject ? "Describe changes..." : "Describe what to build..."}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-[12.5px] text-[#E8E6E1] placeholder-[#444] py-1.5 leading-relaxed max-h-[100px] font-sans"
            />
            {isGenerating ? (
              <button onClick={stopGeneration} className="w-6 h-6 rounded-md bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors mb-0.5">
                <Square size={9} />
              </button>
            ) : (
              <button onClick={handleChatSend}
                disabled={!chatInput.trim()}
                className={cn("w-6 h-6 rounded-md flex items-center justify-center transition-all mb-0.5",
                  chatInput.trim() ? "bg-gold text-black cursor-pointer hover:bg-gold-light" : "bg-[#1A1A22] text-[#444] cursor-not-allowed")}>
                <Zap size={9} />
              </button>
            )}
          </div>
          {/* Build status */}
          {isGenerating && (
            <div className="flex items-center gap-1.5 mt-1.5 px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[9px] text-gold font-bold">
                {hasProject ? "Applying changes..." : "Generating project..."}
              </span>
            </div>
          )}
          {!isGenerating && buildLog.length > 0 && (
            <div className="mt-1.5 px-1 space-y-0.5">
              {buildLog.slice(-3).map((line, i) => (
                <div key={i} className="text-[9px] font-mono text-[#444]">{line}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel ──────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* File tree sidebar */}
        {fileList.length > 0 && rightTab === "code" && (
          <div className="w-[180px] border-r border-border-subtle overflow-y-auto bg-[#09090E] flex-shrink-0">
            <div className="px-2.5 py-2 border-b border-[#131318] flex items-center justify-between">
              <span className="text-[9px] text-[#333] font-extrabold tracking-widest uppercase">FILES</span>
              <span className="text-[8px] text-[#222] font-mono">{fileList.length}</span>
            </div>
            <div className="py-1">
              {tree.map((node) => (
                <FileTreeItem key={node.fullPath} node={node} depth={0} activeFile={activeFile} onSelect={setActiveFile} onDelete={deleteFile} />
              ))}
            </div>
            {/* Rollback */}
            {runs.length > 0 && (
              <div className="px-2.5 py-2 border-t border-[#131318]">
                <p className="text-[8px] text-[#333] font-bold uppercase tracking-wider mb-1">History</p>
                {runs.slice(-3).reverse().map((r, i) => (
                  <button key={r.id} onClick={() => rollback(r.id)}
                    className="w-full flex items-center gap-1.5 px-1.5 py-1 rounded text-[9px] text-[#555] hover:text-gold hover:bg-[#1A1A26] transition-all">
                    <RotateCcw size={8} />
                    <span className="truncate">{r.prompt.slice(0, 25)}...</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Editor / Preview / Images / Video / Deploy */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 py-1.5 border-b border-border-subtle flex items-center gap-1 flex-shrink-0">
            {RIGHT_TABS.map((v) => {
              const Icon = v.icon;
              return (
                <button key={v.key} onClick={() => setRightTab(v.key)}
                  className={cn("px-2 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1",
                    rightTab === v.key ? "bg-[#1C1C26] text-gold" : "text-[#555] hover:text-[#888]")}>
                  <Icon size={10} />{v.label}
                </button>
              );
            })}
            {rightTab === "code" && currentFile && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#444]">{currentFile.path}</span>
                <span className="text-[8px] px-1 py-0.5 rounded font-bold" style={{
                  color: currentFile.editedBy === "ai" ? "#F59E0B" : "#22C55E",
                  background: currentFile.editedBy === "ai" ? "#F59E0B18" : "#22C55E18",
                }}>{currentFile.editedBy === "ai" ? "AI" : "YOU"}</span>
                <button onClick={copyCode} className="flex items-center gap-1 text-[10px] text-[#555] hover:text-gold transition-colors">
                  {copied ? <><Check size={9} />Copied</> : <><Copy size={9} />Copy</>}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto bg-[#07070A]">
            {/* ── Code ────────────────────── */}
            {rightTab === "code" && currentFile && (
              <div className="flex">
                <div className="px-3 py-4 text-right select-none border-r border-[#131318] bg-[#07070A] sticky left-0">
                  {currentFile.content.split("\n").map((_, i) => (
                    <div key={i} className="text-[11px] leading-relaxed text-[#2A2A36] font-mono">{i + 1}</div>
                  ))}
                </div>
                <pre className="p-4 text-[12.5px] leading-relaxed overflow-x-auto font-mono flex-1"
                  dangerouslySetInnerHTML={{ __html: highlight(currentFile.content, currentFile.language) }} />
              </div>
            )}
            {rightTab === "code" && !currentFile && (
              <div className="flex flex-col items-center justify-center h-full gap-2.5 opacity-40">
                <Code size={32} className="text-[#555]" />
                <span className="text-[12.5px] text-[#555]">{hasProject ? "Select a file from the tree" : "Describe what to build → code appears here"}</span>
              </div>
            )}

            {/* ── Preview ─────────────────── */}
            {rightTab === "preview" && fileList.length > 0 && (
              <iframe srcDoc={buildPreviewHTML(files)} className="w-full h-full border-none bg-white" title="preview" sandbox="allow-scripts" />
            )}
            {rightTab === "preview" && fileList.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2.5 opacity-40">
                <Eye size={32} className="text-[#555]" />
                <span className="text-[12.5px] text-[#555]">Generate code to preview here</span>
              </div>
            )}

            {/* ── Images ──────────────────── */}
            {rightTab === "images" && (
              <div className="p-4 space-y-4 overflow-y-auto">
                <div>
                  <h3 className="text-[14px] font-bold text-[#E8E6E1] mb-1 flex items-center gap-2">
                    <Wand2 size={14} className="text-gold" /> Image Prompt Generator
                  </h3>
                  <p className="text-[11px] text-[#555] mb-3">Optimized prompts for DALL-E 3, Midjourney, and Stable Diffusion.</p>
                </div>
                <div className="flex gap-2">
                  {IMAGE_ENGINES.map((e) => {
                    const Icon = e.icon;
                    return (
                      <button key={e.name} onClick={() => setImageEngine(e.name)}
                        className={cn("flex-1 p-2.5 rounded-xl border text-left transition-all",
                          imageEngine === e.name ? "border-gold/40 bg-gold/8" : "border-[#1A1A22] bg-[#111116] hover:border-[#2A2A36]")}>
                        <div className="flex items-center gap-1.5">
                          <Icon size={11} style={{ color: e.color }} />
                          <span className={cn("text-[11px] font-bold", imageEngine === e.name ? "text-gold" : "text-[#888]")}>{e.name}</span>
                        </div>
                        <p className="text-[9px] text-[#555] mt-0.5">{e.desc}</p>
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  <textarea value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the image..."
                    className="w-full bg-[#111116] border border-[#1A1A22] rounded-xl px-3 py-2.5 text-[13px] text-[#E8E6E1] placeholder-[#444] resize-none h-16 outline-none focus:border-gold/30 transition-colors" />
                  <button onClick={generateImagePrompts}
                    className="px-4 py-2 rounded-lg bg-gold text-black text-[12px] font-bold hover:bg-gold-light transition-colors flex items-center gap-1.5">
                    <Wand2 size={12} /> Generate
                  </button>
                </div>
                {!generatedPrompts.length && (
                  <div className="space-y-1.5">
                    {IMAGE_STARTERS.map((s, i) => (
                      <button key={i} onClick={() => setImagePrompt(s)}
                        className="block w-full px-3 py-2 rounded-lg border border-[#1A1A22] text-[11px] text-[#666] text-left hover:text-gold hover:border-gold/20 transition-all">{s}</button>
                    ))}
                  </div>
                )}
                {generatedPrompts.length > 0 && (
                  <div className="space-y-3">
                    {generatedPrompts.map((gp, i) => (
                      <div key={i} className="p-3 rounded-xl border border-[#1A1A22] bg-[#111116]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold" style={{ color: IMAGE_ENGINES.find((e) => e.name === gp.engine)?.color }}>{gp.engine}</span>
                          <button onClick={() => copyText(gp.prompt)} className="text-[10px] text-[#555] hover:text-gold flex items-center gap-1"><Copy size={9} /> Copy</button>
                        </div>
                        <p className="text-[12px] text-[#D4D1CB] font-mono bg-[#0A0A10] p-2.5 rounded-lg border border-[#151520] leading-relaxed">{gp.prompt}</p>
                        <p className="text-[9px] text-[#444] font-mono mt-1.5">{gp.params}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Video ───────────────────── */}
            {rightTab === "video" && (
              <div className="p-4 space-y-4 overflow-y-auto">
                <div>
                  <h3 className="text-[14px] font-bold text-[#E8E6E1] mb-1 flex items-center gap-2">
                    <Film size={14} className="text-gold" /> Video Script Generator
                  </h3>
                  <p className="text-[11px] text-[#555] mb-3">Scripts, hooks, shot lists, Runway prompts, captions, music.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {VIDEO_TYPES.map((vt) => {
                    const Icon = vt.icon;
                    return (
                      <button key={vt.name} onClick={() => setVideoType(vt.name)}
                        className={cn("p-2.5 rounded-xl border text-left transition-all",
                          videoType === vt.name ? "border-gold/40 bg-gold/8" : "border-[#1A1A22] bg-[#111116] hover:border-[#2A2A36]")}>
                        <div className="flex items-center gap-1.5">
                          <Icon size={11} className={videoType === vt.name ? "text-gold" : "text-[#666]"} />
                          <span className={cn("text-[11px] font-bold", videoType === vt.name ? "text-gold" : "text-[#888]")}>{vt.name}</span>
                        </div>
                        <span className="text-[9px] text-[#555]">{vt.duration} · {vt.desc}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  <textarea value={videoTopic} onChange={(e) => setVideoTopic(e.target.value)}
                    placeholder="What is your video about?"
                    className="w-full bg-[#111116] border border-[#1A1A22] rounded-xl px-3 py-2.5 text-[13px] text-[#E8E6E1] placeholder-[#444] resize-none h-16 outline-none focus:border-gold/30 transition-colors" />
                  <button onClick={generateVideoScript}
                    className="px-4 py-2 rounded-lg bg-gold text-black text-[12px] font-bold hover:bg-gold-light transition-colors flex items-center gap-1.5">
                    <Film size={12} /> Generate Script
                  </button>
                </div>
                {!generatedScript && (
                  <div className="space-y-1.5">
                    {VIDEO_STARTERS.map((s, i) => (
                      <button key={i} onClick={() => setVideoTopic(s)}
                        className="block w-full px-3 py-2 rounded-lg border border-[#1A1A22] text-[11px] text-[#666] text-left hover:text-gold hover:border-gold/20 transition-all">{s}</button>
                    ))}
                  </div>
                )}
                {generatedScript && (
                  <div className="space-y-3">
                    {[
                      { label: "Hook", icon: Zap, color: "#EF4444", content: generatedScript.hook },
                      { label: "Full Script", icon: Type, color: "#22C55E", content: generatedScript.script },
                      { label: "Shot List", icon: Camera, color: "#818CF8", content: generatedScript.shotList },
                      { label: "Runway Gen-3", icon: Film, color: "#F59E0B", content: generatedScript.runwayPrompt },
                      { label: "Captions", icon: Type, color: "#EC4899", content: generatedScript.captions },
                      { label: "Music", icon: Music, color: "#22C55E", content: generatedScript.music },
                    ].map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <div key={i} className="p-3 rounded-xl border border-[#1A1A22] bg-[#111116]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold flex items-center gap-1.5" style={{ color: s.color }}><Icon size={10} /> {s.label}</span>
                            <button onClick={() => copyText(s.content)} className="text-[10px] text-[#555] hover:text-gold flex items-center gap-1"><Copy size={9} /> Copy</button>
                          </div>
                          <pre className="text-[11px] text-[#D4D1CB] font-mono bg-[#0A0A10] p-2.5 rounded-lg border border-[#151520] leading-relaxed whitespace-pre-wrap">{s.content}</pre>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Deploy ──────────────────── */}
            {rightTab === "deploy" && (
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-[14px] font-bold text-[#E8E6E1] mb-1">Deploy Targets</h3>
                  <p className="text-[11px] text-[#555] mb-3">Push your generated code to production.</p>
                </div>
                {DEPLOY_TARGETS.map((t) => (
                  <div key={t.name} className="flex items-center justify-between p-3.5 rounded-xl border border-[#1A1A22] bg-[#111116] hover:border-[#2A2A36] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: t.bg }}>
                        {t.name === "Vercel" && <span className="text-[11px] font-black text-white">▲</span>}
                        {t.name === "Cloudflare" && <Settings size={14} style={{ color: t.color }} />}
                        {t.name === "GitHub" && <GitBranch size={14} style={{ color: t.color }} />}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#E8E6E1]">{t.name}</p>
                        <p className="text-[11px] text-[#555]">{t.desc}</p>
                      </div>
                    </div>
                    <button disabled={!hasProject}
                      className={cn("px-3.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all",
                        hasProject ? "border-gold/30 text-gold hover:bg-gold/10" : "border-[#1A1A22] text-[#333] cursor-not-allowed")}>
                      Deploy
                    </button>
                  </div>
                ))}
                {fileList.length > 0 && (
                  <div className="mt-4 p-3.5 bg-[#0D0D12] border border-[#1A1A22] rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal size={12} className="text-gold" />
                      <span className="text-[11px] font-bold text-[#888]">Build Output</span>
                    </div>
                    <div className="font-mono text-[11px] leading-relaxed text-[#555] space-y-0.5">
                      {buildLog.map((line, i) => <div key={i}>{line}</div>)}
                    </div>
                  </div>
                )}
                {hasProject && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={exportProject}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1A1A22] text-[11px] text-[#888] hover:text-gold hover:border-gold/20 transition-all">
                      <Download size={10} /> Export JSON
                    </button>
                    <button onClick={downloadFiles}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1A1A22] text-[11px] text-[#888] hover:text-gold hover:border-gold/20 transition-all">
                      <Download size={10} /> Download All
                    </button>
                  </div>
                )}
                {!hasProject && (
                  <div className="text-center py-8 text-[#333] text-[12px]">
                    Generate a project first, then deploy here.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

BuilderIDE.displayName = "BuilderIDE";
export default BuilderIDE;
