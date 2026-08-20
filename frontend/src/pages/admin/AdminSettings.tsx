import { useState, useEffect } from "react";
import { Settings, Save } from "lucide-react";
import { useAdminSettings, useUpdateSettings } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminSettings() {
  const { data: settings, isLoading, error } = useAdminSettings();
  const updateSettings = useUpdateSettings();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Site Settings</h1>
          <p className="mt-1 text-sm text-gym-text-secondary">Manage global site configuration.</p>
        </div>
        <Card className="border-gym-error/30 bg-gym-error/5 p-4">
          <p className="text-sm text-gym-error">Failed to load settings. Please try again.</p>
        </Card>
      </div>
    );
  }

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
          <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Site Settings</h1>
          <p className="mt-1 text-sm text-gym-text-secondary">Manage global site configuration.</p>
        </div>
        <Button size="sm" onClick={handleSave} isLoading={updateSettings.isPending}>
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <Card className="p-6" hover={false}>
        {Object.keys(form).length === 0 ? (
          <div className="py-8 text-center">
            <Settings className="mx-auto h-10 w-10 text-gym-text-muted" />
            <p className="mt-3 text-sm text-gym-text-secondary">No settings configured yet.</p>
            <p className="text-xs text-gym-text-muted">
              Settings will appear here once they are created.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(form).map(([key, value]) => (
              <div key={key}>
                <label htmlFor={`setting-${key}`} className="mb-1.5 block text-sm font-medium text-gym-text-primary capitalize">
                  {key.replace(/_/g, " ")}
                </label>
                <input
                  id={`setting-${key}`}
                  type="text"
                  value={value}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full rounded-lg border border-gym-border bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none transition-all focus:border-gym-gold focus:ring-1 focus:ring-gym-gold"
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
