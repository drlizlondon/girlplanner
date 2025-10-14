
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

interface HeaderProps {
  onSignOut?: () => void;
  showSignOut?: boolean;
}

export const Header = ({ onSignOut, showSignOut = true }: HeaderProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <div className="h-8 w-8 mr-2 rounded-full border-2 border-purple-400 flex items-center justify-center">
            <div className="text-purple-500 text-sm">🌸</div>
          </div>
          <h1 className="text-2xl font-dancing-script text-purple-700 font-bold">Productivity App</h1>
        </Link>
      </div>

      <NavigationMenu className="max-w-full overflow-auto">
        <NavigationMenuList className="gap-2 flex-wrap justify-center">
          <NavigationMenuItem>
            <Link to="/agenda">
              <Button
                variant={isActive("/agenda") ? "default" : "ghost"}
                className="font-normal"
              >
                Agenda
              </Button>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/summary">
              <Button
                variant={isActive("/summary") ? "default" : "ghost"}
                className="font-normal"
              >
                Completed Tasks
              </Button>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/ideas">
              <Button
                variant={isActive("/ideas") ? "default" : "ghost"}
                className="font-normal"
              >
                Good Ideas
              </Button>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/people-to-contact">
              <Button
                variant={isActive("/people-to-contact") ? "default" : "ghost"}
                className="font-normal"
              >
                People to Contact
              </Button>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/opportunities">
              <Button
                variant={isActive("/opportunities") ? "default" : "ghost"}
                className="font-normal"
              >
                Opportunities
              </Button>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/profile">
              <Button
                variant={isActive("/profile") ? "default" : "ghost"}
                className="font-normal"
              >
                Profile
              </Button>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {onSignOut && showSignOut && (
        <Button
          onClick={onSignOut}
          variant="outline"
          className="ml-2 flex-shrink-0"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      )}
    </header>
  );
};
