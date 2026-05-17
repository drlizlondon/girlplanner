import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useEffect, useState } from "react";
import { dataService } from "@/lib/dataService";
import { Cloud, HardDrive } from "lucide-react";

export default function AppLayout() {
  const { pathname } = useLocation();
  const [storage, setStorage] = useState<"local" | "supabase">("local");

  useEffect(() => {
    (async () => {
      await dataService.initialize();
      setStorage(dataService.getStorageType());
    })();
  }, [pathname]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between border-b border-border-subtle/60 px-3 bg-background/40 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground hidden sm:inline">
                {pathname === "/" ? "Command Centre" : pathname.replace("/", "").replace("-", " ") || "Workspace"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {storage === "supabase" ? (
                <>
                  <Cloud className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Synced</span>
                </>
              ) : (
                <>
                  <HardDrive className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Local</span>
                </>
              )}
            </div>
          </header>
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}