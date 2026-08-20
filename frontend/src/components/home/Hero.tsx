import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gym-bg via-gym-bg/95 to-gym-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,168,83,0.08)_0%,_transparent_70%)]" />
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gym-gold/5" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gym-gold/10" />
        <div className="absolute left-1/2 top-1/3 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gym-gold/20" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="mb-6 inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
            Project GYM
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="font-heading text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-tight text-gym-text-primary"
        >
          Transform Your{" "}
          <span className="bg-gradient-to-r from-gym-gold to-gym-gold-hover bg-clip-text text-transparent">
            Body
          </span>
          .<br />
          Transform Your{" "}
          <span className="bg-gradient-to-r from-gym-gold to-gym-gold-hover bg-clip-text text-transparent">
            Life
          </span>
          .
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mx-auto mt-6 max-w-2xl text-lg text-gym-text-secondary"
        >
          Join a community of thousands who have transformed their bodies and minds through proven
          training, nutrition, and unwavering support.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-gym-gold px-8 py-4 text-base font-semibold text-black transition-all duration-300 hover:bg-gym-gold-hover hover:shadow-[0_0_30px_rgba(212,168,83,0.3)]"
          >
            Start Your Journey
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-xl border border-gym-border-light bg-gym-surface/50 px-8 py-4 text-base font-medium text-gym-text-secondary backdrop-blur-sm transition-all duration-300 hover:border-gym-gold/30 hover:text-gym-gold"
          >
            Learn More
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-gym-text-muted">Scroll</span>
          <div className="h-8 w-[1px] animate-pulse bg-gym-gold/50" />
        </div>
      </motion.div>
    </section>
  );
}