import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LTask, ChatGPTStore } from "@/lib/localStore";
import { buildExport } from "@/lib/chatgptBridge";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tasks: LTask[];
}

export function ExportModal({ open, onOpenChange, tasks }: Props) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const block = useMemo(() => buildExport(tasks), [tasks]);

  useEffect(() => {
    if (open && tasks.length) ChatGPTStore.saveExport(block, tasks.length);
  }, [open, tasks.length, block]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(block);
      setCopied(true);
      toast({ title: "Copied", description: `${tasks.length} task${tasks.length === 1 ? "" : "s"} ready for ChatGPT.` });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Copy failed", description: "Select and copy manually." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[calc(100vw-32px)]">
        <DialogHeader>
          <DialogTitle className="font-serif-display text-2xl">Export to ChatGPT</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-fos-muted -mt-2">
          {tasks.length} task{tasks.length === 1 ? "" : "s"} selected. Copy this block, paste it into
          ChatGPT, then paste the response back into the Processing Inbox.
        </p>
        <Textarea
          value={block}
          readOnly
          className="min-h-[320px] font-mono text-[12px] leading-relaxed"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={copy}>
            {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
            {copied ? "Copied" : "Copy block"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}