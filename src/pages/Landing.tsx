import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flower2, Check, ListPlus, Target, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/AuthModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { dataService } from "@/lib/dataService";

const steps = [
  { icon: ListPlus, title: "Keep track of what’s next", body: "Add tasks in seconds and give yourself a clear, calm view of what’s coming up." },
  { icon: Target, title: "Focus on what matters", body: "Set quick priorities and due dates so you know what needs your attention first." },
  { icon: PartyPopper, title: "Celebrate getting things done", body: "Tick off finished tasks and see your progress, one small win at a time." },
];

const sample = [
  { title: "Book dentist appointment", priority: "High", due: "Today", done: false },
  { title: "Reply to Sophie about Saturday", priority: "Medium", due: "Tomorrow", done: false },
  { title: "Pay phone bill", priority: "Low", due: "Fri", done: true },
];

export default function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    (async () => {
      await dataService.initialize();
      if (await dataService.isUserAuthenticated()) navigate("/agenda", { replace: true });
      else setChecking(false);
    })();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const start = () => navigate("/agenda");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="max-w-5xl mx-auto flex items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg border border-primary/40 bg-primary/10 flex items-center justify-center">
            <Flower2 className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold tracking-tight">GirlPlanner</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <Button variant="outline" size="sm" onClick={() => setShowAuth(true)}>Sign in</Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5">
        <section className="text-center pt-12 sm:pt-20 pb-14 space-y-6">
          <h1 className="text-4xl sm:text-6xl font-serif-display leading-tight">
            Your to-do list, finally{" "}
            <span className="font-dancing-script text-primary font-bold text-5xl sm:text-7xl">sorted</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A simple, satisfying way to keep track of what you need to do, decide what matters, and make progress — one task at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" onClick={start}>Start my list</Button>
            <Button size="lg" variant="outline" onClick={() => setShowAuth(true)}>Sign in</Button>
          </div>
          <p className="text-sm text-muted-foreground">Free. No sign-up needed. Saved on your device.</p>
        </section>

        <section className="max-w-xl mx-auto bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-6 shadow-xl space-y-2">
          {sample.map((t) => (
            <div key={t.title} className="flex items-center gap-3 rounded-xl px-3 py-3 bg-background/60 border border-border">
              <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${t.done ? "bg-primary border-primary" : "border-primary/50"}`}>
                {t.done && <Check className="h-3 w-3 text-primary-foreground" />}
              </span>
              <span className={`flex-1 text-sm sm:text-base ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
              <span className="text-xs rounded-full px-2 py-0.5 bg-primary/10 text-primary">{t.priority}</span>
              <span className="text-xs text-muted-foreground w-16 text-right">{t.due}</span>
            </div>
          ))}
        </section>

        <section className="grid gap-5 sm:grid-cols-3 py-20">
          {steps.map((s) => (
            <div key={s.title} className="bg-card text-card-foreground border border-border rounded-2xl p-6 space-y-3">
              <s.icon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <p className="text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </section>

        <section className="text-center max-w-2xl mx-auto pb-20 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-serif-display">No elaborate systems. No complex rituals.</h2>
          <p className="text-lg text-muted-foreground">
            Just a clean list that helps you stay on top of things without becoming a job in itself.
          </p>
        </section>

        <section className="text-center pb-24 space-y-5 border-t border-border pt-16">
          <h2 className="text-3xl sm:text-4xl font-serif-display">Ready to clear your head?</h2>
          <Button size="lg" onClick={start}>Start your list</Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button type="button" className="underline text-primary" onClick={() => setShowAuth(true)}>Sign in</button>
          </p>
        </section>
      </main>

      <footer className="text-center text-sm text-muted-foreground pb-10">GirlPlanner. Your everyday to-do list.</footer>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => navigate("/agenda")} />
    </div>
  );
}
