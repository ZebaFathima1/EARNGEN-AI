import { useAuth } from "@/lib/auth";
import { useAppState } from "@/lib/store";

/**
 * Returns the user info to display across the site.
 * - Signed in: real profile (falls back to email prefix if profile not loaded yet).
 * - Signed out: demo seed user from local store.
 */
export function useDisplayUser() {
  const { user, profile } = useAuth();
  const { state } = useAppState();

  if (user) {
    const name =
      (profile?.name && profile.name.trim()) ||
      user.email?.split("@")[0] ||
      "Member";
    return {
      name,
      college: profile?.college || "",
      city: profile?.city || "",
      isAuthed: true as const,
    };
  }
  return { ...state.user, isAuthed: false as const };
}
