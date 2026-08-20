import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/utils/animations";

export function CoachIntro() {
  return (
    <section className="section-padding bg-gym-surface/50">
      <div className="content-max-width px-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid items-center gap-12 md:grid-cols-2"
        >
          <motion.div variants={fadeInUp} className="relative">
            <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-gym-gold/20 to-gym-elevated" />
            <div className="absolute -bottom-4 -right-4 h-full w-full rounded-2xl border border-gym-gold/20" />
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-6">
            <span className="inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
              Your Coach
            </span>
            <h2 className="font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
              Meet Your{" "}
              <span className="text-gym-gold">Coach</span>
            </h2>
            <p className="text-gym-text-secondary leading-relaxed">
              I've been where you are. After years of struggling with my weight and health, I made a
              decision to change. Through discipline, proper nutrition, and consistent training, I
              lost over 150 pounds and completely transformed my life.
            </p>
            <p className="text-gym-text-secondary leading-relaxed">
              Now, I'm dedicated to helping you achieve the same results. Every program, every
              workout, every meal plan is designed with one thing in mind - your success.
            </p>
            <div className="flex items-center gap-6 pt-2">
              <div>
                <p className="font-heading text-2xl font-bold text-gym-gold">150+</p>
                <p className="text-xs text-gym-text-muted">Pounds Lost</p>
              </div>
              <div className="h-12 w-px bg-gym-border-light" />
              <div>
                <p className="font-heading text-2xl font-bold text-gym-gold">10K+</p>
                <p className="text-xs text-gym-text-muted">Hours Coaching</p>
              </div>
              <div className="h-12 w-px bg-gym-border-light" />
              <div>
                <p className="font-heading text-2xl font-bold text-gym-gold">5+</p>
                <p className="text-xs text-gym-text-muted">Years Experience</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}