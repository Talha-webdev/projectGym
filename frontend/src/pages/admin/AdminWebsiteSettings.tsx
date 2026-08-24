import { useState, useEffect, useRef } from "react";
import { Save, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";

function ImageUploadField({
  label,
  settingKey,
  currentUrl,
  onUploaded,
}: {
  label: string;
  settingKey: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", settingKey);
    try {
      const { data } = await api.post("/admin/website-settings/upload", formData);
      const updated = data.settings || {};
      const url = updated[settingKey] || "";
      setPreview(url);
      onUploaded(url);
      setMsg({ type: "success", text: "Uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-website-settings"] });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Upload failed. Please try again." });
      setTimeout(() => setMsg(null), 5000);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const displayUrl = preview || currentUrl;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">{label}</label>
      <div className="flex items-start gap-4">
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-gym-border bg-gym-elevated">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={label}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-8 w-8 text-gym-text-muted" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <label className="cursor-pointer">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <span
              className="inline-flex items-center gap-2 rounded-lg border border-gym-border bg-gym-surface px-4 py-2 text-sm font-medium text-gym-text-secondary transition-colors hover:border-gym-gold/30 hover:text-gym-gold"
              role="button"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {displayUrl ? "Replace Image" : "Upload Image"}
                </>
              )}
            </span>
          </label>
          {displayUrl && (
            <p className="max-w-[200px] truncate text-xs text-gym-text-muted" title={displayUrl}>
              {displayUrl}
            </p>
          )}
        </div>
      </div>
      {msg && (
        <p className={`mt-2 text-xs ${msg.type === "success" ? "text-gym-success" : "text-gym-error"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

export default function AdminWebsiteSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-website-settings"],
    queryFn: async () => {
      const { data } = await api.get("/admin/website-settings");
      return (data.settings || {}) as Record<string, string>;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      await api.patch("/admin/website-settings", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-website-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    await updateMutation.mutateAsync(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Website Settings</h1>
          <p className="mt-1 text-sm text-gym-text-secondary">Manage your public website content and images.</p>
        </div>
        <Button size="sm" onClick={handleSave} isLoading={updateMutation.isPending}>
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* General Information */}
        <Card className="p-6" hover={false}>
          <h2 className="mb-4 font-heading text-base font-bold text-gym-text-primary">General Information</h2>
          <div className="space-y-4">
            <Input
              label="Coach Name"
              value={form.coach_name || ""}
              onChange={(e) => handleChange("coach_name", e.target.value)}
              placeholder="e.g. John Doe"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gym-text-secondary">Coach Bio</label>
              <textarea
                value={form.coach_bio || ""}
                onChange={(e) => handleChange("coach_bio", e.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary placeholder-gym-text-muted transition-all duration-200 focus:border-gym-gold focus:outline-none focus:ring-1 focus:ring-gym-gold"
                placeholder="Tell visitors about the coach..."
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6" hover={false}>
          <h2 className="mb-4 font-heading text-base font-bold text-gym-text-primary">Contact Information</h2>
          <div className="space-y-4">
            <Input
              label="WhatsApp Number"
              value={form.coach_whatsapp || ""}
              onChange={(e) => handleChange("coach_whatsapp", e.target.value)}
              placeholder="e.g. +1 (555) 123-4567"
            />
            <Input
              label="Phone Number"
              value={form.coach_phone || ""}
              onChange={(e) => handleChange("coach_phone", e.target.value)}
              placeholder="e.g. +1 (555) 123-4567"
            />
            <Input
              label="Email"
              type="email"
              value={form.coach_email || ""}
              onChange={(e) => handleChange("coach_email", e.target.value)}
              placeholder="e.g. coach@example.com"
            />
          </div>
        </Card>

        {/* Social Media */}
        <Card className="p-6" hover={false}>
          <h2 className="mb-4 font-heading text-base font-bold text-gym-text-primary">Social Media</h2>
          <div className="space-y-4">
            <Input
              label="Instagram URL"
              value={form.social_instagram || ""}
              onChange={(e) => handleChange("social_instagram", e.target.value)}
              placeholder="https://instagram.com/..."
            />
            <Input
              label="Facebook URL"
              value={form.social_facebook || ""}
              onChange={(e) => handleChange("social_facebook", e.target.value)}
              placeholder="https://facebook.com/..."
            />
            <Input
              label="TikTok URL"
              value={form.social_tiktok || ""}
              onChange={(e) => handleChange("social_tiktok", e.target.value)}
              placeholder="https://tiktok.com/..."
            />
          </div>
        </Card>

        {/* Home Page Images */}
        <Card className="p-6" hover={false}>
          <h2 className="mb-4 font-heading text-base font-bold text-gym-text-primary">Home Page Images</h2>
          <div className="space-y-6">
            <ImageUploadField
              label="Hero Background Image"
              settingKey="hero_image_url"
              currentUrl={form.hero_image_url || ""}
              onUploaded={(url) => handleChange("hero_image_url", url)}
            />
            <ImageUploadField
              label="Meet Your Coach Image"
              settingKey="coach_image_url"
              currentUrl={form.coach_image_url || ""}
              onUploaded={(url) => handleChange("coach_image_url", url)}
            />
            <ImageUploadField
              label="Before Image (Home)"
              settingKey="before_image_url"
              currentUrl={form.before_image_url || ""}
              onUploaded={(url) => handleChange("before_image_url", url)}
            />
            <ImageUploadField
              label="After Image (Home)"
              settingKey="after_image_url"
              currentUrl={form.after_image_url || ""}
              onUploaded={(url) => handleChange("after_image_url", url)}
            />
          </div>
        </Card>

        {/* About / Journey Images */}
        <Card className="p-6" hover={false}>
          <h2 className="mb-4 font-heading text-base font-bold text-gym-text-primary">About / Journey Images</h2>
          <div className="space-y-6">
            <ImageUploadField
              label="Story Image"
              settingKey="about_story_image_url"
              currentUrl={form.about_story_image_url || ""}
              onUploaded={(url) => handleChange("about_story_image_url", url)}
            />
            <ImageUploadField
              label="Before Image (About)"
              settingKey="about_before_image_url"
              currentUrl={form.about_before_image_url || ""}
              onUploaded={(url) => handleChange("about_before_image_url", url)}
            />
            <ImageUploadField
              label="After Image (About)"
              settingKey="about_after_image_url"
              currentUrl={form.about_after_image_url || ""}
              onUploaded={(url) => handleChange("about_after_image_url", url)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
