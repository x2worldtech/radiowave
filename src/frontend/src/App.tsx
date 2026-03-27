import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { ExpandedPlayer } from "./components/ExpandedPlayer";
import { MobileNav } from "./components/MobileNav";
import { NavBar } from "./components/NavBar";
import { PlayerBar } from "./components/PlayerBar";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { FavoritesPage } from "./pages/FavoritesPage";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import type { Page } from "./types";

function AppContent() {
  const [page, setPage] = useState<Page>("home");

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
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <NavBar page={page} onNavigate={setPage} />

      <main className="flex-1 overflow-y-auto">{renderPage()}</main>

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
