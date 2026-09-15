import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type RoadmapStage = "now" | "next" | "later";

export interface RoadmapItem {
  id: string;
  project_id: string;
  title: string;
  body?: string | null;
  stage: RoadmapStage;
  target_date?: string | null;
  done: boolean;
  position: number;
  created_at: string;
}

export interface ProjectRow {
  id: string;
  title: string;
  description?: string | null;
  body?: string | null;
  status: string;
  created_at: string;
}

export function useProject(id?: string) {
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data } = await (supabase as any).from("projects").select("*").eq("id", id).maybeSingle();
    setProject((data as ProjectRow) ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const update = async (patch: Record<string, any>) => {
    if (!id) return;
    const { data } = await (supabase as any).from("projects").update(patch).eq("id", id).select().single();
    if (data) setProject(data as ProjectRow);
  };

  return { project, loading, update, refetch: load };
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects((data || []) as ProjectRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (title: string) => {
    const t = title.trim();
    if (!t) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await (supabase as any)
      .from("projects")
      .insert([{ user_id: user.id, title: t }])
      .select()
      .single();
    if (data) setProjects((p) => [data as ProjectRow, ...p]);
    return data as ProjectRow | null;
  };

  const remove = async (id: string) => {
    await (supabase as any).from("projects").delete().eq("id", id);
    setProjects((p) => p.filter((r) => r.id !== id));
  };

  return { projects, loading, add, remove, refetch: load };
}

export function useRoadmap(projectId?: string) {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("project_roadmap_items")
      .select("*")
      .eq("project_id", projectId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    setItems((data || []) as RoadmapItem[]);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const add = async (title: string, stage: RoadmapStage, target_date?: string | null) => {
    const t = title.trim();
    if (!t || !projectId) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await (supabase as any)
      .from("project_roadmap_items")
      .insert([{ user_id: user.id, project_id: projectId, title: t, stage, target_date: target_date || null }])
      .select()
      .single();
    if (data) setItems((p) => [...p, data as RoadmapItem]);
    return data as RoadmapItem | null;
  };

  const update = async (id: string, patch: Record<string, any>) => {
    const { data } = await (supabase as any)
      .from("project_roadmap_items").update(patch).eq("id", id).select().single();
    if (data) setItems((p) => p.map((i) => (i.id === id ? (data as RoadmapItem) : i)));
  };

  const remove = async (id: string) => {
    await (supabase as any).from("project_roadmap_items").delete().eq("id", id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  return { items, loading, add, update, remove, refetch: load };
}

export interface Screenshot {
  id: string;
  storage_path: string;
  caption?: string | null;
  created_at: string;
  signedUrl?: string;
}

export function useProjectScreenshots(projectId?: string) {
  const [shots, setShots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setSignedIn(!!user);
    if (!user) { setShots([]); setLoading(false); return; }

    const { data } = await (supabase as any)
      .from("project_screenshots")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    const rows = (data || []) as Screenshot[];
    const withUrls = await Promise.all(
      rows.map(async (r) => {
        const { data: signed } = await supabase.storage
          .from("project-media")
          .createSignedUrl(r.storage_path, 60 * 60);
        return { ...r, signedUrl: signed?.signedUrl };
      })
    );
    setShots(withUrls);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const upload = async (files: FileList | File[]) => {
    if (!projectId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const ext = file.name.split(".").pop() || "png";
        const path = `${user.id}/${projectId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("project-media").upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
        if (error) continue;
        await (supabase as any).from("project_screenshots").insert([{
          user_id: user.id, project_id: projectId, storage_path: path, caption: file.name,
        }]);
      }
      await load();
    } finally {
      setUploading(false);
    }
  };

  const remove = async (shot: Screenshot) => {
    await supabase.storage.from("project-media").remove([shot.storage_path]);
    await (supabase as any).from("project_screenshots").delete().eq("id", shot.id);
    setShots((p) => p.filter((s) => s.id !== shot.id));
  };

  return { shots, loading, uploading, signedIn, upload, remove, refetch: load };
}
