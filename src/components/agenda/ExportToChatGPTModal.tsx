import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Task } from "@/types/task";
import { buildChatGPTExport } from "@/lib/chatgptExport";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tasks: Task[];
}

export function ExportToChatGPTModal({ open, onOpenChange, tasks }: Props) {
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => buildChatGPTExport(tasks), [tasks]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif-display text-2xl">
            Export {tasks.length} item{tasks.length === 1 ? "" : "s"} to ChatGPT
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Copy the block below, paste it into ChatGPT, then bring the response back
            via <span className="text-foreground">Import from ChatGPT</span> on the Processing Inbox.
          </p>
        </DialogHeader>

        <Textarea
          readOnly
          value={text}
          className="min-h-[340px] font-mono text-xs bg-surface border-border-subtle"
        />

        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-muted-foreground">{text.length} chars</span>
          <div className="flex gap-2">
            <a
              href="https://chat.openai.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg border border-border-subtle hover:border-border"
            >
              Open ChatGPT <ExternalLink className="h-3 w-3" />
            </a>
            <Button onClick={copy} size="sm">
              {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? "Copied" : "Copy block"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}