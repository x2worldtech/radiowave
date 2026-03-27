import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { ExpandedPlayer } from "./components/ExpandedPlayer";
import { MobileNav } from "./components/MobileNav";
import { NavBar } from "./components/NavBar";
import { PlayerBar } from "./components/PlayerBar";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { PlayerProvider, usePlayer } from "./contexts/PlayerContext";
import { FavoritesPage } from "./pages/FavoritesPage";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import type { Page } from "./types";

function AppContent() {
  const [page, setPage] = useState<Page>("home");
  const { currentStation } = usePlayer();

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage onNavigate={setPage} />;
      case "search":
        return <SearchPage />;
      case "favorites":
        return <FavoritesPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar page={page} onNavigate={setPage} />

      <main
        className={`${
          currentStation ? "pb-[calc(56px+72px)] md:pb-[80px]" : "pb-14 md:pb-0"
        }`}
      >
        {renderPage()}
      </main>

      <PlayerBar />
      <ExpandedPlayer />
      <MobileNav page={page} onNavigate={setPage} />

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <FavoritesProvider>
        <AppContent />
      </FavoritesProvider>
    </PlayerProvider>
  );
}
