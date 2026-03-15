"use client";
import { useState, useRef } from "react";
import { Plus, Mic, Send, Sparkles, Check, Image, Search, FileText, Download, X, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Attachment } from "@/hooks/useChat";

const PLACEHOLDERS: Record<string, string> = {
  search: "Ask SAL anything...", sports: "Scores, stats, teams, fantasy...", news: "What is happening today...",
  tech: "Code, explain, analyze...", finance: "Markets, stocks, crypto...", realestate: "Deals, comps, analysis...",
  medical: "ICD codes, SOAP notes, Rx...", builder: "Describe what to build...", social: "What should we post about?",
  career: "Resume, jobs, interview prep...", bizplan: "Describe your business...", dashboard: "Ask SAL anything...",
  domains: "Domain names, DNS, branding...", bizcenter: "LLC, EIN, formation...", voice: "Talk to SAL...",
};

const MODELS = ["SAL Mini", "SAL Pro", "SAL Max", "SAL Max Fast"];

interface InputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: (v: string, attachments?: Attachment[]) => void;
  page: string;
  disabled?: boolean;
  onExport?: (format: "txt" | "pdf") => void;
  onSearch?: () => void;
  hasMessages?: boolean;
  searchMode?: boolean;
}

export default function InputBar({ value, onChange, onSend, page, disabled, onExport, hasMessages, searchMode, onSearch }: InputBarProps) {
  const [model, setModel] = useState("SAL Pro");
  const [modelOpen, setModelOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend(value, attachments.length > 0 ? attachments : undefined);
        setAttachments([]);
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [...prev, {
          type: "image",
          name: file.name,
          url: reader.result as string,
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const canSend = value.trim() && !disabled;

  return (
    <div className="absolute bottom-0 left-0 right-0 gradient-fade px-4 pt-4 pb-3">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-2 px-1">
          {attachments.map((a, i) => (
            <div key={i} className="relative group">
              <img src={a.url} alt={a.name} className="w-16 h-16 rounded-lg object-cover border border-[#1A1A22]" />
              <button onClick={() => removeAttachment(i)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={8} className="text-white" />
              </button>
              <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[8px] text-center text-[#aaa] rounded-b-lg truncate px-0.5">{a.name}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl px-3 py-0.5 flex items-end gap-1.5 shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
        {/* Attach menu */}
        <div className="flex items-center gap-0.5 mb-2.5">
          <button onClick={() => fileRef.current?.click()} className="text-[#333] hover:text-[#888] transition-colors" title="Attach image">
            <Paperclip size={13} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKey}
          placeholder={PLACEHOLDERS[page] || "Ask SAL anything..."}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-[#E8E6E1] placeholder-[#444] py-2.5 leading-relaxed max-h-[120px] overflow-y-auto font-sans"
        />
        <div className="flex items-center gap-1 mb-1.5">
          {/* Search toggle */}
          {onSearch && (
            <button onClick={onSearch}
              className={cn("w-7 h-7 rounded-md border flex items-center justify-center transition-colors",
                searchMode ? "border-gold bg-gold/10 text-gold" : "border-border bg-[#0D0D12] text-[#444] hover:text-[#888]")}
              title="Live search">
              <Search size={11} />
            </button>
          )}

          {/* Export menu */}
          {hasMessages && onExport && (
            <div className="relative">
              <button onClick={() => setExportOpen(!exportOpen)}
                className="w-7 h-7 rounded-md border border-border bg-[#0D0D12] flex items-center justify-center text-[#444] hover:text-[#888] transition-colors"
                title="Export chat">
                <Download size={11} />
              </button>
              {exportOpen && (
                <div className="absolute bottom-full right-0 mb-1 bg-surface border border-border rounded-lg overflow-hidden min-w-[130px] z-50 shadow-xl">
                  <button onClick={() => { onExport("txt"); setExportOpen(false); }}
                    className="w-full px-3 py-1.5 text-[11px] text-left flex items-center gap-1.5 hover:bg-[#1C1C26] transition-colors text-[#888]">
                    <FileText size={9} />Export .txt
                  </button>
                  <button onClick={() => { onExport("pdf"); setExportOpen(false); }}
                    className="w-full px-3 py-1.5 text-[11px] text-left flex items-center gap-1.5 hover:bg-[#1C1C26] transition-colors text-[#888]">
                    <FileText size={9} />Export PDF
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Model selector */}
          <div className="relative">
            <button
              onClick={() => setModelOpen((o) => !o)}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-border text-[10.5px] text-[#555] hover:text-[#E8E6E1] transition-colors bg-[#0D0D12] whitespace-nowrap"
            >
              <Sparkles size={8} className="text-gold" />
              {model}
            </button>
            {modelOpen && (
              <div className="absolute bottom-full right-0 mb-1 bg-surface border border-border rounded-lg overflow-hidden min-w-[120px] z-50 shadow-xl">
                {MODELS.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setModel(m); setModelOpen(false); }}
                    className="w-full px-3 py-1.5 text-[11px] text-left flex items-center gap-1.5 hover:bg-[#1C1C26] transition-colors"
                    style={{ color: m === model ? "#F59E0B" : "#666" }}
                  >
                    {m === model ? <Check size={8} className="text-gold" /> : <span className="w-2" />}
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="w-7 h-7 rounded-md border border-border bg-[#0D0D12] flex items-center justify-center text-[#444] hover:text-[#888] transition-colors">
            <Mic size={11} />
          </button>
          <button
            onClick={() => { if (canSend) { onSend(value, attachments.length > 0 ? attachments : undefined); setAttachments([]); } }}
            disabled={!canSend}
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center transition-all",
              canSend ? "bg-gold cursor-pointer hover:bg-gold-light" : "bg-border-muted cursor-not-allowed"
            )}
          >
            <Send size={10} className={canSend ? "text-black" : "text-[#444]"} />
          </button>
        </div>
      </div>
      <p className="text-center text-[8.5px] text-[#1A1A24] mt-1.5">
        SaintSal™ · Responsible Intelligence™ · HACP Protocol · Patent #10,290,222
      </p>
    </div>
  );
}
