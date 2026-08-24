import { motion } from "framer-motion";
import { SEOHead } from "@/components/common/SEOHead";
import { Hero } from "@/components/home/Hero";
import { CoachIntro } from "@/components/home/CoachIntro";
import { TransformationSlider } from "@/components/home/TransformationSlider";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { LatestVideos } from "@/components/home/LatestVideos";
import { FeaturedBlogs } from "@/components/home/FeaturedBlogs";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { CTA } from "@/components/home/CTA";
import { FAQ } from "@/components/home/FAQ";
import { Newsletter } from "@/components/home/Newsletter";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SEOHead
        title="LH Fitness - Transform Your Body, Transform Your Life"
        description="Join thousands of members on their fitness transformation journey. Workout videos, nutrition guides, and a supportive community."
      />

      <Hero />
      <CoachIntro />
      <TransformationSlider />
      <BeforeAfter />
      <LatestVideos />
      <FeaturedBlogs />
      <GalleryPreview />
      <CTA />
      <FAQ />
      <Newsletter />
    </motion.div>
  );
}