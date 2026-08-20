import { motion } from "framer-motion";
import { SEOHead } from "@/components/common/SEOHead";
import { Hero } from "@/components/home/Hero";
import { CoachIntro } from "@/components/home/CoachIntro";
import { TransformationSlider } from "@/components/home/TransformationSlider";
import { Statistics } from "@/components/home/Statistics";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { LatestVideos } from "@/components/home/LatestVideos";
import { FeaturedBlogs } from "@/components/home/FeaturedBlogs";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { Testimonials } from "@/components/home/Testimonials";
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
        title="Project GYM - Transform Your Body, Transform Your Life"
        description="Join thousands of members on their fitness transformation journey. Premium workout videos, nutrition guides, and a supportive community."
      />

      <Hero />
      <CoachIntro />
      <TransformationSlider />
      <Statistics />
      <BeforeAfter />
      <LatestVideos />
      <FeaturedBlogs />
      <GalleryPreview />
      <Testimonials />
      <CTA />
      <FAQ />
      <Newsletter />
    </motion.div>
  );
}