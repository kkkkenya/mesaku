import { useState } from "react";
import chairmanImg from "@/assets/exec-chairman.jpg";
import viceChairImg from "@/assets/exec-vice-chair.jpg";
import secretaryImg from "@/assets/exec-secretary.jpg";
import treasurerImg from "@/assets/exec-treasurer.jpg";

interface Executive {
  name: string;
  role: string;
  image: string;
}

const executives: Executive[] = [
  { name: "Kiprop Sang", role: "Chairman", image: chairmanImg },
  { name: "Amani Mwangi", role: "Vice Chairperson", image: viceChairImg },
  { name: "David Kimani", role: "General Secretary", image: secretaryImg },
  { name: "Grace Wanjiku", role: "Treasurer", image: treasurerImg },
];

export default function ExecutiveBoardSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      id="executive-board"
      className="py-16 md:py-24"
      style={{ background: "hsl(0, 0%, 96%)" }}
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <p className="text-xs font-medium uppercase tracking-[0.2em] mb-2"
          style={{ color: "hsl(0, 0%, 50%)" }}
        >
          04 // Leadership
        </p>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
          style={{ color: "hsl(0, 0%, 7%)" }}
        >
          Executive Board
        </h2>
        <div className="h-px w-full mb-10" style={{ background: "hsl(0, 0%, 82%)" }} />

        {/* Cards row – desktop */}
        <div className="hidden md:flex gap-2" style={{ height: "520px" }}>
          {executives.map((exec, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={exec.role}
                onMouseEnter={() => setActiveIndex(i)}
                className="relative overflow-hidden rounded-sm cursor-pointer"
                style={{
                  flex: isActive ? "3 1 0%" : "1 1 0%",
                  transition: "flex 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                  filter: isActive ? "none" : "brightness(0.85) saturate(0.7)",
                }}
              >
                <img
                  src={exec.image}
                  alt={exec.name}
                  loading="lazy"
                  width={640}
                  height={960}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    filter: isActive ? "grayscale(0)" : "grayscale(1)",
                    transition: "filter 600ms ease",
                  }}
                />
                {/* Bottom gradient */}
                <div
                  className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
                    opacity: isActive ? 1 : 0,
                    transition: "opacity 500ms ease",
                  }}
                />
                {/* Text overlay */}
                <div
                  className="absolute bottom-0 left-0 p-6"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 500ms ease, transform 500ms ease",
                  }}
                >
                  <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                    {exec.name}
                  </h3>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 mt-1">
                    {exec.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cards – mobile stacked */}
        <div className="flex flex-col gap-3 md:hidden">
          {executives.map((exec) => (
            <div key={exec.role} className="relative overflow-hidden rounded-sm" style={{ height: "320px" }}>
              <img
                src={exec.image}
                alt={exec.name}
                loading="lazy"
                width={640}
                height={960}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
              />
              <div className="absolute bottom-0 left-0 p-5">
                <h3 className="text-lg font-bold text-white">{exec.name}</h3>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 mt-1">
                  {exec.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
