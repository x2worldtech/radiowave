import { Heart, Home, Search } from "lucide-react";
import type { Page } from "../types";

interface Props {
  page: Page;
  onNavigate: (page: Page) => void;
}

export function MobileNav({ page, onNavigate }: Props) {
  const items: { id: Page; icon: typeof Home; label: string }[] = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "favorites", icon: Heart, label: "Favorites" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden player-blur border-t border-border"
      data-ocid="mobile.panel"
    >
      <div className="flex items-center justify-around h-14">
        {items.map(({ id, icon: Icon, label }) => (
          <button
            type="button"
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center gap-0.5 min-w-[60px] py-1 transition-all duration-150 ${
              page === id ? "text-primary" : "text-muted-foreground"
            }`}
            data-ocid={`nav.${id}.link`}
            aria-label={label}
          >
            <Icon
              className={`h-5 w-5 ${page === id ? "stroke-[2.5]" : "stroke-[1.5]"}`}
            />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
