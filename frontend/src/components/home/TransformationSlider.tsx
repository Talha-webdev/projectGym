import { useState, useCallback } from "react";
import { motion } from "framer-motion";

export function TransformationSlider() {
  const [sliderPos, setSliderPos] = useState(50);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(100, Math.max(0, pos)));
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSliderPos((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSliderPos((prev) => Math.min(100, prev + 5));
    }
  }, []);

  return (
    <section className="section-padding">
      <div className="content-max-width px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
            Real Results
          </span>
          <h2 className="font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
            The Transformation
          </h2>
          <p className="mt-4 text-gym-text-secondary">See the difference dedication makes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gym-border select-none"
          onMouseMove={handleMove}
          onTouchMove={handleMove}
          onKeyDown={handleKeyDown}
          role="slider"
          tabIndex={0}
          aria-label="Image comparison slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={sliderPos}
          aria-valuetext={`${sliderPos}% visible`}
        >
          <div className="aspect-video bg-gradient-to-br from-gym-elevated to-gym-surface">
            <div className="flex h-full items-center justify-center">
              <p className="text-gym-text-muted text-sm">After</p>
            </div>
          </div>
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="aspect-video bg-gradient-to-br from-gym-gold/20 to-gym-gold/5">
              <div className="flex h-full items-center justify-center">
                <p className="text-gym-gold text-sm">Before</p>
              </div>
            </div>
          </div>
          <div
            className="absolute inset-y-0 cursor-ew-resize"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-gym-gold shadow-[0_0_8px_rgba(212,168,83,0.5)]" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gym-gold bg-gym-bg p-2 shadow-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4A853" strokeWidth="2">
                <path d="M8 3L3 8l5 5" /><path d="M16 3l5 5-5 5" />
                <path d="M3 8h18" /><path d="M3 16h18" />
                <path d="M8 13l-5 5 5 5" /><path d="M16 13l5 5-5 5" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
