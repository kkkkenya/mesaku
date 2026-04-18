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
import StayInTheLoopSection from "@/components/StayInTheLoopSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
        <StayInTheLoopSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
