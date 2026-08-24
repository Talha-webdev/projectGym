import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Mail, PhoneCall, MessageCircle, Music2, AtSign, Globe, SendHorizontal, Check, CircleAlert,
} from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer } from "@/utils/animations";
import { contactApi } from "@/services/contactApi";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Contact() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const whatsappNumber = settings.coach_whatsapp || "+1 (555) 123-4567";
  const whatsappClean = whatsappNumber.replace(/[^\d+]/g, "");
  const phoneValue = settings.coach_phone || "+1 (555) 123-4567";
  const phoneClean = phoneValue.replace(/[^\d+]/g, "");
  const emailValue = settings.coach_email || "coach@projectgym.com";

  const contactInfo = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: whatsappNumber,
      href: `https://wa.me/${whatsappClean.replace(/[^\d]/g, "")}`,
    },
    {
      icon: Mail,
      label: "Email",
      value: emailValue,
      href: `mailto:${emailValue}`,
    },
    {
      icon: PhoneCall,
      label: "Phone",
      value: phoneValue,
      href: `tel:${phoneClean}`,
    },
  ];

  const socialLinks = [
    ...(settings.social_instagram
      ? [{ icon: AtSign, label: "Instagram", value: "@projectgym", href: settings.social_instagram }]
      : []),
    ...(settings.social_tiktok
      ? [{ icon: Music2, label: "TikTok", value: "@projectgym", href: settings.social_tiktok }]
      : []),
    ...(settings.social_facebook
      ? [{ icon: Globe, label: "Facebook", value: "LH Fitness", href: settings.social_facebook }]
      : []),
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      await contactApi.submit(form);
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SEOHead
        title="Contact - LH Fitness"
        description="Get in touch with Coach. Reach out via WhatsApp, email, or social media. We'd love to hear from you."
        canonical="/contact"
      />

      {/* Hero */}
      <section className="section-padding relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gym-gold/5 via-transparent to-transparent" />
        <div className="content-max-width px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-[900px] text-center"
          >
            <motion.span
              variants={fadeInUp}
              className="inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold"
            >
              Get In Touch
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              className="mt-6 font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight text-gym-text-primary"
            >
              Let's{" "}
              <span className="text-gym-gold">Connect</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gym-text-secondary"
            >
              Have a question about the program or just want to say hi?
              We'd love to hear from you. Reach out through any of the channels below.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Two-Column Split */}
      <section className="section-padding bg-gym-surface/50">
        <div className="content-max-width px-4">
          <div className="mx-auto grid max-w-[900px] gap-12 md:grid-cols-2">
            {/* Left — Contact Info */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-8"
            >
              <motion.div variants={fadeInLeft}>
                <h2 className="font-heading text-2xl font-bold text-gym-text-primary">
                  Contact Info
                </h2>
                <p className="mt-2 text-sm text-gym-text-secondary">
                  Reach out directly through any of these channels.
                </p>
              </motion.div>

              <div className="space-y-4">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.a
                      key={item.label}
                      variants={fadeInLeft}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-xl border border-gym-border-light bg-gym-surface p-4 transition-colors hover:border-gym-gold/30"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gym-gold-muted text-gym-gold">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gym-text-muted">{item.label}</p>
                        <p className="text-sm text-gym-text-primary">{item.value}</p>
                      </div>
                    </motion.a>
                  );
                })}
              </div>

              <motion.div variants={fadeInLeft}>
                <h3 className="font-heading text-lg font-semibold text-gym-text-primary">
                  Follow Us
                </h3>
                <p className="mt-1 text-sm text-gym-text-secondary">
                  Stay connected on social media for daily content and updates.
                </p>
              </motion.div>

              <div className="flex flex-wrap gap-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.a
                      key={item.label}
                      variants={fadeInLeft}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-gym-border-light bg-gym-surface px-4 py-2.5 text-sm text-gym-text-secondary transition-colors hover:border-gym-gold/30 hover:text-gym-gold"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {/* Right — Contact Form */}
            <motion.div
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gym-text-primary">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-gym-border bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary placeholder-gym-text-muted transition-colors focus:border-gym-gold focus:outline-none focus:ring-1 focus:ring-gym-gold"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gym-text-primary">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-gym-border bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary placeholder-gym-text-muted transition-colors focus:border-gym-gold focus:outline-none focus:ring-1 focus:ring-gym-gold"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-gym-text-primary">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-lg border border-gym-border bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary placeholder-gym-text-muted transition-colors focus:border-gym-gold focus:outline-none focus:ring-1 focus:ring-gym-gold"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gym-text-primary">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full resize-none rounded-lg border border-gym-border bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary placeholder-gym-text-muted transition-colors focus:border-gym-gold focus:outline-none focus:ring-1 focus:ring-gym-gold"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gym-gold px-5 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-gym-gold-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message <SendHorizontal className="h-4 w-4" />
                    </>
                  )}
                </button>

                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-500"
                  >
                    <Check className="h-4 w-4 shrink-0" />
                    Message sent! We'll get back to you soon.
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500"
                  >
                    <CircleAlert className="h-4 w-4 shrink-0" />
                    Something went wrong. Please try again later.
                  </motion.div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
