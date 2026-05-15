import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dataService } from "@/lib/dataService";
import CommandCentre from "@/components/CommandCentre";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Flower2 } from "lucide-react";

export default function CommandCentrePage() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await dataService.initialize();
      setAuthed(await dataService.isUserAuthenticated());
      setChecking(false);
    })();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-[calc(100vh-3rem)] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 h-12 w-12 rounded-xl border border-primary/40 bg-primary/10 flex items-center justify-center">
            <Flower2 className="h-5 w-5 text-primary" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">Founder OS</div>
          <h1 className="mt-2 text-3xl font-serif-display text-foreground">Command Centre</h1>
          <p className="mt-3 text-muted-foreground">A calm operational layer between thought and commitment.</p>
          <div className="mt-8 space-y-3">
            <Button className="w-full" onClick={() => setShowAuth(true)}>
              <User className="h-4 w-4 mr-2" /> Sign in to sync
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/agenda")}>
              <ArrowRight className="h-4 w-4 mr-2" /> Use locally without sign in
            </Button>
          </div>
        </div>
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); setAuthed(true); }} />
      </div>
    );
  }

  return <CommandCentre />;
}