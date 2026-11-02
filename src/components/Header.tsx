
interface HeaderProps {
  onSignOut?: () => void;
  showSignOut?: boolean;
}

// Sign out now lives in the account menu (AccountMenu), so this renders
// nothing. Kept so existing pages don't need refactors.
export const Header = (_props: HeaderProps) => null;

// Legacy export kept for any older imports
export default Header;

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
