export const APP_VERSION = "0.2.0";

export const founderOSConfig = {
  systemName: "Founder OS",
  storageMode: "local" as const,
  sections: [
    "Agenda",
    "People",
    "Projects",
    "Ideas",
    "Opportunities",
    "Processing Inbox",
  ],
  accentColour: "#B56CFF",
  tone: "calm, strategic, founder-focused",
  prompts: {
    dailyProcessing:
      "You are a calm operational thinking partner. Review the attached tasks one by one. For each, return a clear recommendation, draft text where useful, and a dashboard-ready card following the FOUNDER_OS_CHATGPT_RETURN format.",
  },
};

export type FounderOSConfig = typeof founderOSConfig;