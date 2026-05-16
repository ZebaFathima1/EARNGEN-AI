import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Shell, Card } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { User, Mail, GraduationCap, MapPin, CheckCircle, AlertCircle, Camera, Loader2 } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — EARNGEN-AI" },
      { name: "description", content: "View and update your EARNGEN-AI profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, avatarUrl, updateProfile, uploadAvatar, loading } = useAuth();
  const [form, setForm] = useState({ full_name: "", college: "", city: "" });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarErr, setAvatarErr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-populate form whenever profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        college: profile.college ?? "",
        city: profile.city ?? "",
      });
    }
  }, [profile]);

  const initial = (profile?.full_name || user?.email || "?").charAt(0).toUpperCase();

    async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim()) return;
    setBusy(true);
    setStatus("idle");
    setErrMsg(null);
    const { error } = await updateProfile({
      full_name: form.full_name.trim(),
      college: form.college.trim(),
      city: form.city.trim(),
    });
    setBusy(false);
    if (error) {
      setStatus("error");
      setErrMsg(error);
    } else {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarErr(null);
    setAvatarBusy(true);
    const { error } = await uploadAvatar(file);
    setAvatarBusy(false);
    if (error) setAvatarErr(error);
    // Reset input so same file can be re-selected if needed
    e.target.value = "";
  }

  return (
    <Shell>
      <RequireAuth>
        <header className="mb-8 fade-up">
          <p className="text-sm text-muted-foreground">Account</p>
          <h1 className="text-3xl font-semibold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-1">
            Your information is loaded automatically when you sign in.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar / identity card */}
          <Card className="p-6 flex flex-col items-center text-center gap-4 lg:col-span-1 h-fit">
            {/* Clickable avatar */}
            <div className="relative group">
              <div
                className="size-24 rounded-full overflow-hidden bg-gradient-to-br from-brand to-brand-light grid place-items-center text-4xl font-bold text-white select-none cursor-pointer ring-2 ring-border"
                onClick={() => !avatarBusy && fileInputRef.current?.click()}
                role="button"
                aria-label="Change profile picture"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              >
                {avatarBusy ? (
                  <Loader2 className="size-8 text-white animate-spin" />
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile picture"
                    className="size-full object-cover"
                  />
                ) : (
                  !loading && initial
                )}
              </div>

              {/* Hover overlay */}
              {!avatarBusy && (
                <div
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="size-5 text-white" />
                  <span className="text-[10px] text-white font-medium leading-tight">
                    Change
                  </span>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />

            {avatarErr && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="size-3 shrink-0" />
                {avatarErr}
              </p>
            )}

            <p className="text-xs text-muted-foreground -mt-2">
              JPG, PNG, WebP or GIF · max 5 MB
            </p>

            <div>
              <p className="text-lg font-semibold">{profile?.full_name || "—"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            {profile?.college && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <GraduationCap className="size-3.5 shrink-0" />
                <span>{profile.college}</span>
              </div>
            )}
            {profile?.city && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span>{profile.city}</span>
              </div>
            )}
          </Card>

          {/* Edit form */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="font-semibold mb-1">Edit details</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Changes are saved to your account and reflected everywhere.
            </p>

            {/* Email read-only */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-lg ring-1 ring-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span>{user?.email}</span>
                <span className="ml-auto text-xs bg-brand/10 text-brand px-2 py-0.5 rounded font-medium">
                  verified
                </span>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <ProfileField
                icon={<User className="size-4 text-muted-foreground" />}
                label="Full name"
                value={form.full_name}
                placeholder="Priya Sharma"
                required
                onChange={(v) => setForm((f) => ({ ...f, full_name: v }))}
              />
              <ProfileField
                icon={<GraduationCap className="size-4 text-muted-foreground" />}
                label="College / University"
                value={form.college}
                placeholder="IIIT Hyderabad"
                onChange={(v) => setForm((f) => ({ ...f, college: v }))}
              />
              <ProfileField
                icon={<MapPin className="size-4 text-muted-foreground" />}
                label="City"
                value={form.city}
                placeholder="Hyderabad"
                onChange={(v) => setForm((f) => ({ ...f, city: v }))}
              />

              {status === "success" && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                  <CheckCircle className="size-4" />
                  Profile updated successfully!
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="size-4" />
                  {errMsg || "Something went wrong. Please try again."}
                </div>
              )}

              <button
                type="submit"
                disabled={busy || !form.full_name.trim()}
                className="mt-2 rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
            </form>
          </Card>
        </div>
      </RequireAuth>
    </Shell>
  );
}

function ProfileField({
  label,
  value,
  placeholder,
  onChange,
  icon,
  required,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      <div className="mt-1.5 flex items-center gap-2 rounded-lg ring-1 ring-border bg-background focus-within:ring-2 focus-within:ring-brand px-3 py-0.5 transition-shadow">
        {icon}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="flex-1 py-2 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground/60"
        />
      </div>
    </label>
  );
}
