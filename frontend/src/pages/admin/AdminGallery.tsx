import { useState } from "react";
import { Plus, Image, Trash2, Edit3, Upload } from "lucide-react";
import { useGallery } from "@/hooks/useGallery";
import { useUpdateGallery, useDeleteGallery, useUploadGallery } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import type { GalleryItem } from "@/types/gallery";

interface GalleryForm {
  title: string;
  imageFile: File | null;
  category: string;
  sort_order: string;
}

const emptyForm: GalleryForm = {
  title: "",
  imageFile: null,
  category: "",
  sort_order: "0",
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export default function AdminGallery() {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<GalleryForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data, isLoading, error } = useGallery({ page, per_page: 12 });
  const createMutation = useUploadGallery();
  const updateMutation = useUpdateGallery();
  const deleteMutation = useDeleteGallery();

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setFormError("");
    setUploadProgress(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setForm({
      title: item.title || "",
      imageFile: null,
      category: item.category || "",
      sort_order: item.sort_order.toString(),
    });
    setFormError("");
    setUploadProgress(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleImageChange = (file: File | null) => {
    setForm((f) => ({ ...f, imageFile: file }));
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!window.confirm(`Delete this image${item.title ? ` "${item.title}"` : ""}? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(item.id);
    } catch {
      setFormError("Failed to delete image.");
    }
  };

  const handleSubmit = async () => {
    setFormError("");
    setUploadProgress(null);

    if (editingItem) {
      const payload: Record<string, unknown> = {
        title: form.title.trim() || null,
        category: form.category.trim() || null,
        sort_order: parseInt(form.sort_order, 10) || 0,
      };
      try {
        await updateMutation.mutateAsync({ id: editingItem.id, data: payload });
        setModalOpen(false);
      } catch {
        setFormError("Failed to save image. Check your input and try again.");
      }
      return;
    }

    if (!form.imageFile) { setFormError("Please select an image file"); return; }

    const fd = new FormData();
    fd.append("file", form.imageFile);
    if (form.title.trim()) fd.append("title", form.title.trim());
    if (form.category.trim()) fd.append("category", form.category.trim());
    fd.append("sort_order", String(parseInt(form.sort_order, 10) || 0));

    try {
      await createMutation.mutateAsync({
        formData: fd,
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setModalOpen(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: unknown }; status?: number } };
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string") {
        setFormError(detail);
      } else if (Array.isArray(detail)) {
        setFormError(detail.map((e: { msg?: string }) => e.msg ?? String(e)).join(", "));
      } else if (err?.response?.status) {
        setFormError(`Upload failed (HTTP ${err.response.status}). Check the file type/size and try again.`);
      } else {
        setFormError("Failed to upload image. Check the file type/size and try again.");
      }
    } finally {
      setUploadProgress(null);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const currentPreview = imagePreview || editingItem?.cloudinary_url || null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Gallery</h1>
          <p className="mt-1 text-sm text-gym-text-secondary">Manage gallery images.</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Upload Image
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-gym-error/30 bg-gym-error/5 p-4">
          <p className="text-sm text-gym-error">Failed to load gallery. Please try again.</p>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="aspect-[4/3] w-full rounded-xl" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((item) => (
            <Card key={item.id} className="group overflow-hidden p-0" hover={false}>
              <div className="relative aspect-[4/3] overflow-hidden bg-gym-elevated">
                <img
                  src={item.cloudinary_url}
                  alt={item.title || "Gallery image"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => openEdit(item)} aria-label="Edit image" className="rounded-lg bg-gym-surface/80 p-2 text-gym-text-primary transition-colors hover:bg-gym-gold hover:text-black">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(item)} aria-label="Delete image" className="rounded-lg bg-gym-surface/80 p-2 text-gym-text-primary transition-colors hover:bg-gym-error">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {item.category && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                    {item.category}
                  </span>
                )}
              </div>
              {item.title && (
                <div className="px-3 py-2">
                  <p className="truncate text-sm text-gym-text-primary">{item.title}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Image className="mx-auto h-10 w-10 text-gym-text-muted" />
          <p className="mt-3 text-sm text-gym-text-secondary">No gallery images found.</p>
        </Card>
      )}

      {data && data.pagination.total_pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
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

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingItem ? "Edit Image" : "Upload Image"}>
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
            <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none focus:border-gym-gold focus:ring-1 focus:ring-gym-gold" />
          </div>
          {!editingItem && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Image File *</label>
              {imagePreview && (
                <div className="mb-2 overflow-hidden rounded-lg border border-gym-border-light">
                  <img src={imagePreview} alt="Image preview" className="aspect-[4/3] w-full object-cover" />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gym-border-light bg-gym-surface px-4 py-3 text-sm text-gym-text-secondary transition-colors hover:border-gym-gold">
                <Upload className="h-5 w-5 text-gym-text-muted" />
                <span className="flex-1">
                  {form.imageFile ? (
                    <span className="text-gym-text-primary">
                      {form.imageFile.name} <span className="text-gym-text-muted">({formatFileSize(form.imageFile.size)})</span>
                    </span>
                  ) : (
                    "Select an image (JPEG, PNG, WebP, GIF)"
                  )}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/avif,.jpg,.jpeg,.png,.gif,.webp,.avif"
                  className="sr-only"
                  onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          )}
          {editingItem && currentPreview && (
            <div className="overflow-hidden rounded-lg border border-gym-border-light">
              <img src={currentPreview} alt="Current image" className="aspect-[4/3] w-full object-cover" />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Category</label>
            <input type="text" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none focus:border-gym-gold focus:ring-1 focus:ring-gym-gold" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gym-text-secondary">Sort Order</label>
            <input type="number" min="0" max="9999" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              className="w-full rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary outline-none focus:border-gym-gold focus:ring-1 focus:ring-gym-gold" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={isSaving}>
              {editingItem ? "Update Image" : "Upload Image"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}