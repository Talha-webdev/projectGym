import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useGallery } from "@/hooks/useGallery";
import { Skeleton } from "@/components/ui/Skeleton";

export function GalleryPreview() {
  const { data, isLoading } = useGallery({ per_page: 4 });

  return (
    <section className="section-padding bg-gym-surface/50">
      <div className="content-max-width px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <span className="mb-4 inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
              Gallery
            </span>
            <h2 className="font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
              Moments That Matter
            </h2>
          </div>
          <Link
            to="/gallery"
            className="hidden items-center gap-1 text-sm font-medium text-gym-gold transition-colors hover:text-gym-gold-hover sm:flex"
          >
            View Gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" style={{ aspectRatio: i === 0 ? '4/5' : '3/4' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {data?.items?.slice(0, 4).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`group relative overflow-hidden rounded-xl border border-gym-border ${
                  i === 0 ? "row-span-2" : ""
                }`}
              >
                <div className={`bg-gym-elevated ${i === 0 ? "aspect-[4/5]" : "aspect-[3/4]"}`}>
                  <div className="flex h-full items-center justify-center text-gym-text-muted text-xs">
                    Gallery
                  </div>
                </div>
                {item.title && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1 rounded-lg border border-gym-border-light px-6 py-3 text-sm font-medium text-gym-gold transition-colors hover:bg-gym-gold-muted"
          >
            View Full Gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}