import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Check } from "lucide-react";
import { isValidEmail } from "@/utils/validators";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setStatus("success");
    setIsSubmitting(false);
  };

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
            <Mail className="mx-auto mb-6 h-8 w-8 text-gym-gold" />
            <h2 className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-gym-text-primary">
              Stay Updated
            </h2>
            <p className="mx-auto mt-4 max-w-md text-gym-text-secondary">
              Get the latest workout tips, nutrition advice, and transformation stories delivered to
              your inbox.
            </p>

            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto mt-8 max-w-sm rounded-xl border border-gym-success/30 bg-gym-success/10 px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-gym-success" />
                  <p className="text-sm text-gym-success">Thanks for subscribing!</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-sm gap-3">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gym-border-light bg-gym-bg px-4 py-3 text-sm text-gym-text-primary placeholder-gym-text-muted transition-all duration-200 focus:border-gym-gold focus:outline-none focus:ring-1 focus:ring-gym-gold"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gym-gold px-5 py-3 text-sm font-semibold text-black transition-all duration-300 hover:bg-gym-gold-hover disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      Subscribe <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}