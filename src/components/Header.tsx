
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface HeaderProps {
  onSignOut?: () => void;
  showSignOut?: boolean;
}

// Sidebar now provides navigation. This component is kept as a thin
// sign-out affordance so existing pages don't need refactors.
export const Header = ({ onSignOut, showSignOut = true }: HeaderProps) => {
  if (!onSignOut || !showSignOut) return null;
  return (
    <div className="flex justify-end mb-4">
      <Button onClick={onSignOut} variant="outline" size="sm" className="text-muted-foreground">
        <LogOut className="w-3.5 h-3.5 mr-2" />
        Sign out
      </Button>
    </div>
  );
};

// Legacy export kept for any older imports
export default Header;

/* eslint-disable @typescript-eslint/no-unused-vars */
const _legacy = () => {
  return (
    <header className="hidden">
      <div className="flex items-center">
        <a href="/" className="flex items-center">
          <div className="h-8 w-8 mr-2 rounded-full border-2 border-purple-400 flex items-center justify-center">
            <div className="text-purple-500 text-sm">🌸</div>
          </div>
        </a>
      </div>
    </header>
  );
};
