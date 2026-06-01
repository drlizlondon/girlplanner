import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  Inbox,
  FolderKanban,
  Lightbulb,
  Sparkles,
  Calendar,
  Users,
  Archive as ArchiveIcon,
  Search,
  Flower2,
  FileText,
  Hourglass,
  Star,
  HelpCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Command Centre", url: "/", icon: LayoutDashboard },
  { title: "Current Agenda", url: "/agenda", icon: ListChecks },
  { title: "Focus Now", url: "/focus", icon: Star },
  { title: "Processing Inbox", url: "/inbox", icon: Inbox },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Notes", url: "/notes", icon: FileText },
  { title: "Waiting On", url: "/waiting-on", icon: Hourglass },
  { title: "Ideas", url: "/ideas", icon: Lightbulb },
  { title: "Opportunities", url: "/opportunities", icon: Sparkles },
  { title: "Open Questions", url: "/questions", icon: HelpCircle },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "People", url: "/people-to-contact", icon: Users },
  { title: "Archive", url: "/archive", icon: ArchiveIcon },
  { title: "Search", url: "/search", icon: Search },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 pt-4 pb-2">
        <NavLink to="/" className="flex items-center gap-2.5 px-2">
          <div className="h-8 w-8 rounded-lg border border-primary/40 bg-primary/10 flex items-center justify-center shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)]">
            <Flower2 className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-foreground">Founder OS</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Command Centre</span>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em]">Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        className={`group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/60"
                        }`}
                      >
                        <item.icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] leading-relaxed text-muted-foreground/70 flex-1">
              The Agenda is the trusted system.
            </p>
            <ThemeToggle compact />
          </div>
        ) : (
          <div className="flex justify-center"><ThemeToggle compact /></div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}