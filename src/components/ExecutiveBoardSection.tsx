import { useRef, useCallback, useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

interface Executive {
  role: string;
  name: string;
  title: string;
  descriptor: string;
}

const executives: Executive[] = [
  {
    role: "Chairman",
    name: "John Mwangi",
    title: "Chief Executive Officer",
    descriptor: "Visionary leader driving MESA's strategic direction",
  },
  {
    role: "Vice Chairperson",
    name: "Sarah Otieno",
    title: "Deputy Chief Executive",
    descriptor: "Championing academic excellence and member engagement",
  },
  {
    role: "General Secretary",
    name: "David Kimani",
    title: "Chief Operations Officer",
    descriptor: "Orchestrating seamless organizational coordination",
  },
  {
    role: "Treasurer",
    name: "Grace Wanjiku",
    title: "Chief Financial Officer",
    descriptor: "Ensuring fiscal integrity and resource optimization",
  },
];

function ExecutiveCard({ exec, index, inView }: { exec: Executive; index: number; inView: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number>(0);
  const targetRef = useRef({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  const currentRef = useRef({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    targetRef.current = {
      rotateX: (0.5 - y) * 8,
      rotateY: (x - 0.5) * 8,
      glowX: x * 100,
      glowY: y * 100,
    };
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    targetRef.current = { rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 };
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const animate = () => {
      const c = currentRef.current;
      const t = targetRef.current;
      c.rotateX = lerp(c.rotateX, t.rotateX, 0.08);
      c.rotateY = lerp(c.rotateY, t.rotateY, 0.08);
      c.glowX = lerp(c.glowX, t.glowX, 0.08);
      c.glowY = lerp(c.glowY, t.glowY, 0.08);

      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(800px) rotateX(${c.rotateX}deg) rotateY(${c.rotateY}deg)`;
      }
      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(circle at ${c.glowX}% ${c.glowY}%, rgba(56,189,248,0.15) 0%, transparent 60%)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const delays = ["animation-delay-100", "animation-delay-200", "animation-delay-300", "animation-delay-400"];

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-xl border transition-all duration-500 ease-out cursor-pointer will-change-transform
        ${isHovered
          ? "border-[hsl(195,80%,40%)] shadow-[0_0_30px_-5px_rgba(56,189,248,0.25),0_20px_50px_-15px_rgba(0,0,0,0.5)]"
          : "border-[hsl(220,10%,20%)] shadow-[0_4px_20px_-5px_rgba(0,0,0,0.3)]"
        }
        ${inView ? `animate-fade-in-up ${delays[index]}` : "opacity-0"}
      `}
      style={{ transformStyle: "preserve-3d", background: "hsl(220, 15%, 10%)" }}
    >
      {/* Glow follower */}
      <div ref={glowRef} className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Blueprint grid accent */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-700 group-hover:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56,189,248,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 p-6 md:p-8">
        {/* Role label */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-[hsl(195,80%,40%)] to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-80" />
          <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(195,70%,55%)] transition-colors duration-300">
            {exec.role}
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-[hsl(195,80%,40%)] to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-80" />
        </div>

        {/* Name */}
        <h3 className="font-heading text-xl md:text-2xl font-bold tracking-wide transition-all duration-500 group-hover:translate-y-[-2px]"
          style={{ color: "hsl(210, 20%, 92%)" }}
        >
          {exec.name}
        </h3>

        {/* Title */}
        <p className="mt-2 font-body text-[11px] font-medium uppercase tracking-[0.15em] text-[hsl(220,10%,50%)] transition-colors duration-500 group-hover:text-[hsl(220,10%,65%)]">
          {exec.title}
        </p>

        {/* Hidden hover detail */}
        <div className="mt-4 overflow-hidden transition-all duration-500 ease-out"
          style={{ maxHeight: isHovered ? "60px" : "0px", opacity: isHovered ? 1 : 0 }}
        >
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[hsl(195,80%,40%)] to-transparent opacity-30 mb-3" />
          <p className="font-body text-xs text-[hsl(195,60%,60%)] leading-relaxed">
            {exec.descriptor}
          </p>
        </div>

        {/* View Profile link */}
        <div className="mt-3 overflow-hidden transition-all duration-500 ease-out"
          style={{ maxHeight: isHovered ? "30px" : "0px", opacity: isHovered ? 1 : 0 }}
        >
          <span className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(195,80%,45%)] transition-colors duration-300 hover:text-[hsl(195,80%,60%)]">
            View Profile →
          </span>
        </div>
      </div>

      {/* Bottom precision line */}
      <div className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-[hsl(195,80%,40%)] to-transparent transition-all duration-700 group-hover:w-3/4" />
    </div>
  );
}

export default function ExecutiveBoardSection() {
  const { ref, inView } = useInView();

  return (
    <section id="executive-board" ref={ref} className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "linear-gradient(180deg, hsl(220,15%,8%) 0%, hsl(220,18%,11%) 100%)" }}
    >
      {/* Subtle background lines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(90deg, hsl(195,80%,40%) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className={`mb-16 text-center ${inView ? "animate-fade-in-up" : "opacity-0"}`}>
          <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(195,70%,50%)] mb-3">
            Leadership
          </p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight" style={{ color: "hsl(210,20%,92%)" }}>
            Executive Board
          </h2>
          <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[hsl(195,80%,40%)] to-transparent" />
        </div>

        {/* Cards grid */}
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {executives.map((exec, i) => (
            <ExecutiveCard key={exec.role} exec={exec} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
