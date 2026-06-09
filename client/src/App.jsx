import React, { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Loader from "./components/Loader";
import Results from "./components/Results";
import LandingPage from "./components/LandingPage";
import HistoryPanel from "./components/HistoryPanel";
import CompareView from "./components/CompareView";
import DashboardView from "./components/DashboardView";
import CollectionsView from "./components/CollectionsView";
import StudyGroupsView from "./components/StudyGroupsView";
import { useAnalysis } from "./hooks/useAnalysis";

export default function App() {
  const { status, loadingStep, loadingProgress, videoData, error, analyze, reset } = useAnalysis();
  const [toast, setToast] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [activeView, setActiveView] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  function closeAll() { setActiveView(null); }

  function handleGetStarted() { setShowLanding(false); closeAll(); }

  function handleReset() { reset(); setShowLanding(true); closeAll(); }

  function handleHistorySelect(url, language) {
    closeAll(); setShowLanding(false); analyze(url, language);
  }

  if (showLanding) return <LandingPage onGetStarted={handleGetStarted} />;

  return (
    <div className="min-h-screen bg-bg-1 text-white font-sans">
      <Header
        onLogoClick={handleReset}
        onHistoryClick={() => setActiveView(activeView === "history" ? null : "history")}
        onCompareClick={() => setActiveView(activeView === "compare" ? null : "compare")}
        onDashboardClick={() => setActiveView(activeView === "dashboard" ? null : "dashboard")}
        onCollectionsClick={() => setActiveView(activeView === "collections" ? null : "collections")}
        onGroupsClick={() => setActiveView(activeView === "groups" ? null : "groups")}
        showHistory={activeView === "history"}
        showCompare={activeView === "compare"}
        showDashboard={activeView === "dashboard"}
        showCollections={activeView === "collections"}
        showGroups={activeView === "groups"}
      />
      <main className="max-w-4xl mx-auto px-4 pb-24">
        {activeView === "dashboard" ? (
          <DashboardView onBack={closeAll} onReanalyze={(t) => { closeAll(); analyze(t.url, t.language); }} />
        ) : activeView === "compare" ? (
          <CompareView onBack={closeAll} />
        ) : activeView === "history" ? (
          <div className="pt-8 animate-fade-in">
            <HistoryPanel onSelect={handleHistorySelect} />
          </div>
        ) : activeView === "collections" ? (
          <CollectionsView onBack={closeAll} onReanalyze={(t) => { closeAll(); }} />
        ) : activeView === "groups" ? (
          <StudyGroupsView onBack={closeAll} />
        ) : status === "idle" || status === "error" ? (
          <Hero onAnalyze={analyze} error={error} />
        ) : status === "loading" ? (
          <Loader step={loadingStep} progress={loadingProgress} />
        ) : (
          <Results videoData={videoData} onReset={handleReset} showToast={showToast} />
        )}
      </main>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-sm animate-fade-in"
          style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="w-2 h-2 rounded-full bg-green-400" />
          {toast}
        </div>
      )}
    </div>
  );
}