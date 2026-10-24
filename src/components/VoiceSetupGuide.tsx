import { Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PROMPT_TEMPLATE = `You are my assistant.
I will give you my messy voice notes from today.
Your job:
1. Write a 2-sentence summary of my day.
2. Pull out the exact to-dos and action items.
3. Mark each action as [HIGH], [MEDIUM], or [LOW] priority.
4. Output cleanly in markdown with ## OVERVIEW and ## PRIORITY ACTIONS.`;

export function VoiceSetupGuide() {
  const { toast } = useToast();

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to your clipboard.`,
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-serif-display text-foreground">
          Add tasks by voice
        </h1>
        <p className="text-base text-muted-foreground">
          Dictate into Notes during the day. In the evening, turn the note into a to-do list and paste it into GirlPlanner.
        </p>
      </div>

      <ol className="space-y-6">
        <li className="space-y-2">
          <h2 className="text-xl font-serif-display text-foreground">1. Dictate during the day</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span>
              Open the <strong>Notes app</strong>, make a note called <strong>Daily Notes</strong>, and tap the <strong>microphone icon</strong> on your keyboard to speak. Spelling and grammar do not matter.
            </span>
          </p>
        </li>

        <li className="space-y-3">
          <h2 className="text-xl font-serif-display text-foreground">2. Turn it into a to-do list</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            In the evening, copy your note and ask any AI chat to turn it into a to-do list using this prompt.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
            onClick={() => copyText(PROMPT_TEMPLATE, "Prompt")}
          >
            <Copy className="h-3.5 w-3.5" /> Copy the prompt
          </Button>
        </li>

        <li className="space-y-2">
          <h2 className="text-xl font-serif-display text-foreground">3. Paste the result</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span>
              Paste what the AI gives you into <Link to="/inbox" className="text-primary font-semibold hover:underline">Paste notes</Link> and choose which items become tasks. You need to be signed in to do this.
            </span>
          </p>
        </li>
      </ol>
    </div>
  );
}
