import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Inbox,
  FolderKanban,
  Lightbulb,
  Sparkles,
  Calendar,
  Users,
  Archive as ArchiveIcon,
  Search,
  Flower2,
} from "lucide-react";
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
  { title: "Agenda", url: "/agenda", icon: CheckSquare },
  { title: "Processing Inbox", url: "/inbox", icon: Inbox },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Ideas", url: "/ideas", icon: Lightbulb },
  { title: "Opportunities", url: "/opportunities", icon: Sparkles },
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
        {!collapsed && (
          <p className="text-[10px] leading-relaxed text-muted-foreground/70">
            The Agenda is the trusted system. Everything else supports it.
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}