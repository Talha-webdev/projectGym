import { motion } from "framer-motion";
import { SEOHead } from "@/components/common/SEOHead";

export default function Profile() {
  return (
    <>
      <SEOHead
        title="Profile"
        description="Manage your Project GYM profile, update personal information, and change your password."
        canonical="/profile"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="section-padding"
      >
        <div className="content-max-width">
          <h1 className="font-heading text-3xl font-bold text-gym-gold">Profile</h1>
          <p className="mt-4 text-gym-text-secondary">This page is under construction.</p>
        </div>
      </motion.div>
    </>
  );
}
