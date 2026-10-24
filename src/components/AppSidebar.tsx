import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  Inbox,
  Mic,
  User,
  Flower2,
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
  { title: "Today", url: "/", icon: LayoutDashboard },
  { title: "My list", url: "/agenda", icon: ListChecks },
  { title: "Paste notes", url: "/inbox", icon: Inbox },
  { title: "Voice Setup Guide", url: "/guide", icon: Mic },
  { title: "Account", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 pt-4 pb-2">
        <NavLink to="/" className="flex items-center gap-2.5 px-2">
          <div className="h-8 w-8 rounded-lg border border-primary/40 bg-primary/10 flex items-center justify-center ">
            <Flower2 className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-foreground">GirlPlanner</span>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
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
<span className="flex-1" />
            <ThemeToggle compact />
          </div>
        ) : (
          <div className="flex justify-center"><ThemeToggle compact /></div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}