import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

function initialsFor(name: string, email: string) {
  const source = name.trim() || email.trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Account entry point for the whole app: lives in the shared header
// (AppLayout), so it's reachable from every page on desktop and mobile.
export function AccountMenu() {
  const { isAuthenticated, name, photoUrl, email, loading, refresh } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Re-read the profile whenever the route changes, so a name/photo saved
  // on the Profile page shows up here without a full reload.
  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  if (loading) return null;

  const displayName = name || (isAuthenticated ? email : "Friend");

  const handleSignOut = async () => {
    if (isAuthenticated) {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } else {
      toast({
        title: "Going home",
        description: "Returning to homepage.",
      });
    }
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60 transition-colors"
          aria-label="Account menu"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={photoUrl} alt={displayName} />
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {initialsFor(name, email)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline max-w-[10rem] truncate">{displayName}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium leading-none truncate">{displayName}</p>
            {email && (
              <p className="text-xs leading-none text-muted-foreground truncate">{email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AccountMenu;
