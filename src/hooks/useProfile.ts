import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { dataService } from "@/lib/dataService";

export interface ProfileState {
  isAuthenticated: boolean;
  name: string;
  photoUrl: string;
  email: string;
}

const EMPTY_STATE: ProfileState = {
  isAuthenticated: false,
  name: "",
  photoUrl: "",
  email: "",
};

// Shared profile loader so any component (nav menu, Profile page, etc.)
// reads the same source of truth: the `profiles` table for signed-in
// users, or localStorage for local-only users.
export function useProfile() {
  const [profile, setProfile] = useState<ProfileState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const authenticated = await dataService.isUserAuthenticated();

    if (authenticated) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        setProfile({
          isAuthenticated: true,
          name: profileRow?.user_name || "",
          photoUrl: profileRow?.photo_url || "",
          email: user.email || "",
        });
        setLoading(false);
        return;
      }
    }

    const localProfile = localStorage.getItem("localProfile");
    if (localProfile) {
      try {
        const parsed = JSON.parse(localProfile);
        setProfile({
          isAuthenticated: false,
          name: parsed.name || "",
          photoUrl: parsed.photoUrl || "",
          email: "",
        });
        setLoading(false);
        return;
      } catch {
        // fall through to empty state
      }
    }

    setProfile(EMPTY_STATE);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...profile, loading, refresh };
}
