import { SK, readJSON, writeJSON } from "./storageKeys";
import { APP_VERSION } from "@/config/founderOS";

const KEYS = Object.values(SK);

export function exportAll(): string {
  const payload: Record<string, unknown> = {
    __founderOS: true,
    version: APP_VERSION,
    exported_at: new Date().toISOString(),
    data: {} as Record<string, unknown>,
  };
  const data = payload.data as Record<string, unknown>;
  for (const k of KEYS) data[k] = readJSON(k, null);
  localStorage.setItem(SK.lastExport, new Date().toISOString());
  return JSON.stringify(payload, null, 2);
}

export function downloadBackup() {
  const json = exportAll();
  const today = new Date().toISOString().slice(0, 10);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `founder-os-backup-${today}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export interface ImportResult { ok: boolean; restored: number; reason?: string; }

export function importAll(jsonText: string): ImportResult {
  let parsed: any;
  try { parsed = JSON.parse(jsonText); } catch {
    return { ok: false, restored: 0, reason: "Not valid JSON." };
  }
  if (!parsed || parsed.__founderOS !== true || !parsed.data) {
    return { ok: false, restored: 0, reason: "Not a Founder OS backup file." };
  }
  let count = 0;
  for (const k of KEYS) {
    if (parsed.data[k] !== undefined && parsed.data[k] !== null) {
      writeJSON(k, parsed.data[k]);
      count++;
    }
  }
  return { ok: true, restored: count };
}

export function clearAllLocal() {
  for (const k of KEYS) localStorage.removeItem(k);
}

export function lastExportDate(): string | null {
  return localStorage.getItem(SK.lastExport);
}