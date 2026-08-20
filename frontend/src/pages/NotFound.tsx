import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/common/SEOHead";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <SEOHead title="Page Not Found" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="section-padding flex min-h-[calc(100vh-8rem)] items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-heading text-8xl font-bold text-gym-gold">404</p>
          </motion.div>
          <h1 className="mt-4 font-heading text-2xl font-bold text-gym-text-primary">
            Page Not Found
          </h1>
          <p className="mt-2 text-gym-text-secondary">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/">
              <Button variant="primary" size="lg">
                Go Home
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
}
