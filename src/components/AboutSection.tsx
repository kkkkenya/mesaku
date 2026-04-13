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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="240" height="240" style={{display:'block', margin:'0 auto'}}>
                <defs>
                  <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                  .gear-group { transform-origin: 100px 100px; animation: spin 8s linear infinite; }`}</style>
                  <path id="topArc" d="M 38,100 A 62,62 0 0,1 162,100" />
                  <path id="bottomArc" d="M 45,118 A 58,58 0 0,0 155,118" />
                </defs>

                <g className="gear-group">
                  {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
                    const rad = deg * Math.PI / 180;
                    const cx = 100 + 72 * Math.cos(rad);
                    const cy = 100 + 72 * Math.sin(rad);
                    return (
                      <rect key={i} x={cx - 7} y={cy - 7} width="14" height="14" fill="#1a2f5a" rx="2" transform={`rotate(${deg}, ${cx}, ${cy})`} />
                    );
                  })}
                  <circle cx="100" cy="100" r="62" fill="#1a2f5a" />
                  <circle cx="100" cy="100" r="28" fill="white" />
                  <circle cx="100" cy="100" r="48" fill="none" />
                </g>

                <text fill="white" fontSize="10" fontWeight="bold" fontFamily="serif" letterSpacing="2">
                  <textPath href="#topArc" startOffset="50%" textAnchor="middle">MESA · KU</textPath>
                </text>
                <text fill="white" fontSize="9" fontFamily="serif" letterSpacing="1.5">
                  <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">EST. 2022</textPath>
                </text>
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
