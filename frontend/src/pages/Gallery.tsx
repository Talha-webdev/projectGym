import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { useGallery } from "@/hooks/useGallery";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { staggerContainer, fadeInUp } from "@/utils/animations";

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const params: Record<string, string | number> = { page, per_page: 24 };
  if (activeCategory) params.category = activeCategory;

  const { data, isLoading } = useGallery(params);
  const items = data?.items || [];

  const categories = activeCategory
    ? [activeCategory]
    : [...new Set(items.map((item) => item.category).filter(Boolean) as string[])];

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
  }, [items.length]);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
  }, [items.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, handlePrev, handleNext]);

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  return (
    <>
      <SEOHead
        title="Gallery"
        description="Browse transformation photos and fitness inspiration. See real results from our community members."
        canonical="/gallery"
      />
      <div>
      <section className="relative pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-gym-bg via-gym-bg to-gym-surface/50" />
        <div className="relative z-10 content-max-width px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
              Gallery
            </span>
            <h1 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-gym-text-primary">
              Moments That Matter
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-gym-text-secondary">
              A visual journey through transformations, workouts, and milestones.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="content-max-width px-4">
          {!isLoading && items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 flex flex-wrap justify-center gap-2"
            >
              <button
                onClick={() => { setActiveCategory(null); setPage(1); }}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  !activeCategory
                    ? "bg-gym-gold text-black"
                    : "border border-gym-border-light bg-gym-surface text-gym-text-secondary hover:border-gym-gold/30 hover:text-gym-gold"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setPage(1); }}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-gym-gold text-black"
                      : "border border-gym-border-light bg-gym-surface text-gym-text-secondary hover:border-gym-gold/30 hover:text-gym-gold"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          )}

          {isLoading ? (
            <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="mb-4 break-inside-avoid">
                  <Skeleton
                    variant="rectangular"
                    className={`w-full !rounded-xl ${idx % 3 === 0 ? "h-72" : idx % 3 === 1 ? "h-48" : "h-56"}`}
                  />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Grid3X3 className="h-12 w-12" />}
              title="No images yet"
              description="Gallery coming soon. Check back for transformation photos and workout moments."
            />
          ) : (
            <>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="columns-2 gap-4 md:columns-3 lg:columns-4"
              >
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    variants={fadeInUp}
                    className="mb-4 break-inside-avoid"
                  >
                    <button
                      onClick={() => setLightboxIndex(idx)}
                      className="group relative block w-full overflow-hidden rounded-xl border border-gym-border bg-gym-elevated text-left transition-all duration-300 hover:border-gym-gold/30 hover:shadow-lg"
                    >
                      <img
                        src={item.cloudinary_url}
                        alt={item.title || "Gallery image"}
                        loading="lazy"
                      decoding="async"
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ minHeight: "8rem" }}
                      />
                      <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/30" />
                      {item.title && (
                        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
                          <p className="text-sm font-medium text-white">{item.title}</p>
                        </div>
                      )}
                    </button>
                  </motion.div>
                ))}
              </motion.div>

              {data?.pagination && data.pagination.total_pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!data.pagination.has_prev}
                    className="rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2 text-sm text-gym-text-secondary transition-colors hover:border-gym-gold/30 hover:text-gym-gold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gym-text-muted">
                    Page {data.pagination.page} of {data.pagination.total_pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!data.pagination.has_next}
                    className="rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2 text-sm text-gym-text-secondary transition-colors hover:border-gym-gold/30 hover:text-gym-gold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <AnimatePresence>
        {lightboxIndex !== null && items[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 z-10 hidden translate-y-[-50%] rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 md:block"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex max-h-[90vh] max-w-[90vw] flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={items[lightboxIndex].cloudinary_url}
                alt={items[lightboxIndex].title || "Gallery image"}
                className="max-h-[80vh] max-w-full rounded-lg object-contain"
                decoding="async"
              />
              {items[lightboxIndex].title && (
                <p className="mt-4 text-center text-sm text-white">
                  {items[lightboxIndex].title}
                </p>
              )}
              <p className="mt-1 text-xs text-gym-text-muted">
                {lightboxIndex + 1} / {items.length}
              </p>
            </motion.div>

            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute bottom-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 md:hidden"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
