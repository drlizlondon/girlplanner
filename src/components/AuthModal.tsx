import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { dataService } from "@/lib/dataService";
import { supabase } from "@/integrations/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"auth" | "forgot">("auth");
  const [resetSent, setResetSent] = useState(false);
  const { toast } = useToast();

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email needed",
        description: "Enter your email address so we can send you a reset link.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);

    if (error) {
      toast({ title: "Couldn't send reset email", description: error.message, variant: "destructive" });
      return;
    }

    setResetSent(true);
    toast({
      title: "Reset link sent",
      description: "Check your inbox (and spam folder) for the link to set a new password.",
    });
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await dataService.signIn(email, password);
      
      if (error) {
        const wrongCredentials =
          error.message.toLowerCase().includes("invalid login credentials") ||
          (error as any).code === "invalid_credentials";
        toast({
          title: "Sign in failed",
          description: wrongCredentials
            ? "Email or password is incorrect — try resetting your password."
            : error.message,
          variant: "destructive",
        });
        if (wrongCredentials) setMode("forgot");
      } else {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await dataService.signUp(email, password);
      
      if (error) {
        if (error.message.toLowerCase().includes('user already registered')) {
          toast({
            title: "Email already registered",
            description: "Try signing in instead. This email is already registered!",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === "forgot") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
          </DialogHeader>

          {resetSent ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We've emailed a link to <span className="text-foreground">{email}</span>. Open it to choose a new
                password, then you'll be signed straight in.
              </p>
              <Button variant="outline" className="w-full" onClick={() => { setResetSent(false); setMode("auth"); }}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your email and we'll send you a link to set a new password.
              </p>
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <Button className="w-full" onClick={handleForgotPassword} disabled={isLoading}>
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setMode("auth")}>
                Back to sign in
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sync Your Tasks</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <Button 
              onClick={handleSignIn} 
              disabled={isLoading} 
              className="w-full"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Forgot your password?
            </button>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
              />
            </div>
            <Button 
              onClick={handleSignUp} 
              disabled={isLoading} 
              className="w-full"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </TabsContent>
        </Tabs>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Local storage will sync with your account when signed in</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};