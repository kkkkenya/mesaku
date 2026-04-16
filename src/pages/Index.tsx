import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsStrip from "@/components/StatsStrip";
import AboutSection from "@/components/AboutSection";
import EventsSection from "@/components/EventsSection";
import GallerySection from "@/components/GallerySection";
import MerchandiseSection from "@/components/MerchandiseSection";
import NewsletterSection from "@/components/NewsletterSection";
import ExecutiveBoardSection from "@/components/ExecutiveBoardSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <StatsStrip />
        <AboutSection />
        <EventsSection />
        <GallerySection />
        <MerchandiseSection />
        <NewsletterSection />
        <ExecutiveBoardSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
