import { useState } from "react";
import { Plus, Play, Edit3, Trash2, Search } from "lucide-react";
import { useVideos, useCategories } from "@/hooks/useVideos";
import { useCreateVideo, useUpdateVideo, useDeleteVideo } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { formatRelativeTime, formatDuration, pluralize } from "@/utils/formatters";
import type { Video } from "@/types/video";

interface VideoForm {
  title: string;
  description: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  thumbnail_url: string;
  duration: string;
  is_premium: boolean;
  category_ids: string[];
}

const emptyForm: VideoForm = {
  title: "",
  description: "",
  cloudinary_public_id: "",
  cloudinary_url: "",
  thumbnail_url: "",
  duration: "",
  is_premium: false,
  category_ids: [],
};

export default function AdminVideos() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [form, setForm] = useState<VideoForm>(emptyForm);
  const [formError, setFormError] = useState("");

  const params: Record<string, string | number> = { page, per_page: 10 };
  if (search) params.search = search;
  const { data, isLoading, error } = useVideos(params);
  const { data: categories } = useCategories();
  const createMutation = useCreateVideo();
  const updateMutation = useUpdateVideo();
  const deleteMutation = useDeleteVideo();

  const openCreate = () => {
    setEditingVideo(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (video: Video) => {
    setEditingVideo(video);
    setForm({
      title: video.title,
      description: video.description || "",
      cloudinary_public_id: "",
      cloudinary_url: video.cloudinary_url,
      thumbnail_url: video.thumbnail_url || "",
      duration: video.duration?.toString() || "",
      is_premium: video.is_premium,
      category_ids: [],
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleDelete = async (video: Video) => {
    if (!window.confirm(`Delete "${video.title}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(video.slug);
    } catch {
      setFormError("Failed to delete video.");
    }
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!form.title.trim()) { setFormError("Title is required"); return; }
    if (!form.cloudinary_url.trim() && !editingVideo) { setFormError("Cloudinary URL is required"); return; }

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      cloudinary_url: form.cloudinary_url.trim(),
      thumbnail_url: form.thumbnail_url.trim() || null,
      is_premium: form.is_premium,
    };
    if (form.duration) payload.duration = parseInt(form.duration, 10);
    if (form.category_ids.length > 0) payload.category_ids = form.category_ids;
    if (!editingVideo) {
      if (!form.cloudinary_public_id.trim()) { setFormError("Cloudinary public ID is required"); return; }
      payload.cloudinary_public_id = form.cloudinary_public_id.trim();
    }

    try {
      if (editingVideo) {
        await updateMutation.mutateAsync({ slug: editingVideo.slug, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setModalOpen(false);
    } catch {
      setFormError("Failed to save video. Check your input and try again.");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Videos</h1>
          <p className="mt-1 text-sm text-gym-text-secondary">Create and manage video content.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-xs">
            <label htmlFor="admin-videos-search" className="sr-only">Search videos</label>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gym-text-muted" />
            <input
              id="admin-videos-search"
              type="text"
              placeholder="Search videos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-gym-border bg-gym-surface py-2 pl-10 pr-4 text-sm text-gym-text-primary placeholder-gym-text-muted outline-none transition-all focus:border-gym-gold focus:ring-1 focus:ring-gym-gold"
            />
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Video
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-gym-error/30 bg-gym-error/5 p-4">
          <p className="text-sm text-gym-error">Failed to load videos. Please try again.</p>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <Card hover={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gym-border bg-gym-elevated/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Views</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gym-border">
                {data.items.map((video) => (
                  <tr key={video.id} className="transition-colors hover:bg-gym-elevated/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gym-elevated">
                          {video.thumbnail_url ? (
                            <img src={video.thumbnail_url} alt={video.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                          ) : (
                            <Play className="h-4 w-4 text-gym-text-muted" />
                          )}
                        </div>
                        <span className="font-medium text-gym-text-primary">{video.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gym-text-secondary">{video.category || "—"}</td>
                    <td className="px-4 py-3 text-gym-text-secondary">
                      {video.duration ? formatDuration(video.duration) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gym-text-secondary">
                      {video.view_count} {pluralize(video.view_count, "view")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={video.is_premium ? "premium" : "default"}>
                        {video.is_premium ? "Premium" : "Free"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gym-text-muted">{formatRelativeTime(video.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(video)} aria-label="Edit video" className="rounded-lg p-1.5 text-gym-text-muted transition-colors hover:bg-gym-elevated hover:text-gym-gold">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(video)} aria-label="Delete video" className="rounded-lg p-1.5 text-gym-text-muted transition-colors hover:bg-gym-elevated hover:text-gym-error">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <Play className="mx-auto h-10 w-10 text-gym-text-muted" />
          <p className="mt-3 text-sm text-gym-text-secondary">No videos found.</p>
        </Card>
      )}

      {data && data.pagination.total_pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gym-text-muted">
            Page {data.pagination.page} of {data.pagination.total_pages}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={!data.pagination.has_prev} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled={!data.pagination.has_next} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingVideo ? "Edit Video" : "New Video"}>
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-gym-error/30 bg-gym-error/5 p-3 text-sm text-gym-error">{formError}</div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none focus:border-gym-gold focus:ring-1 focus:ring-gym-gold" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3}
              className="w-full rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none focus:border-gym-gold focus:ring-1 focus:ring-gym-gold" />
          </div>
          {!editingVideo && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Cloudinary Public ID *</label>
                <input type="text" value={form.cloudinary_public_id} onChange={(e) => setForm((f) => ({ ...f, cloudinary_public_id: e.target.value }))}
                  className="w-full rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none focus:border-gym-gold focus:ring-1 focus:ring-gym-gold" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Cloudinary URL *</label>
                <input type="url" value={form.cloudinary_url} onChange={(e) => setForm((f) => ({ ...f, cloudinary_url: e.target.value }))}
                  className="w-full rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none focus:border-gym-gold focus:ring-1 focus:ring-gym-gold" />
              </div>
            </>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Thumbnail URL</label>
            <input type="url" value={form.thumbnail_url} onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))}
              className="w-full rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none focus:border-gym-gold focus:ring-1 focus:ring-gym-gold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Duration (seconds)</label>
              <input type="number" min="0" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className="w-full rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none focus:border-gym-gold focus:ring-1 focus:ring-gym-gold" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Categories</label>
              <select multiple value={form.category_ids} onChange={(e) => setForm((f) => ({ ...f, category_ids: Array.from(e.target.selectedOptions, (o) => o.value) }))}
                className="w-full rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none focus:border-gym-gold focus:ring-1 focus:ring-gym-gold">
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_premium} onChange={(e) => setForm((f) => ({ ...f, is_premium: e.target.checked }))}
              className="rounded border-gym-border-light bg-gym-surface text-gym-gold focus:ring-gym-gold" />
            <span className="text-sm text-gym-text-primary">Premium (members-only)</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={isSaving}>
              {editingVideo ? "Update Video" : "Create Video"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
