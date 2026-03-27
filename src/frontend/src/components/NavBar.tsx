import { Button } from "@/components/ui/button";
import { Heart, Home, LogIn, LogOut, Radio, Search, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { Page } from "../types";

interface Props {
  page: Page;
  onNavigate: (page: Page) => void;
}

export function NavBar({ page, onNavigate }: Props) {
  const { login, clear, isLoggingIn, identity } = useInternetIdentity();

  const navItems: { id: Page; icon: typeof Home; label: string }[] = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "favorites", icon: Heart, label: "Favorites" },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-xl border-b border-border/50 flex-shrink-0">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center gap-6">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 flex-shrink-0"
          data-ocid="nav.home.link"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Radio className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
            Radio<span className="text-primary">Wave</span>
          </span>
        </button>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              type="button"
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                page === id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              data-ocid={`nav.${id}.link`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Auth */}
        <div className="ml-auto flex items-center gap-2">
          {identity ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                <User className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground font-mono">
                  {identity.getPrincipal().toString().slice(0, 8)}…
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-muted-foreground hover:text-foreground"
                data-ocid="nav.logout.button"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Sign out</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="bg-primary text-primary-foreground hover:bg-primary/90 teal-glow"
              data-ocid="nav.login.button"
            >
              {isLoggingIn ? (
                <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <LogIn className="h-4 w-4 mr-2" />
              )}
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
