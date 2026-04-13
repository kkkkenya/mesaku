import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ExecutiveBoardSection from "@/components/ExecutiveBoardSection";
import EventsSection from "@/components/EventsSection";
import GallerySection from "@/components/GallerySection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <AboutSection />
        <EventsSection />
        <GallerySection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
