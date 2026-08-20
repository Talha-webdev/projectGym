import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Dumbbell, Shield, Zap, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { useAuth } from "@/store/AuthContext";
import { useMembership, useCreateCheckout } from "@/hooks/useMembership";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fadeInUp, staggerContainer } from "@/utils/animations";

const features = [
  "Full access to all premium workout videos",
  "Exclusive premium blog articles",
  "New content added regularly",
  "Member community access",
  "Personal progress tracking",
  "Cancel anytime",
];

const faqs = [
  {
    q: "How does the 3-month membership work?",
    a: "Purchase once and get full access to all premium content for 90 days. No recurring billing — your membership automatically ends after the period.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription at any time. Access continues until the end of your billing period.",
  },
  {
    q: "What happens when my membership expires?",
    a: "Premium content becomes locked. You can purchase a new membership to regain access.",
  },
  {
    q: "Is there a free trial?",
    a: "We don't offer a free trial, but you can browse all public content (videos, blogs, gallery) before committing.",
  },
  {
    q: "How do I pay?",
    a: "We use Stripe for secure payment processing. All major credit and debit cards are accepted.",
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const { data: membership } = useMembership();
  const createCheckout = useCreateCheckout();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const hasActiveMembership = membership?.is_active ?? false;
  const isMember = hasActiveMembership;

  const handleCheckout = async () => {
    if (!isAuthenticated) return;
    setCheckoutError(null);
    try {
      const { checkout_url } = await createCheckout.mutateAsync();
      window.location.href = checkout_url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setCheckoutError(message);
    }
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "3-Month Premium Membership",
    description: "Full access to all premium workout videos, nutrition blogs, and exclusive content.",
    offers: {
      "@type": "Offer",
      price: "29.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://projectgym.com/pricing",
    },
  };

  return (
    <>
      <SEOHead
        title="Pricing"
        description="Unlock full access to all premium content with a 3-month membership. Start your transformation today."
        canonical="/pricing"
        ogType="product"
        jsonLd={productSchema}
      />
      <div>
      <section className="relative pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-gym-bg via-gym-bg to-gym-surface/50" />
        <div className="content-max-width relative z-10 px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
              Membership
            </span>
            <h1 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-gym-text-primary">
              One Plan. Full Access.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-gym-text-secondary">
              Unlock every premium workout, article, and exclusive content for one low price.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="content-max-width px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-lg"
          >
            <motion.div
              variants={fadeInUp}
              className="relative overflow-hidden rounded-2xl border border-gym-gold/20 bg-gradient-to-b from-gym-surface to-gym-elevated p-8 shadow-2xl"
            >
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gym-gold/5 blur-3xl" />

              {isMember && (
                <div className="mb-4">
                  <Badge variant="premium" className="gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Active Member
                  </Badge>
                </div>
              )}

              <div className="relative">
                <h2 className="font-heading text-xl font-bold text-gym-text-primary">
                  3-Month Premium Access
                </h2>
                <p className="mt-1 text-sm text-gym-text-secondary">
                  Everything you need to transform
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-heading text-5xl font-bold text-gym-text-primary">$49</span>
                  <span className="text-sm text-gym-text-muted">/3 months</span>
                </div>

                <ul className="mt-6 space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gym-gold/10">
                        <Check className="h-3.5 w-3.5 text-gym-gold" />
                      </div>
                      <span className="text-sm text-gym-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 space-y-3">
                  {isMember ? (
                    <div className="rounded-xl border border-gym-gold/20 bg-gym-gold-muted p-4 text-center">
                      <p className="text-sm font-medium text-gym-gold">You are a member!</p>
                      <p className="mt-1 text-xs text-gym-text-secondary">
                        {membership?.days_remaining
                          ? `${membership.days_remaining} days remaining`
                          : "Enjoy unlimited access to all premium content."}
                      </p>
                      <Link to="/dashboard">
                        <Button variant="outline" size="sm" className="mt-3">
                          Go to Dashboard
                        </Button>
                      </Link>
                    </div>
                  ) : isAuthenticated ? (
                    <>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleCheckout}
                        isLoading={createCheckout.isPending}
                      >
                        <Zap className="mr-2 h-5 w-5" />
                        Get Started Now
                      </Button>
                      {checkoutError && (
                        <p className="text-center text-xs text-gym-error">{checkoutError}</p>
                      )}
                    </>
                  ) : (
                    <Link to="/register" className="block">
                      <Button className="w-full" size="lg">
                        <Dumbbell className="mr-2 h-5 w-5" />
                        Join Project GYM
                      </Button>
                    </Link>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gym-text-muted">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" />
                    Secure checkout
                  </span>
                  <span>Powered by Stripe</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto mt-16 max-w-2xl"
          >
            <motion.h2
              variants={fadeInUp}
              className="mb-8 text-center font-heading text-2xl font-bold text-gym-text-primary"
            >
              Frequently Asked Questions
            </motion.h2>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  className="rounded-xl border border-gym-border-light bg-gym-surface"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="pr-4 text-sm font-medium text-gym-text-primary">
                      {faq.q}
                    </span>
                    {openFaq === idx ? (
                      <ChevronUp className="h-4 w-4 flex-shrink-0 text-gym-gold" />
                    ) : (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-gym-text-muted" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="border-t border-gym-border-light px-5 py-4">
                      <p className="text-sm leading-relaxed text-gym-text-secondary">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  );
}
