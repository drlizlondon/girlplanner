import { Task } from "@/types/task";
import { format } from "date-fns";

export function buildChatGPTExport(tasks: Task[]): string {
  const date = format(new Date(), "yyyy-MM-dd");
  const header = [
    "# Founder OS — Task Processing Request",
    `Date: ${date}`,
    "Context: Current Agenda export",
    `Selected items: ${tasks.length}`,
    "",
  ].join("\n");

  const items = tasks
    .map((t, i) => {
      const lines = [
        `## Task ${i + 1}`,
        `- id: ${t.id}`,
        `- title: ${t.title}`,
        `- project: ${(t as any).project_id ? `id:${(t as any).project_id}` : "-"}`,
        `- status: ${(t as any).status || "active"}`,
        `- priority: ${t.priority}`,
      ];
      if (t.dueDate) lines.push(`- due: ${format(t.dueDate, "yyyy-MM-dd")}`);
      const notes = (t.additional_info || t.thoughts || "").trim();
      if (notes) lines.push(`- notes: ${notes.replace(/\n+/g, " ")}`);
      lines.push(`- help requested: recommendation, next steps, draft wording`);
      return lines.join("\n");
    })
    .join("\n\n");

  const footer = `
---
Instructions:
Treat each task as a separate item. For each one, provide a clear recommendation, next steps, any useful draft wording or structured output, and then create a dashboard-ready return block that can be pasted back into the dashboard.

Return format (strict, one per task):
=== TASK <id> ===
type: next_action | decision | draft | research | admin | follow_up | project_note
title: <short actionable title>
recommendation: <one or two lines>
next_steps:
- step one
- step two
draft: |
  optional draft wording, multi-line allowed
=== END ===

Use the exact task id from above. Do not invent ids.`;

  return [header, items, footer].join("\n");
}