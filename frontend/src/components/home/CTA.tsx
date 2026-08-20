import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="section-padding">
      <div className="content-max-width px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-gym-gold/20 bg-gradient-to-br from-gym-surface to-gym-bg px-8 py-16 text-center sm:px-16"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,168,83,0.06)_0%,_transparent_70%)]" />
          <div className="relative z-10">
            <h2 className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-gym-text-primary">
              Ready to Transform?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gym-text-secondary">
              Join thousands of members who have already taken the first step. Start your 3-month
              journey today and unlock all premium content.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-gym-gold px-8 py-4 font-semibold text-black transition-all duration-300 hover:bg-gym-gold-hover hover:shadow-[0_0_30px_rgba(212,168,83,0.3)]"
              >
                Get Started Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/pricing"
                className="rounded-xl border border-gym-border-light px-8 py-4 font-medium text-gym-text-secondary transition-all duration-300 hover:border-gym-gold/30 hover:text-gym-gold"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}