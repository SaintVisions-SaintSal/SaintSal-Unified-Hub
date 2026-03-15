"use client";
import { useState, useCallback, useRef } from "react";
import type {
  BuilderProject,
  BuilderFile,
  BuilderChatMessage,
  BuilderState,
} from "@/lib/builder-types";

const STORAGE_KEY = "sal_builder_project_";

function loadState(): BuilderState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY + "current");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state: BuilderState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY + "current", JSON.stringify(state));
  } catch {}
}

export function useBuilderProject() {
  const [project, setProject] = useState<BuilderProject | null>(() => loadState()?.project ?? null);
  const [files, setFiles] = useState<Record<string, BuilderFile>>(() => loadState()?.files ?? {});
  const [chat, setChat] = useState<BuilderChatMessage[]>(() => loadState()?.chat ?? []);
  const [activeFile, setActiveFile] = useState<string | null>(() => loadState()?.activeFile ?? null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [buildLog, setBuildLog] = useState<string[]>([]);
  const [progressText, setProgressText] = useState("");
  const [runs, setRuns] = useState<BuilderState["runs"]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Persist state on every change
  const persist = useCallback((p: BuilderProject | null, f: Record<string, BuilderFile>, c: BuilderChatMessage[], af: string | null) => {
    saveState({ project: p, files: f, chat: c, activeFile: af, isGenerating: false, deployTargets: [], runs: [] });
  }, []);

  /** Generate a new project from prompt */
  const generateProject = useCallback(async (prompt: string, framework: BuilderProject["framework"] = "nextjs") => {
    if (isGenerating) return;
    setIsGenerating(true);
    setProgressText("");
    setBuildLog([]);

    const userMsg: BuilderChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    const assistantMsg: BuilderChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setChat((prev) => [...prev, userMsg, assistantMsg]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, framework }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === "progress") {
              accumulated += parsed.text;
              setProgressText(accumulated);
              // Update the assistant message with progress
              setChat((prev) =>
                prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: accumulated } : m))
              );
            }

            if (parsed.type === "complete") {
              // Build the file map
              const fileMap: Record<string, BuilderFile> = {};
              for (const f of parsed.files) {
                fileMap[f.path] = f;
              }

              const newProject = parsed.project as BuilderProject;
              const firstFile = parsed.files[0]?.path || null;

              // Save run for rollback
              setRuns((prev) => [
                ...prev,
                { id: crypto.randomUUID(), timestamp: Date.now(), filesSnapshot: fileMap, prompt },
              ]);

              // Update state
              setProject(newProject);
              setFiles(fileMap);
              setActiveFile(firstFile);
              setBuildLog(parsed.buildLog || []);

              // Finalize assistant message
              const explanation = parsed.explanation || `Generated ${parsed.files.length} files.`;
              const fileList = parsed.files.map((f: BuilderFile) => `• ${f.path}`).join("\n");
              const finalContent = `${explanation}\n\n**Files generated:**\n${fileList}`;

              setChat((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id
                    ? { ...m, content: finalContent, filesChanged: parsed.files.map((f: BuilderFile) => f.path) }
                    : m
                )
              );

              persist(newProject, fileMap, chat, firstFile);
            }

            if (parsed.type === "error") {
              setChat((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id ? { ...m, content: `⚠ Error: ${parsed.error}` } : m
                )
              );
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setChat((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: `⚠ Error: ${err.message}` } : m
          )
        );
      }
    } finally {
      setIsGenerating(false);
      setProgressText("");
      abortRef.current = null;
    }
  }, [isGenerating, chat, persist]);

  /** Apply an iterative edit to the current project */
  const editProject = useCallback(async (message: string, targetFiles?: string[]) => {
    if (isGenerating || !project) return;
    setIsGenerating(true);
    setProgressText("");

    const userMsg: BuilderChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      timestamp: Date.now(),
    };

    const assistantMsg: BuilderChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setChat((prev) => [...prev, userMsg, assistantMsg]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Send current files as context
      const fileArray = Object.values(files).map((f) => ({
        path: f.path,
        content: f.content,
        language: f.language,
      }));

      const res = await fetch("/api/builder/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          message,
          files: fileArray,
          targetFiles,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === "progress") {
              accumulated += parsed.text;
              setProgressText(accumulated);
              setChat((prev) =>
                prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: accumulated } : m))
              );
            }

            if (parsed.type === "complete") {
              // Snapshot current files before applying changes
              setRuns((prev) => [
                ...prev,
                { id: crypto.randomUUID(), timestamp: Date.now(), filesSnapshot: { ...files }, prompt: message },
              ]);

              // Apply changed files
              const updatedFiles = { ...files };
              for (const f of parsed.files) {
                if (f.content === "") {
                  // Delete file
                  delete updatedFiles[f.path];
                } else {
                  updatedFiles[f.path] = f;
                }
              }

              setFiles(updatedFiles);
              setBuildLog(parsed.buildLog || []);

              // Update project timestamp
              const updatedProject = { ...project, updatedAt: Date.now() };
              setProject(updatedProject);

              // Finalize assistant message
              const explanation = parsed.explanation || `Modified ${parsed.changedPaths?.length || 0} file(s).`;
              const changedList = (parsed.changedPaths || []).map((p: string) => `• ${p}`).join("\n");
              const finalContent = `${explanation}\n\n**Changed files:**\n${changedList}`;

              setChat((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id
                    ? { ...m, content: finalContent, filesChanged: parsed.changedPaths }
                    : m
                )
              );

              // If a changed file is the active one, keep it active; otherwise select first changed
              if (parsed.changedPaths?.length > 0 && !parsed.changedPaths.includes(activeFile)) {
                setActiveFile(parsed.changedPaths[0]);
              }

              persist(updatedProject, updatedFiles, chat, activeFile);
            }

            if (parsed.type === "error") {
              setChat((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id ? { ...m, content: `⚠ Error: ${parsed.error}` } : m
                )
              );
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setChat((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: `⚠ Error: ${err.message}` } : m
          )
        );
      }
    } finally {
      setIsGenerating(false);
      setProgressText("");
      abortRef.current = null;
    }
  }, [isGenerating, project, files, activeFile, chat, persist]);

  /** Update a single file (user manual edit) */
  const updateFile = useCallback((path: string, content: string) => {
    setFiles((prev) => {
      const updated = {
        ...prev,
        [path]: { ...prev[path], content, editedBy: "user" as const, updatedAt: Date.now() },
      };
      if (project) persist(project, updated, chat, activeFile);
      return updated;
    });
  }, [project, chat, activeFile, persist]);

  /** Create a new file */
  const createFile = useCallback((path: string, content: string, language: string) => {
    const newFile: BuilderFile = { path, content, language, editedBy: "user", updatedAt: Date.now() };
    setFiles((prev) => {
      const updated = { ...prev, [path]: newFile };
      if (project) persist(project, updated, chat, activeFile);
      return updated;
    });
    setActiveFile(path);
  }, [project, chat, activeFile, persist]);

  /** Delete a file */
  const deleteFile = useCallback((path: string) => {
    setFiles((prev) => {
      const updated = { ...prev };
      delete updated[path];
      if (project) persist(project, updated, chat, activeFile === path ? null : activeFile);
      return updated;
    });
    if (activeFile === path) setActiveFile(null);
  }, [project, chat, activeFile, persist]);

  /** Rollback to a previous run */
  const rollback = useCallback((runId: string) => {
    const run = runs.find((r) => r.id === runId);
    if (!run) return;
    setFiles(run.filesSnapshot);
    const firstFile = Object.keys(run.filesSnapshot)[0] || null;
    setActiveFile(firstFile);
    setBuildLog(["← Rolled back to previous version"]);
  }, [runs]);

  /** Export project as zip-compatible JSON */
  const exportProject = useCallback(() => {
    const data = {
      project,
      files: Object.values(files),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.name || "sal-app"}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [project, files]);

  /** Download project files as individual text */
  const downloadFiles = useCallback(() => {
    const fileArr = Object.values(files);
    const content = fileArr.map((f) => `// === ${f.path} ===\n${f.content}`).join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.name || "sal-app"}-files.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [project, files]);

  /** Clear project and start fresh */
  const clearProject = useCallback(() => {
    setProject(null);
    setFiles({});
    setChat([]);
    setActiveFile(null);
    setBuildLog([]);
    setRuns([]);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY + "current");
    }
  }, []);

  /** Stop current generation */
  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    // State
    project,
    files,
    chat,
    activeFile,
    isGenerating,
    buildLog,
    progressText,
    runs,
    fileList: Object.keys(files),

    // Actions
    generateProject,
    editProject,
    updateFile,
    createFile,
    deleteFile,
    setActiveFile,
    rollback,
    exportProject,
    downloadFiles,
    clearProject,
    stopGeneration,
  };
}
