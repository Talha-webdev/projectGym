import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Crown, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { Button } from "@/components/ui/Button";
import { membershipApi } from "@/services/membershipApi";
import { useMembership } from "@/hooks/useMembership";

type VerificationState = "verifying" | "valid" | "invalid";

export default function MembershipSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verification, setVerification] = useState<VerificationState>("verifying");
  const { refetch } = useMembership();

  useEffect(() => {
    if (!sessionId) {
      setVerification("invalid");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const { data } = await membershipApi.verifySession(sessionId);
        if (cancelled) return;
        if (data.valid) {
          setVerification("valid");
          refetch();
        } else {
          setVerification("invalid");
        }
      } catch {
        if (!cancelled) setVerification("invalid");
      }
    };

    verify();
    return () => { cancelled = true; };
  }, [sessionId, refetch]);

  return (
    <>
      <SEOHead title="Membership Activated" robots="noindex" canonical="/membership/success" />
      <div className="section-padding flex min-h-[60vh] items-center justify-center">
      <div className="content-max-width px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-md text-center"
        >
          {verification === "verifying" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gym-gold/10">
                <Loader2 className="h-10 w-10 animate-spin text-gym-gold" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-gym-text-primary">
                Verifying Payment...
              </h1>
              <p className="mt-3 text-gym-text-secondary">
                Please wait while we confirm your payment.
              </p>
            </motion.div>
          )}

          {verification === "valid" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gym-success/10"
              >
                <CheckCircle className="h-10 w-10 text-gym-success" />
              </motion.div>

              <Crown className="mx-auto mb-4 h-10 w-10 text-gym-gold" />
              <h1 className="font-heading text-3xl font-bold text-gym-text-primary">
                Welcome to the Club!
              </h1>
              <p className="mt-3 text-gym-text-secondary">
                Your 3-month premium membership is now active. Enjoy full access to
                every workout, article, and exclusive content.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3">
                <Link to="/dashboard">
                  <Button>
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  to="/videos"
                  className="text-sm text-gym-text-muted transition-colors hover:text-gym-gold"
                >
                  Browse Premium Videos
                </Link>
              </div>
            </motion.div>
          )}

          {verification === "invalid" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gym-warning/10">
                <AlertCircle className="h-10 w-10 text-gym-warning" />
              </div>

              <h1 className="font-heading text-2xl font-bold text-gym-text-primary">
                Payment Pending
              </h1>
              <p className="mt-3 text-gym-text-secondary">
                Your payment is still being processed. It may take a few moments.
                If the issue persists, please contact support.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3">
                <Link to="/dashboard">
                  <Button variant="outline">Check Dashboard</Button>
                </Link>
                <Link
                  to="/pricing"
                  className="flex items-center gap-1 text-sm text-gym-gold hover:underline"
                >
                  Try Again
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
    </>
  );
}
