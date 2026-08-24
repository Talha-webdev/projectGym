import { useState } from "react";
import { Plus, FileText, Edit3, Trash2, Search, Upload, X } from "lucide-react";
import { useTags } from "@/hooks/useBlogs";
import { useCreateBlog, useUpdateBlog, useDeleteBlog, useUploadBlogCover, useAdminBlogs } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { formatRelativeTime, formatReadTime } from "@/utils/formatters";
import type { Blog } from "@/types/blog";

interface BlogForm {
  title: string;
  content: string;
  excerpt: string;
  cover_image_file: File | null;
  cover_image_url: string;
  meta_description: string;
  published: boolean;
  tag_ids: string[];
}

const emptyForm: BlogForm = {
  title: "",
  content: "",
  excerpt: "",
  cover_image_file: null,
  cover_image_url: "",
  meta_description: "",
  published: false,
  tag_ids: [],
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export default function AdminBlogs() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState("");

  const params: Record<string, string | number> = { page, per_page: 10 };
  if (search) params.search = search;
  const { data, isLoading, error } = useAdminBlogs(params);
  const { data: tags } = useTags();
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const deleteMutation = useDeleteBlog();
  const coverUploadMutation = useUploadBlogCover();

  const openCreate = () => {
    setEditingBlog(null);
    setForm(emptyForm);
    setFormError("");
    setUploadProgress(null);
    setTagFilter("");
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setModalOpen(true);
  };

  const openEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title,
      content: "",
      excerpt: blog.excerpt || "",
      cover_image_file: null,
      cover_image_url: blog.cover_image_url || "",
      meta_description: "",
      published: !!blog.published_at,
      tag_ids: [],
    });
    setFormError("");
    setUploadProgress(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
  };

  const handleCoverChange = async (file: File | null) => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    if (!file) {
      setCoverPreview(null);
      setForm((f) => ({ ...f, cover_image_file: null, cover_image_url: "" }));
      return;
    }
    setCoverPreview(URL.createObjectURL(file));
    setForm((f) => ({ ...f, cover_image_file: file, cover_image_url: "" }));
    setUploadProgress(0);
    setFormError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await coverUploadMutation.mutateAsync({
        formData: fd,
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setForm((f) => ({ ...f, cover_image_url: result.cover_image_url }));
    } catch {
      setFormError("Failed to upload cover image. Check the file type/size and try again.");
    } finally {
      setUploadProgress(null);
    }
  };

  const handleDelete = async (blog: Blog) => {
    if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(blog.slug);
    } catch {
      setFormError("Failed to delete blog.");
    }
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!form.title.trim()) { setFormError("Title is required"); return; }
    if (!form.content.trim() && !editingBlog) { setFormError("Content is required"); return; }

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      content: form.content.trim() || undefined,
      excerpt: form.excerpt.trim() || null,
      cover_image_url: form.cover_image_url.trim() || null,
      meta_description: form.meta_description.trim() || null,
      published: form.published,
    };
    if (form.tag_ids.length > 0) payload.tag_ids = form.tag_ids;

    try {
      if (editingBlog) {
        await updateMutation.mutateAsync({ slug: editingBlog.slug, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setModalOpen(false);
      setForm(emptyForm);
      setFormError("");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { detail?: unknown } }; message?: string };
      const detail = axiosErr?.response?.data?.detail;
      if (typeof detail === "string") {
        setFormError(detail);
      } else if (Array.isArray(detail)) {
        setFormError(detail.map((e: { msg?: string }) => e.msg ?? String(e)).join(", "));
      } else if (axiosErr?.response?.status) {
        setFormError(`Save failed (HTTP ${axiosErr.response.status}). Check your input and try again.`);
      } else {
        setFormError("Failed to save blog. Check your input and try again.");
      }
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || coverUploadMutation.isPending;
  const currentCover = coverPreview || editingBlog?.cover_image_url || null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Blogs</h1>
          <p className="mt-1 text-sm text-gym-text-secondary">Create and manage blog posts.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-xs">
            <label htmlFor="admin-blogs-search" className="sr-only">Search blogs</label>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gym-text-muted" />
            <input
              id="admin-blogs-search"
              type="text"
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-gym-border bg-gym-surface py-2 pl-10 pr-4 text-sm text-gym-text-primary placeholder-gym-text-muted outline-none transition-all focus:border-gym-gold focus:ring-1 focus:ring-gym-gold"
            />
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Blog
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-gym-error/30 bg-gym-error/5 p-4">
          <p className="text-sm text-gym-error">Failed to load blogs. Please try again.</p>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Read Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Views</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Published</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gym-border">
                {data.items.map((blog) => (
                  <tr key={blog.id} className="transition-colors hover:bg-gym-elevated/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gym-elevated">
                          {blog.cover_image_url ? (
                            <img src={blog.cover_image_url} alt={blog.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                          ) : (
                            <FileText className="h-4 w-4 text-gym-text-muted" />
                          )}
                        </div>
                        <span className="font-medium text-gym-text-primary">{blog.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gym-text-secondary">
                      {blog.read_time_minutes ? formatReadTime(blog.read_time_minutes) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gym-text-secondary">{blog.view_count}</td>
                    <td className="px-4 py-3 text-gym-text-muted">
                      {blog.published_at ? formatRelativeTime(blog.published_at) : "Draft"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(blog)} aria-label="Edit blog" className="rounded-lg p-1.5 text-gym-text-muted transition-colors hover:bg-gym-elevated hover:text-gym-gold">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(blog)} aria-label="Delete blog" className="rounded-lg p-1.5 text-gym-text-muted transition-colors hover:bg-gym-elevated hover:text-gym-error">
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
          <FileText className="mx-auto h-10 w-10 text-gym-text-muted" />
          <p className="mt-3 text-sm text-gym-text-secondary">No blogs found.</p>
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

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingBlog ? "Edit Blog" : "New Blog"}>
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-gym-error/30 bg-gym-error/5 p-3 text-sm text-gym-error">{formError}</div>
          )}
          {uploadProgress !== null && (
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-gym-text-secondary">
                <span>Uploading cover…</span>
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
            <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Content *{editingBlog ? " (leave blank to keep existing)" : ""}</label>
            <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={8}
              className="w-full rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none focus:border-gym-gold focus:ring-1 focus:ring-gym-gold font-mono" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} rows={2}
              className="w-full rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none focus:border-gym-gold focus:ring-1 focus:ring-gym-gold" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Cover Image</label>
            {currentCover && (
              <div className="mb-2 overflow-hidden rounded-lg border border-gym-border-light">
                <img src={currentCover} alt="Cover preview" className="h-32 w-full object-cover" />
              </div>
            )}
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gym-border-light bg-gym-surface px-4 py-3 text-sm text-gym-text-secondary transition-colors hover:border-gym-gold">
              <Upload className="h-5 w-5 text-gym-text-muted" />
              <span className="flex-1">
                {form.cover_image_file ? (
                  <span className="text-gym-text-primary">
                    {form.cover_image_file.name} <span className="text-gym-text-muted">({formatFileSize(form.cover_image_file.size)})</span>
                  </span>
                ) : (
                  "Select a cover image (JPEG, PNG, WebP)"
                )}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/avif,.jpg,.jpeg,.png,.gif,.webp,.avif"
                className="sr-only"
                onChange={(e) => handleCoverChange(e.target.files?.[0] || null)}
              />
            </label>
            {form.cover_image_url && (
              <p className="mt-1 truncate text-xs text-gym-text-muted">{form.cover_image_url}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Meta Description</label>
            <input type="text" value={form.meta_description} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
              className="w-full rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none focus:border-gym-gold focus:ring-1 focus:ring-gym-gold" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Tags</label>
            <input
              type="text"
              placeholder="Type to filter tags…"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagFilter.trim() && tags) {
                  e.preventDefault();
                  const match = tags.find((t) => t.name.toLowerCase() === tagFilter.trim().toLowerCase());
                  if (match && !form.tag_ids.includes(match.id)) {
                    setForm((f) => ({ ...f, tag_ids: [...f.tag_ids, match.id] }));
                  }
                  setTagFilter("");
                }
              }}
              className="mb-2 w-full rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none focus:border-gym-gold focus:ring-1 focus:ring-gym-gold"
            />
            {form.tag_ids.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {tags?.filter((t) => form.tag_ids.includes(t.id)).map((t) => (
                  <span key={t.id} className="inline-flex items-center gap-1 rounded-full bg-gym-gold/15 px-2.5 py-1 text-xs font-medium text-gym-gold">
                    {t.name}
                    <button type="button" onClick={() => setForm((f) => ({ ...f, tag_ids: f.tag_ids.filter((id) => id !== t.id) }))}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-gym-gold/25">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="max-h-40 overflow-y-auto rounded-lg border border-gym-border-light bg-gym-surface p-2">
              {tags?.filter((t) => !form.tag_ids.includes(t.id) && (!tagFilter || t.name.toLowerCase().includes(tagFilter.toLowerCase()))).length === 0 && (
                <p className="px-2 py-1 text-xs text-gym-text-muted">{tags?.length ? "All tags selected" : "No tags available"}</p>
              )}
              {tags?.filter((t) => !form.tag_ids.includes(t.id) && (!tagFilter || t.name.toLowerCase().includes(tagFilter.toLowerCase()))).map((t) => (
                <button key={t.id} type="button"
                  onClick={() => setForm((f) => ({ ...f, tag_ids: [...f.tag_ids, t.id] }))}
                  className="w-full rounded-md px-3 py-1.5 text-left text-sm text-gym-text-secondary transition-colors hover:bg-gym-elevated hover:text-gym-text-primary">
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="rounded border-gym-border-light bg-gym-surface text-gym-gold focus:ring-gym-gold" />
              <span className="text-sm text-gym-text-primary">Published</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={isSaving}>
              {editingBlog ? "Update Blog" : "Create Blog"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}