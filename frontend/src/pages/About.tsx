import { motion } from "framer-motion";
import { Check, Award, Target, Users, Heart } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { fadeInUp, staggerContainer, sectionVariants } from "@/utils/animations";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const values = [
  {
    icon: Target,
    title: "Discipline Over Motivation",
    description: "Motivation fades, discipline lasts. We build systems that keep you going even on the hard days.",
  },
  {
    icon: Heart,
    title: "Health First",
    description: "Every decision is rooted in long-term health. No quick fixes, no crash diets — just sustainable change.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "You don't have to do this alone. Our community supports, challenges, and celebrates every win with you.",
  },
  {
    icon: Award,
    title: "Proven Results",
    description: "Methods backed by real transformations. What we teach is what actually works, tested and refined over years.",
  },
];

const results = [
  "Lost over 150 pounds naturally",
  "Built sustainable eating habits",
  "Developed consistent workout routine",
  "Gained confidence and mental clarity",
  "Inspired thousands to transform",
];

export default function About() {
  const { settings } = useSiteSettings();
  const storyImage = settings.about_story_image_url;
  const beforeImage = settings.about_before_image_url;
  const afterImage = settings.about_after_image_url;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SEOHead
        title="About - LH Fitness"
        description="Learn about Coach's personal fitness journey and the story behind LH Fitness. From 300+ lbs to transformation coach."
        canonical="/about"
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
              About Me
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              className="mt-6 font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight text-gym-text-primary"
            >
              From{" "}
              <span className="text-gym-gold">300+ lbs</span>{" "}
              to Transforming Lives
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gym-text-secondary"
            >
              This isn't just a fitness brand — it's my life's work. Every program, every video,
              every word of advice comes from real experience. I've walked the path, and I'm here
              to guide you through it.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* The Story */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="section-padding bg-gym-surface/50"
      >
        <div className="content-max-width px-4">
          <div className="mx-auto max-w-[900px] space-y-8">
            <motion.div
              variants={fadeInUp}
              className="text-center"
            >
              <span className="inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
                The Story
              </span>
              <h2 className="mt-4 font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
                How It All{" "}
                <span className="text-gym-gold">Began</span>
              </h2>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-5">
              {storyImage && (
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={storyImage}
                    alt="Our story"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <p className="text-gym-text-secondary leading-relaxed">
                I spent years trapped in a body that didn't feel like my own. At my heaviest, I was
                over 300 pounds, struggling with simple daily activities, and convinced that change
                was impossible. I had tried every diet, every program, every quick fix — and
                nothing stuck.
              </p>
              <p className="text-gym-text-secondary leading-relaxed">
                The turning point came when I realized that transformation isn't about finding the
                perfect plan — it's about building the right mindset. I stopped looking for shortcuts
                and started focusing on consistency. Small, daily habits compounded into massive
                change over time.
              </p>
              <p className="text-gym-text-secondary leading-relaxed">
                Over the next several years, I lost more than 150 pounds. But more importantly, I
                gained a new understanding of health, discipline, and what the human body is capable
                of when given the right tools and support.
              </p>
              <p className="text-gym-text-secondary leading-relaxed">
                That's why I created LH Fitness. Not as a business, but as a mission. I want to
                give everyone the roadmap that I wish I'd had — the science-backed methods, the
                real-world strategies, and the unshakable support system that makes transformation
                not just possible, but inevitable.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Before & After */}
      <section className="section-padding">
        <div className="content-max-width px-4">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <span className="inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
              Transformation
            </span>
            <h2 className="mt-4 font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
              Before &{" "}
              <span className="text-gym-gold">After</span>
            </h2>
          </motion.div>

          <div className="mx-auto grid max-w-[900px] items-center gap-12 md:grid-cols-2">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="font-heading text-2xl font-bold text-gym-text-primary">
                The Transformation Story
              </h3>
              <p className="text-gym-text-secondary leading-relaxed">
                This journey wasn't just about losing weight — it was about gaining a new lease on
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
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-b from-gym-elevated to-gym-surface">
                    {beforeImage ? (
                      <img
                        src={beforeImage}
                        alt="Before"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-xs text-gym-text-muted">Before</span>
                      </div>
                    )}
                  </div>
                  <p className="text-center text-xs font-medium text-gym-text-muted">Before</p>
                </div>
                <div className="space-y-2">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-b from-gym-gold/20 to-gym-gold/5">
                    {afterImage ? (
                      <img
                        src={afterImage}
                        alt="After"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-xs text-gym-gold">After</span>
                      </div>
                    )}
                  </div>
                  <p className="text-center text-xs font-medium text-gym-gold">After</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="section-padding bg-gym-surface/50"
      >
        <div className="content-max-width px-4">
          <div className="mx-auto max-w-[900px]">
            <motion.div variants={fadeInUp} className="mb-12 text-center">
              <span className="inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
                Philosophy
              </span>
              <h2 className="mt-4 font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
                Mission &{" "}
                <span className="text-gym-gold">Values</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-gym-text-secondary leading-relaxed">
                LH Fitness was built on a simple belief: everyone deserves the tools and support
                to transform their life. Here's what guides everything we do.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2"
            >
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    variants={fadeInUp}
                    className="group rounded-xl border border-gym-border-light bg-gym-surface p-6 transition-colors hover:border-gym-gold/30"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gym-gold-muted text-gym-gold transition-colors group-hover:bg-gym-gold/20">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 font-heading text-lg font-semibold text-gym-text-primary">
                      {value.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gym-text-secondary">
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Vision */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="section-padding"
      >
        <div className="content-max-width px-4">
          <div className="mx-auto max-w-[900px] text-center">
            <motion.div variants={fadeInUp}>
              <span className="inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
                Vision
              </span>
              <h2 className="mt-4 font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
                Where We're{" "}
                <span className="text-gym-gold">Heading</span>
              </h2>
            </motion.div>
            <motion.div variants={fadeInUp} className="mt-8 space-y-6">
              <p className="text-gym-text-secondary leading-relaxed">
                Our vision is a world where everyone has access to the knowledge, tools, and support
                they need to take control of their health. We're building a global community of
                people who refuse to settle — who believe that their best chapter is still ahead.
              </p>
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-gym-border-light bg-gym-surface/50 p-6">
                  <p className="font-heading text-2xl font-bold text-gym-gold">100K+</p>
                  <p className="mt-1 text-sm text-gym-text-muted">Members by 2026</p>
                </div>
                <div className="rounded-xl border border-gym-border-light bg-gym-surface/50 p-6">
                  <p className="font-heading text-2xl font-bold text-gym-gold">50+</p>
                  <p className="mt-1 text-sm text-gym-text-muted">Countries Reached</p>
                </div>
                <div className="rounded-xl border border-gym-border-light bg-gym-surface/50 p-6">
                  <p className="font-heading text-2xl font-bold text-gym-gold">1M+</p>
                  <p className="mt-1 text-sm text-gym-text-muted">Lives Transformed</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="section-padding bg-gym-surface/50"
      >
        <div className="content-max-width px-4">
          <div className="mx-auto max-w-[600px] text-center">
            <motion.div variants={fadeInUp}>
              <h2 className="font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
                Ready to Start Your{" "}
                <span className="text-gym-gold">Transformation?</span>
              </h2>
              <p className="mt-4 text-gym-text-secondary leading-relaxed">
                Every journey begins with a single step. Join LH Fitness today and get access to
                workouts, nutrition guides, and a community that will push you to be your best.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gym-gold px-5 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-gym-gold-hover active:scale-[0.98]"
                >
                  Join Now
                </Link>
                <Link
                  to="/videos"
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-gym-text-secondary transition-all duration-200 hover:text-gym-gold hover:bg-gym-gold-muted active:scale-[0.98]"
                >
                  Explore Free Content
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
