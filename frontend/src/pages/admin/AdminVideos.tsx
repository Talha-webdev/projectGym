import { useState } from "react";
import { Plus, Play, Edit3, Trash2, Search, Upload, Image } from "lucide-react";
import { useVideos, useCategories } from "@/hooks/useVideos";
import { useUpdateVideo, useDeleteVideo, useUploadVideo, useUploadThumbnail } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { formatRelativeTime, formatDuration, pluralize } from "@/utils/formatters";
import type { Video } from "@/types/video";

interface VideoForm {
  title: string;
  description: string;
  videoFile: File | null;
  thumbnailFile: File | null;
  duration: string;
  category_ids: string[];
}

const emptyForm: VideoForm = {
  title: "",
  description: "",
  videoFile: null,
  thumbnailFile: null,
  duration: "",
  category_ids: [],
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export default function AdminVideos() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [form, setForm] = useState<VideoForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const params: Record<string, string | number> = { page, per_page: 10 };
  if (search) params.search = search;
  const { data, isLoading, error } = useVideos(params);
  const { data: categories } = useCategories();
  const createMutation = useUploadVideo();
  const thumbnailMutation = useUploadThumbnail();
  const updateMutation = useUpdateVideo();
  const deleteMutation = useDeleteVideo();

  const openCreate = () => {
    setEditingVideo(null);
    setForm(emptyForm);
    setThumbnailPreview(null);
    setFormError("");
    setUploadProgress(null);
    setModalOpen(true);
  };

  const openEdit = (video: Video) => {
    setEditingVideo(video);
    setForm({
      title: video.title,
      description: video.description || "",
      videoFile: null,
      thumbnailFile: null,
      duration: video.duration?.toString() || "",
      category_ids: [],
    });
    setThumbnailPreview(null);
    setFormError("");
    setUploadProgress(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(null);
  };

  const handleThumbnailChange = (file: File | null) => {
    setForm((f) => ({ ...f, thumbnailFile: file }));
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(file ? URL.createObjectURL(file) : null);
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
    setUploadProgress(null);
    if (!form.title.trim()) { setFormError("Title is required"); return; }

    if (editingVideo) {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim() || null,
      };
      if (form.duration) payload.duration = parseInt(form.duration, 10);
      if (form.category_ids.length > 0) payload.category_ids = form.category_ids;
      try {
        if (form.thumbnailFile) {
          const tfd = new FormData();
          tfd.append("file", form.thumbnailFile);
          const thumb = await thumbnailMutation.mutateAsync({
            formData: tfd,
            onUploadProgress: (e) => {
              if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
            },
          });
          payload.thumbnail_url = thumb.thumbnail_url;
        }
        await updateMutation.mutateAsync({ slug: editingVideo.slug, data: payload });
        setModalOpen(false);
      } catch {
        setFormError("Failed to save video. Check your input and try again.");
      } finally {
        setUploadProgress(null);
      }
      return;
    }

    if (!form.videoFile) { setFormError("Please select a video file"); return; }

    const fd = new FormData();
    fd.append("file", form.videoFile);
    fd.append("title", form.title.trim());
    if (form.description.trim()) fd.append("description", form.description.trim());
    if (form.duration) fd.append("duration", parseInt(form.duration, 10).toString());
    if (form.category_ids.length > 0) fd.append("category_ids", form.category_ids.join(","));
    if (form.thumbnailFile) fd.append("thumbnail", form.thumbnailFile);

    try {
      await createMutation.mutateAsync({
        formData: fd,
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setModalOpen(false);
    } catch (error: unknown) {
      console.error("[AdminVideos] Upload error:", error);
      const err = error as { code?: string; message?: string; response?: { data?: { detail?: unknown }; status?: number } };
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string") {
        setFormError(detail);
      } else if (Array.isArray(detail)) {
        setFormError(detail.map((e: { msg?: string }) => e.msg ?? String(e)).join(", "));
      } else if (err?.response?.status) {
        setFormError(`Upload failed (HTTP ${err.response.status}). Check the file type/size and try again.`);
      } else {
        const code = err?.code || "UNKNOWN";
        const msg = err?.message || "No message";
        setFormError(`Network error [${code}]: ${msg}`);
      }
    } finally {
      setUploadProgress(null);
    }
  };

  const isSaving = createMutation.isPending || thumbnailMutation.isPending || updateMutation.isPending;
  const currentThumbnail = thumbnailPreview || editingVideo?.thumbnail_url || null;

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

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingVideo ? "Edit Video" : "New Video"}>
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-gym-error/30 bg-gym-error/5 p-3 text-sm text-gym-error">{formError}</div>
          )}
          {uploadProgress !== null && (
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-gym-text-secondary">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gym-elevated">
                <div className="h-full rounded-full bg-gym-gold transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Video File *</label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gym-border-light bg-gym-surface px-4 py-3 text-sm text-gym-text-secondary transition-colors hover:border-gym-gold">
                <Upload className="h-5 w-5 text-gym-text-muted" />
                <span className="flex-1">
                  {form.videoFile ? (
                    <span className="text-gym-text-primary">
                      {form.videoFile.name} <span className="text-gym-text-muted">({formatFileSize(form.videoFile.size)})</span>
                    </span>
                  ) : (
                    "Select a video file (MP4, WebM, MOV, AVI)"
                  )}
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.mkv,.avi"
                  className="sr-only"
                  onChange={(e) => setForm((f) => ({ ...f, videoFile: e.target.files?.[0] || null }))}
                />
              </label>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">
              {editingVideo ? "Thumbnail (optional — replaces current)" : "Thumbnail"}
            </label>
            {currentThumbnail && (
              <div className="mb-2 overflow-hidden rounded-lg border border-gym-border-light">
                <img src={currentThumbnail} alt="Thumbnail preview" className="h-24 w-full object-cover" />
              </div>
            )}
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gym-border-light bg-gym-surface px-4 py-3 text-sm text-gym-text-secondary transition-colors hover:border-gym-gold">
              <Image className="h-5 w-5 text-gym-text-muted" />
              <span className="flex-1">
                {form.thumbnailFile ? form.thumbnailFile.name : "Select a thumbnail image (JPEG, PNG, WebP)"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/avif,.jpg,.jpeg,.png,.gif,.webp,.avif"
                className="sr-only"
                onChange={(e) => handleThumbnailChange(e.target.files?.[0] || null)}
              />
            </label>
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
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={isSaving}>
              {editingVideo ? "Update Video" : "Upload Video"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}