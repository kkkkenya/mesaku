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
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                width="220"
                height="220"
                style={{ display: 'block', margin: '0 auto' }}
              >
                <style>{`@keyframes spin { from { transform: rotate(0deg); transform-origin: 50px 50px; } to { transform: rotate(360deg); transform-origin: 50px 50px; } }
                .gear { animation: spin 6s linear infinite; transform-origin: 50px 50px; }`}</style>

                <g className="gear">
                  <circle cx="50" cy="50" r="34" fill="none" stroke="#1a2f5a" strokeWidth="4" />
                  <circle cx="50" cy="50" r="12" fill="#1a2f5a" />
                  <circle cx="50" cy="50" r="6" fill="white" />
                  {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180;
                    const x1 = 50 + 34 * Math.cos(rad);
                    const y1 = 50 + 34 * Math.sin(rad);
                    const x2 = 50 + 44 * Math.cos(rad);
                    const y2 = 50 + 44 * Math.sin(rad);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a2f5a" strokeWidth="6" strokeLinecap="round" />;
                  })}
                </g>

                <text x="50" y="92" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1a2f5a" fontFamily="serif">MESA</text>
              </svg>
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
