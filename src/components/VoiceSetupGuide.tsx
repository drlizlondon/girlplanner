import React from "react";
import { Mic, Key, Zap, CheckCircle2, Copy, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function VoiceSetupGuide() {
  const { toast } = useToast();

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to your clipboard.`,
    });
  };

  const PROMPT_TEMPLATE = `You are my executive processing assistant.
I will give you my messy voice notes from today.
Your job:
1. Write a 2-sentence summary of my day.
2. Pull out the exact to-dos and action items.
3. Mark each action as [HIGH], [MEDIUM], or [LOW] priority.
4. Output cleanly in markdown with ## OVERVIEW and ## PRIORITY ACTIONS.`;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          <Sparkles className="h-4 w-4" /> The 5-Minute Magic Setup
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Talk to Your Phone, Wake Up to Your Plan 🪄
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Here is how to set up your phone so you can just speak your thoughts during the day, and let free AI turn them into neat tasks every evening.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1 */}
        <div className="glow-card p-6 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-1.5">
                <Mic className="h-4 w-4 text-purple-500" /> Talk to Your Notes App
              </h3>
              <p className="text-xs text-muted-foreground">Throughout your busy day</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Open the <strong>Notes app</strong> on your iPhone. Whenever you get an idea, remember a chore, or feel overwhelmed:
          </p>
          <ul className="text-sm space-y-2 text-foreground/90 bg-muted/40 p-3.5 rounded-xl border border-border-subtle">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              Create a note called <strong>"Daily Notes"</strong>.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              Tap the little <strong>Microphone icon</strong> on your keyboard and just ramble!
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              Don't worry about spelling, grammar, or rambling. The AI will tidy it all up.
            </li>
          </ul>
        </div>

        {/* Step 2 */}
        <div className="glow-card p-6 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-1.5">
                <Key className="h-4 w-4 text-blue-500" /> Get Your Free AI Key
              </h3>
              <p className="text-xs text-muted-foreground">100% free from Google</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Google gives everyone a completely free AI key (Gemini) that never charges your card:
          </p>
          <div className="space-y-2 bg-muted/40 p-3.5 rounded-xl border border-border-subtle text-sm">
            <p className="text-foreground/90">
              1. Tap below to visit <strong>Google AI Studio</strong>:
            </p>
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              Open Google AI Studio <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <p className="text-foreground/90 mt-1">
              2. Click <strong>"Get API Key"</strong> and copy your key. That's your magic password!
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="glow-card p-6 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" /> Set Up Evening Magic
              </h3>
              <p className="text-xs text-muted-foreground">Automated in Apple Shortcuts</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Open the <strong>Shortcuts app</strong> on your iPhone or Mac:
          </p>
          <div className="space-y-2.5 bg-muted/40 p-3.5 rounded-xl border border-border-subtle text-sm text-foreground/90">
            <p>1. Tap <strong>Automation</strong> at the bottom → <strong>Time of Day</strong> (set it to 8:30 PM).</p>
            <p>2. Set action to: <em>Get text from "Daily Notes"</em>.</p>
            <p>3. Add action: <em>Get contents of URL</em> (Post to Gemini API with your key).</p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs flex items-center justify-center gap-1.5"
                onClick={() => copyText(PROMPT_TEMPLATE, "AI Prompt")}
              >
                <Copy className="h-3.5 w-3.5" /> Copy the AI Instruction Prompt
              </Button>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="glow-card p-6 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Wake Up to Your Plan
              </h3>
              <p className="text-xs text-muted-foreground">Review & Accept in 1-Click</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You never have to organize to-do lists by hand again!
          </p>
          <div className="space-y-2 bg-muted/40 p-3.5 rounded-xl border border-border-subtle text-sm text-foreground/90">
            <p>• In the evening or next morning, open GirlPlanner.</p>
            <p>• Go to <strong>Processing Inbox</strong>.</p>
            <p>• Your day's notes are neatly arranged into clear tasks.</p>
            <p>• Just tap <strong>Accept</strong> on what you want to tackle today, and it drops right onto your <strong>Agenda</strong>!</p>
          </div>
        </div>
      </div>

      {/* Manual Fallback Box */}
      <div className="glow-card p-5 sm:p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-2">
        <h4 className="font-semibold text-base text-foreground flex items-center gap-2">
          💡 Want to do it manually right now?
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You don't even have to wait for the automation. Any time you have a messy text or transcript, just head over to{" "}
          <a href="/inbox" className="text-primary font-semibold hover:underline">
            Processing Inbox
          </a>
          , paste it in, and click <strong>Create Briefing</strong>. It sorts your tasks instantly!
        </p>
      </div>
    </div>
  );
}
