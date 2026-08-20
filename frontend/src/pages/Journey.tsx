import { motion } from "framer-motion";
import { Check, Target, Heart, ArrowRight } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, sectionVariants } from "@/utils/animations";
import { Link } from "react-router-dom";

const timeline = [
  {
    year: "2019",
    title: "The Turning Point",
    description:
      "At over 300 pounds, I made the decision that changed everything. No more excuses, no more tomorrows. This was the day I chose to fight for my life.",
    image: null,
  },
  {
    year: "2020",
    title: "First 50 lbs — The Breakthrough",
    description:
      "The first year was the hardest. Learning to cook real food, showing up to workouts when every fiber of my being wanted to quit. But the scale didn't lie — 50 pounds down and a new world of possibility opened up.",
    image: null,
  },
  {
    year: "2021",
    title: "100 lbs — Finding My Stride",
    description:
      "Halfway to my goal, something shifted. The workouts got easier, the cravings faded, and I started recognizing the person in the mirror. More importantly, I started helping others who were where I used to be.",
    image: null,
  },
  {
    year: "2022",
    title: "150+ lbs — The Transformation",
    description:
      "I hit my goal and kept going. Lost over 150 pounds and gained a new purpose. Project GYM was born — not as a business, but as a mission to give everyone the roadmap I wish I'd had.",
    image: null,
  },
  {
    year: "2023",
    title: "Building the Community",
    description:
      "Hundreds of members joined the journey. I logged thousands of coaching hours, refined every program based on real results, and built the platform that would scale this mission to the world.",
    image: null,
  },
  {
    year: "2024",
    title: "10,000+ Hours and Growing",
    description:
      "Today, Project GYM is a global community. Thousands of lives changed, millions of pounds lost collectively, and we're just getting started. The journey continues.",
    image: null,
  },
];

const achievements = [
  { value: "150+", label: "Pounds Lost" },
  { value: "10K+", label: "Coaching Hours" },
  { value: "5+", label: "Years of Experience" },
  { value: "50K+", label: "Community Members" },
];

const results = [
  "Lost over 150 pounds naturally",
  "Built sustainable eating habits",
  "Developed consistent workout routine",
  "Gained confidence and mental clarity",
  "Inspired thousands to transform",
];

export default function Journey() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SEOHead
        title="My Journey - Project GYM"
        description="Follow Coach's complete transformation journey from 300+ lbs to fitness coach. A timeline of discipline, consistency, and triumph."
        canonical="/journey"
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
              The Journey
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              className="mt-6 font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight text-gym-text-primary"
            >
              Every Transformation{" "}
              <span className="text-gym-gold">Has a Story</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gym-text-secondary"
            >
              This is mine. A raw, unfiltered look at the journey from 300+ pounds to becoming a
              coach who has helped thousands transform their own lives. No shortcuts. No secrets.
              Just the truth about what it really takes.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Transformation Story */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="section-padding bg-gym-surface/50"
      >
        <div className="content-max-width px-4">
          <div className="mx-auto max-w-[900px] space-y-8">
            <motion.div variants={fadeInUp} className="text-center">
              <span className="inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
                The Beginning
              </span>
              <h2 className="mt-4 font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
                Where It{" "}
                <span className="text-gym-gold">All Started</span>
              </h2>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-5">
              <p className="text-gym-text-secondary leading-relaxed">
                I remember the exact moment I decided to change. I was standing in front of the
                mirror, winded from tying my shoes, and I didn't recognize the person staring back
                at me. I was 300+ pounds, prediabetic, and convinced I'd never be able to fix it.
              </p>
              <p className="text-gym-text-secondary leading-relaxed">
                But here's the thing about rock bottom — it gives you clarity. I realized that the
                only way out was through. No magic pill, no secret workout, no diet fad was going to
                save me. It had to be me. Day after day, choice after choice.
              </p>
              <p className="text-gym-text-secondary leading-relaxed">
                So I started. One workout. One healthy meal. One day at a time. I failed plenty of
                times, but I never quit. And slowly, almost imperceptibly at first, things started
                to change. The weight came off. The energy came back. And somewhere along the way,
                I found my purpose.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {achievements.map((a) => (
                <div
                  key={a.label}
                  className="rounded-xl border border-gym-border-light bg-gym-surface p-4 text-center"
                >
                  <p className="font-heading text-xl font-bold text-gym-gold sm:text-2xl">{a.value}</p>
                  <p className="mt-1 text-xs text-gym-text-muted">{a.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Timeline — Alternating Left/Right */}
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
              Timeline
            </span>
            <h2 className="mt-4 font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
              The{" "}
              <span className="text-gym-gold">Road</span>{" "}
              to Transformation
            </h2>
          </motion.div>

          <div className="relative mx-auto max-w-[900px]">
            {/* Center line — hidden on mobile */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gym-border-light md:block" />

            {timeline.map((item, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={item.year}
                  variants={isLeft ? fadeInLeft : fadeInRight}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  className={`relative flex items-start gap-6 pb-16 last:pb-0 md:gap-0 ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content card */}
                  <div
                    className={`flex-1 rounded-xl border border-gym-border-light bg-gym-surface p-6 transition-colors hover:border-gym-gold/30 ${
                      isLeft ? "md:mr-8 md:text-right" : "md:ml-8"
                    }`}
                  >
                    <span className="text-xs font-medium text-gym-gold">{item.year}</span>
                    <h3 className="mt-1 font-heading text-xl font-semibold text-gym-text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-gym-text-secondary">
                      {item.description}
                    </p>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-4 top-2 z-10 hidden h-4 w-4 rounded-full border-2 border-gym-gold bg-gym-gold-muted md:left-1/2 md:-translate-x-1/2 md:block" />

                  {/* Mobile dot */}
                  <div className="mt-2 flex h-4 w-4 shrink-0 rounded-full border-2 border-gym-gold bg-gym-gold-muted md:hidden" />

                  {/* Spacer */}
                  <div className="hidden flex-1 md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
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
                Achievements
              </span>
              <h2 className="mt-4 font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
                What the Journey{" "}
                <span className="text-gym-gold">Proved</span>
              </h2>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid gap-6 sm:grid-cols-2">
              {results.map((result, i) => (
                <motion.div
                  key={result}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 rounded-xl border border-gym-border-light bg-gym-surface p-4"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gym-gold-muted">
                    <Check className="h-3.5 w-3.5 text-gym-gold" />
                  </span>
                  <span className="text-sm text-gym-text-secondary">{result}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Mission & Vision */}
      <section className="section-padding">
        <div className="content-max-width px-4">
          <div className="mx-auto max-w-[900px]">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <span className="inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
                Purpose
              </span>
              <h2 className="mt-4 font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
                Mission &{" "}
                <span className="text-gym-gold">Vision</span>
              </h2>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-8 md:grid-cols-2"
            >
              <motion.div
                variants={fadeInLeft}
                className="rounded-xl border border-gym-border-light bg-gym-surface p-8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gym-gold-muted text-gym-gold">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-gym-text-primary">Our Mission</h3>
                <p className="mt-3 text-sm leading-relaxed text-gym-text-secondary">
                  To provide every person with the science-backed knowledge, proven tools, and
                  unwavering support they need to transform their health and build a life they're
                  proud of. No gimmicks, no shortcuts — just real, sustainable change.
                </p>
              </motion.div>

              <motion.div
                variants={fadeInRight}
                className="rounded-xl border border-gym-border-light bg-gym-surface p-8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gym-gold-muted text-gym-gold">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-gym-text-primary">Our Vision</h3>
                <p className="mt-3 text-sm leading-relaxed text-gym-text-secondary">
                  A world where health transformation is accessible to everyone, regardless of
                  where they start. We're building a global movement of people who refuse to accept
                  mediocrity and who believe that their best chapter is still ahead.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

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
                Your Story{" "}
                <span className="text-gym-gold">Starts Today</span>
              </h2>
              <p className="mt-4 text-gym-text-secondary leading-relaxed">
                I've shared my journey. Now it's your turn. Every great transformation starts with a
                single decision. Make yours today.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gym-gold px-5 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-gym-gold-hover active:scale-[0.98]"
                >
                  Begin Your Journey <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-gym-text-secondary transition-all duration-200 hover:text-gym-gold hover:bg-gym-gold-muted active:scale-[0.98]"
                >
                  Learn More About Me
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
