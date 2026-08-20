import { motion } from "framer-motion";
import { Check } from "lucide-react";

const results = [
  "Lost over 150 pounds naturally",
  "Built sustainable eating habits",
  "Developed consistent workout routine",
  "Gained confidence and mental clarity",
  "Inspired thousands to transform",
];

export function BeforeAfter() {
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
            The Journey
          </span>
          <h2 className="font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
            Before & After
          </h2>
        </motion.div>

        <div className="grid items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="font-heading text-2xl font-bold text-gym-text-primary">
              The Transformation Story
            </h3>
            <p className="text-gym-text-secondary leading-relaxed">
              This journey wasn't just about losing weight - it was about gaining a new lease on
              life. Through discipline, consistency, and the right guidance, complete transformation
              is possible.
            </p>
            <ul className="space-y-3">
              {results.map((result, i) => (
                <motion.li
                  key={result}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-sm text-gym-text-secondary"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gym-gold-muted">
                    <Check className="h-3 w-3 text-gym-gold" />
                  </span>
                  {result}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="aspect-[3/4] rounded-xl bg-gradient-to-b from-gym-elevated to-gym-surface">
                  <div className="flex h-full items-center justify-center">
                    <span className="text-xs text-gym-text-muted">Before</span>
                  </div>
                </div>
                <p className="text-center text-xs font-medium text-gym-text-muted">Before</p>
              </div>
              <div className="space-y-2">
                <div className="aspect-[3/4] rounded-xl bg-gradient-to-b from-gym-gold/20 to-gym-gold/5">
                  <div className="flex h-full items-center justify-center">
                    <span className="text-xs text-gym-gold">After</span>
                  </div>
                </div>
                <p className="text-center text-xs font-medium text-gym-gold">After</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}