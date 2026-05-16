import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { HardDrive, Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useEffect } from "react";
import { dataService } from "@/lib/dataService";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Command Centre",
  "/agenda": "Agenda",
  "/inbox": "Processing Inbox",
  "/review": "Review",
  "/projects": "Projects",
  "/ideas": "Ideas",
  "/opportunities": "Opportunities",
  "/people-to-contact": "People",
  "/contact-history": "Contact History",
  "/archive": "Archive",
  "/search": "Search",
  "/settings": "Settings",
  "/profile": "Profile",
  "/customise": "Customise",
  "/summary": "Summary",
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const { resolved, theme, setTheme } = useTheme();

  useEffect(() => { dataService.initialize(); }, []);

  const title = ROUTE_TITLES[pathname] || "Workspace";

  const cycleTheme = () => {
    const next = theme === "day" ? "night" : theme === "night" ? "system" : "day";
    setTheme(next);
  };
  const ThemeIcon = theme === "day" ? Sun : theme === "night" ? Moon : Laptop;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-fos text-fos">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden">
          <header
            className="h-12 md:h-14 flex items-center justify-between px-3 sticky top-0 z-20 backdrop-blur-md"
            style={{
              borderBottom: "1px solid var(--border-color)",
              background: resolved === "day" ? "rgba(255,255,255,0.65)" : "rgba(8,9,18,0.55)",
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <SidebarTrigger className="text-fos-muted hover:text-fos" />
              <span className="text-xs uppercase tracking-[0.18em] text-fos-muted truncate">
                {title}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={cycleTheme}
                className="inline-flex items-center gap-1.5 px-2 h-7 rounded-md text-[11px] text-fos-muted hover:text-fos transition-colors"
                style={{ border: "1px solid var(--border-color)" }}
                title={`Theme: ${theme}`}
              >
                <ThemeIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline capitalize">{theme}</span>
              </button>
              <div
                className="inline-flex items-center gap-1.5 px-2 h-7 rounded-md text-[11px] text-fos-muted"
                style={{ border: "1px solid var(--border-color)" }}
                title="Local-only mode"
              >
                <HardDrive className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Local</span>
              </div>
            </div>
          </header>
          <main className="flex-1 min-w-0 max-w-full overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
