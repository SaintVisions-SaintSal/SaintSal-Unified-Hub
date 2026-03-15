"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Ticker from "@/components/layout/Ticker";
import InputBar from "@/components/layout/InputBar";
import SalChat, { type SalChatHandle } from "@/components/chat/SalChat";
import BuilderIDE, { type BuilderIDEHandle } from "@/components/builder/BuilderIDE";
import SocialStudio from "@/components/social/SocialStudio";
import Dashboard from "@/components/dashboard/Dashboard";
import CEODashboard from "@/components/dashboard/CEODashboard";
import AuthModal from "@/components/ui/AuthModal";
import PricingPage from "@/components/ui/PricingPage";
import IntegrationsPage from "@/components/ui/IntegrationsPage";
import AccountPage from "@/components/ui/AccountPage";
import DomainHub from "@/components/domains/DomainHub";
import REIntelligence from "@/components/realestate/REIntelligence";
import PortfolioPage from "@/components/portfolio/PortfolioPage";
import GitHubConsole from "@/components/deploy/GitHubConsole";
import DeploymentHub from "@/components/deploy/DeploymentHub";
import CreditTopUp from "@/components/payments/CreditTopUp";
import APISettings from "@/components/deploy/APISettings";
import LegalHub from "@/components/legal/LegalHub";
import CardCollector from "@/components/cards/CardCollector";
import { supabase } from "@/lib/supabase";
import type { Attachment } from "@/hooks/useChat";

type Page = "dashboard" | "ceo" | "search" | "sports" | "news" | "tech" | "finance" | "realestate" | "medical" |
  "builder" | "social" | "domains" | "bizcenter" | "career" | "voice" | "bizplan" | "cards" |
  "integrations" | "pricing" | "account" | "portfolio" | "github" | "deploy" | "credits" | "apisettings" | "reintelligence" | "legal";

interface User { email: string; }

const BUILDER_PAGES = new Set<Page>(["builder"]);
const SOCIAL_PAGES = new Set<Page>(["social"]);
const CHAT_PAGES = new Set<Page>(["search", "sports", "news", "tech", "finance", "realestate", "medical", "domains", "bizcenter", "career", "voice", "bizplan"]);
const CARDS_PAGES = new Set<Page>(["cards"]);
const NO_INPUT_PAGES = new Set<Page>(["builder", "integrations", "pricing", "account", "ceo", "portfolio", "github", "deploy", "credits", "apisettings", "reintelligence", "social", "legal", "cards"]);

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [input, setInput] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const chatRef = useRef<SalChatHandle>(null);
  const builderRef = useRef<BuilderIDEHandle>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(
      (_event: string, session: { user?: { email?: string | null } } | null) => {
        if (session?.user?.email) {
          setUser({ email: session.user.email });
        } else {
          setUser(null);
        }
      }
    );
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: { user?: { email?: string | null } } | null } }) => {
      if (session?.user?.email) {
        setUser({ email: session.user.email });
      }
    });
    return () => { data.subscription.unsubscribe(); };
  }, []);

  const handleSend = (text: string, attachments?: Attachment[]) => {
    if (!text.trim()) return;
    setInput("");
    if (BUILDER_PAGES.has(page)) { builderRef.current?.send(text); }
    else { chatRef.current?.send(text, attachments); }
  };

  const handleExport = useCallback((format: "txt" | "pdf") => {
    chatRef.current?.exportChat(format);
  }, []);

  const toggleSearch = useCallback(() => setSearchMode((s) => !s), []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const renderMain = () => {
    if (BUILDER_PAGES.has(page)) return <BuilderIDE ref={builderRef} />;
    if (SOCIAL_PAGES.has(page)) return <SocialStudio />;
    if (CARDS_PAGES.has(page)) return <CardCollector />;
    if (page === "dashboard") return <Dashboard />;
    if (page === "ceo") return <CEODashboard />;
    if (page === "integrations") return <IntegrationsPage />;
    if (page === "pricing") return <PricingPage />;
    if (page === "account") return <AccountPage user={user} onAuth={() => setShowAuth(true)} onSignOut={handleSignOut} />;
    if (page === "reintelligence") return <REIntelligence />;
    if (page === "portfolio") return <PortfolioPage />;
    if (page === "github") return <GitHubConsole />;
    if (page === "deploy") return <DeploymentHub />;
    if (page === "credits") return <CreditTopUp />;
    if (page === "apisettings") return <APISettings />;
    if (page === "domains") return <DomainHub />;
    if (page === "legal") return <LegalHub />;
    if (CHAT_PAGES.has(page)) return <SalChat key={page} ref={chatRef} vertical={page} userEmail={user?.email} />;
    return <SalChat key={page} ref={chatRef} vertical={page} userEmail={user?.email} />;
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-[#0C0C0F]">
        <Sidebar user={user} onAuthClick={() => setShowAuth(true)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header page={page} user={user} onAuthClick={() => setShowAuth(true)} />
          <Ticker vertical={page} />
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {renderMain()}
            {!NO_INPUT_PAGES.has(page) && (
              <InputBar
                value={input}
                onChange={setInput}
                onSend={handleSend}
                page={page}
                disabled={false}
                onExport={handleExport}
                onSearch={toggleSearch}
                hasMessages={chatRef.current !== null}
                searchMode={searchMode}
              />
            )}
          </div>
        </div>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={(u) => { setUser(u); setShowAuth(false); }} />}
    </>
  );
}
