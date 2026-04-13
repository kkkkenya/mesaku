import { Wrench } from "lucide-react";
import about1 from "@/assets/about-1.jpg";
import about2 from "@/assets/about-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import { useInView } from "@/hooks/useInView";

const AboutSection = () => {
  const { ref, inView } = useInView();

  return (
    <section id="about" className="py-20 bg-card" ref={ref}>
      <div className="container mx-auto px-6">
        <h2 className={`font-heading text-3xl md:text-4xl font-bold text-navy mb-12 ${inView ? "animate-fade-in-up" : "opacity-0"}`}>
          About Us
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className={`flex flex-col items-center md:items-start gap-8 ${inView ? "animate-slide-in-left" : "opacity-0"}`}>
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  <path id="circlePath" d="M100,100 m-70,0 a70,70 0 1,1 140,0 a70,70 0 1,1 -140,0" />
                </defs>
                <circle cx="100" cy="100" r="85" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
                <circle cx="100" cy="100" r="65" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
                <text className="text-[11px] font-body uppercase tracking-[3px] fill-navy">
                  <textPath href="#circlePath" startOffset="5%">
                    KENYATTA UNIVERSITY MESA • EST 2022 •
                  </textPath>
                </text>
              </svg>
              <Wrench className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 text-navy" />
            </div>

            <blockquote className="font-heading italic text-navy text-lg leading-relaxed max-w-sm">
              "The engineer has been, and is, a maker of history. Innovation begins with the courage to build."
            </blockquote>
          </div>

          <div className={`${inView ? "animate-slide-in-right" : "opacity-0"}`}>
            <h3 className="font-heading text-2xl font-bold text-navy mb-4">Who we are</h3>
            <p className="text-muted-foreground leading-relaxed mb-8">
              The Mechanical Engineering Student Association (MESA) is a vibrant community at Kenyatta University dedicated to empowering mechanical engineering students through hands-on projects, industry mentorship, and academic excellence. Founded in 2022, MESA bridges the gap between classroom theory and real-world application, fostering innovation, teamwork, and professional growth among our members.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <img src={about2} alt="Engineering lecture" className="rounded-lg w-full h-40 object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              <img src={about1} alt="Students in workshop" className="rounded-lg w-full h-40 object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              <img src={gallery3} alt="Lecture audience" className="rounded-lg w-full h-40 object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
