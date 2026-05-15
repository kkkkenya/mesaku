import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsStrip from "@/components/StatsStrip";
import AboutSection from "@/components/AboutSection";
import WhyJoinSection from "@/components/WhyJoinSection";
import AnnouncementsSection from "@/components/AnnouncementsSection";
import EventsSection from "@/components/EventsSection";
import GallerySection from "@/components/GallerySection";
import MerchandiseSection from "@/components/MerchandiseSection";
import SponsorsSection from "@/components/SponsorsSection";
import NewsletterSection from "@/components/NewsletterSection";
import ExecutiveBoardSection from "@/components/ExecutiveBoardSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>MESA KU | Mechanical Engineering Association</title>
        <meta name="description" content="MESA KU is the official Mechanical Engineering Students Association at Kenyatta University. Join us for projects, workshops, industrial visits and competitions." />
        <link rel="canonical" href="https://mesaku.lovable.app/" />
        <meta property="og:title" content="MESA KU | Mechanical Engineering Association" />
        <meta property="og:url" content="https://mesaku.lovable.app/" />
      </Helmet>
      <Navbar />
      <main>
        <HeroSection />
        <StatsStrip />
        <AboutSection />
        <WhyJoinSection />
        <AnnouncementsSection />
        <EventsSection />
        <GallerySection />
        <MerchandiseSection />
        <SponsorsSection />
        <NewsletterSection />
        <ExecutiveBoardSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
