import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useStatistics } from "@/hooks/usePublic";

function Counter({ value, suffix = "", label }: { value: string; suffix?: string; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="text-center">
      <p className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-gym-gold">
        {isInView ? value : "0"}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-gym-text-muted">{label}</p>
    </div>
  );
}

export function Statistics() {
  const { data: stats, isLoading } = useStatistics();

  const items = stats
    ? [
        { value: stats.total_weight_lost, suffix: " lbs", label: "Total Weight Lost" },
        { value: stats.active_members, suffix: "+", label: "Active Members" },
        { value: stats.workout_videos, suffix: "+", label: "Workout Videos" },
        { value: stats.success_rate, suffix: "%", label: "Success Rate" },
      ]
    : [];

  return (
    <section className="section-padding bg-gym-surface/50">
      <div className="content-max-width px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
            By The Numbers
          </span>
          <h2 className="font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
            The Proof Is In The Results
          </h2>
        </motion.div>

        {!isLoading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Counter value={item.value} suffix={item.suffix} label={item.label} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}