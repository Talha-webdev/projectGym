import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { Button } from "@/components/ui/Button";

export default function CheckEmail() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";

  return (
    <>
      <SEOHead title="Check Your Email" description="Verification email sent." canonical="/check-email" />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-gym-border-light bg-gym-surface p-8 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gym-success/10">
                <CheckCircle className="h-8 w-8 text-gym-success" />
              </div>
              <h1 className="font-heading text-3xl font-bold text-gym-gold">Check Your Email</h1>
              <p className="mt-3 text-sm text-gym-text-secondary">
                We've sent a verification link to{" "}
                <strong className="text-gym-text-primary">{email}</strong>.
              </p>
              <p className="mt-2 text-sm text-gym-text-secondary">
                Click the link in the email to complete your registration.
              </p>
              <p className="mt-1 text-xs text-gym-text-muted">The link expires in 24 hours.</p>

              <div className="mt-8 space-y-3">
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4" /> Go to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
