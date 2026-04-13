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
            <div className="relative w-56 h-56">
              {/* Rotating gear with text */}
              <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_20s_linear_infinite]">
                <defs>
                  <path id="gearTextPath" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                </defs>
                {/* Gear shape */}
                <path
                  d="M100 12 L108 28 L120 18 L122 36 L136 30 L132 48 L148 46 L138 62 L152 64 L138 76 L150 82 L134 90 L142 100 L134 110 L150 118 L138 124 L152 136 L138 138 L148 154 L132 152 L136 170 L122 164 L120 182 L108 172 L100 188 L92 172 L80 182 L78 164 L64 170 L68 152 L52 154 L62 138 L48 136 L62 124 L50 118 L66 110 L58 100 L66 90 L50 82 L62 76 L48 64 L62 62 L52 46 L68 48 L64 30 L78 36 L80 18 L92 28 Z"
                  fill="none"
                  stroke="hsl(var(--navy))"
                  strokeWidth="2"
                  className="fill-navy/5"
                />
                {/* Inner circle */}
                <circle cx="100" cy="100" r="52" fill="none" stroke="hsl(var(--navy))" strokeWidth="1.5" className="fill-card" />
                {/* Text along outer path */}
                <text className="text-[10.5px] font-body uppercase tracking-[4px] fill-navy font-semibold">
                  <textPath href="#gearTextPath" startOffset="0%">
                    KENYATTA UNIVERSITY MESA • EST 2022 • KU •
                  </textPath>
                </text>
              </svg>
              {/* Static center icon */}
              <Wrench className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-navy" />
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
