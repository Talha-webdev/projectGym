import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, Zap } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { Button } from "@/components/ui/Button";

export default function MembershipCancel() {
  return (
    <>
      <SEOHead title="Payment Cancelled" canonical="/membership/cancel" />
      <div className="section-padding flex min-h-[60vh] items-center justify-center">
      <div className="content-max-width px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gym-error/10">
            <XCircle className="h-10 w-10 text-gym-error" />
          </div>

          <h1 className="font-heading text-2xl font-bold text-gym-text-primary">
            Checkout Canceled
          </h1>
          <p className="mt-3 text-gym-text-secondary">
            No worries — your membership hasn't been charged. When you're ready
            to unlock full access, just click below.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Link to="/pricing">
              <Button>
                <Zap className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-1 text-sm text-gym-text-muted transition-colors hover:text-gym-gold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
