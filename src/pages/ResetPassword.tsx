import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Flower2 } from "lucide-react";

export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setReady(true);
    })();

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSave = async () => {
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", description: "Please type the same password twice.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      toast({ title: "Couldn't update password", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Password updated", description: "You're signed in with your new password." });
    navigate("/agenda");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background text-foreground">
      <div className="w-full max-w-sm">
        <div className="mx-auto mb-6 h-12 w-12 rounded-xl border border-primary/40 bg-primary/10 flex items-center justify-center">
          <Flower2 className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-center text-2xl font-serif-display">Set a new password</h1>

        {!ready ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Checking your reset link… If nothing happens, request a new link from the sign-in box.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Type it again"
              />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save new password"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
