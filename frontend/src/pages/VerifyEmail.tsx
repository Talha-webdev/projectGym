import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/services/authApi";

type VerificationState = "verifying" | "success" | "error" | "missing";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerificationState>(token ? "verifying" : "missing");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        if (!cancelled) setState("success");
      } catch {
        if (!cancelled) setState("error");
      }
    };
    verify();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <>
      <SEOHead title="Verify Email" robots="noindex" canonical="/verify-email" />
      <div className="section-padding flex min-h-[60vh] items-center justify-center">
        <div className="content-max-width px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-md text-center"
          >
            {state === "verifying" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gym-gold/10">
                  <Loader2 className="h-10 w-10 animate-spin text-gym-gold" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Verifying Email...</h1>
                <p className="mt-3 text-gym-text-secondary">Please wait while we verify your email address.</p>
              </motion.div>
            )}

            {state === "success" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gym-success/10"
                >
                  <CheckCircle className="h-10 w-10 text-gym-success" />
                </motion.div>
                <h1 className="font-heading text-3xl font-bold text-gym-text-primary">Email Verified!</h1>
                <p className="mt-3 text-gym-text-secondary">
                  Your email has been verified successfully. You now have full access to all features.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <Link to="/dashboard">
                    <Button>Go to Dashboard</Button>
                  </Link>
                  <Link to="/videos" className="text-sm text-gym-text-muted transition-colors hover:text-gym-gold">
                    Browse Videos
                  </Link>
                </div>
              </motion.div>
            )}

            {state === "error" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gym-error/10">
                  <AlertCircle className="h-10 w-10 text-gym-error" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Verification Failed</h1>
                <p className="mt-3 text-gym-text-secondary">
                  This verification link is invalid or has expired. Please request a new one.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <Link to="/dashboard">
                    <Button variant="outline">Go to Dashboard</Button>
                  </Link>
                </div>
              </motion.div>
            )}

            {state === "missing" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gym-gold/10">
                  <Mail className="h-10 w-10 text-gym-gold" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-gym-text-primary">No Verification Token</h1>
                <p className="mt-3 text-gym-text-secondary">
                  No verification token was provided. Please check your email for the verification link.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <Link to="/">
                    <Button>Go Home</Button>
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
