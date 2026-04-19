// ────────────────────────────────────────────────────────────────
// EXECUTIVE BOARD — easy image override
// ────────────────────────────────────────────────────────────────
// To set a member's photo, drop the file into `src/assets/`, import
// it at the top of this file, and add `image: yourImg` to that
// member's entry below. Members without an `image` show a plain
// light-gray placeholder card.
// ────────────────────────────────────────────────────────────────

import { useState } from "react";
import isaacImg from "@/assets/exec-isaac.png";
import gregoryImg from "@/assets/exec-gregory.png";
import wisemanImg from "@/assets/exec-wiseman.png";
import lewisImg from "@/assets/exec-lewis.png";
import noelynImg from "@/assets/exec-noelyn.png";
import teddyImg from "@/assets/exec-teddy.png";
import gloriaImg from "@/assets/exec-gloria.png";
import godwinImg from "@/assets/exec-godwin.png";
import stephenImg from "@/assets/exec-stephen.png";
import lyneforImg from "@/assets/exec-lyneford.png";

interface Executive {
  id: number;
  name: string;
  role: string;
  image?: string;
}

const executives: Executive[] = [
  { id: 1,  name: "Isaac Omondi Ogweno",     role: "Chairman, MESA",            image: isaacImg },
  { id: 2,  name: "Gregory Muhoro",          role: "Deputy Chair",              image: gregoryImg },
  { id: 3,  name: "Wiseman Kaberia",         role: "Deputy Secretary General",  image: wisemanImg },
  { id: 4,  name: "Lyneford Muriithi",       role: "Treasurer",                 image: lyneforImg },
  { id: 5,  name: "Godwin Fadhili Imbala",   role: "Publicity Secretary",       image: godwinImg },
  { id: 6,  name: "Lewis Kimani",            role: "Industrial Lead",           image: lewisImg },
  { id: 7,  name: "Stephen Kamau G",         role: "Organizing Secretary",      image: stephenImg },
  { id: 8,  name: "Teddy Odhiambo Onyango",  role: "1st Year Representative",   image: teddyImg },
  { id: 9,  name: "Gloria",                  role: "4th Year Representative",   image: gloriaImg },
  { id: 10, name: "Kituyi Noelyn Nasimiyu",  role: "Assistant Publicity Lead",  image: noelynImg },
];

function MemberCard({
  name,
  role,
  image,
  index,
}: {
  name: string;
  role: string;
  image?: string;
  index: number;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="group relative w-full overflow-hidden rounded-sm bg-gray-100 cursor-pointer"
      style={{ aspectRatio: "3 / 4" }}
    >
      {image ? (
        <img
          src={image}
          alt={`${name} — ${role}`}
          width={400}
          height={533}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      ) : (
        <div className="absolute inset-0 bg-gray-200" />
      )}

      {/* Hover overlay */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 55%)",
        }}
      />

      {/* Always-visible info on mobile, hover-reveal on desktop */}
      <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 md:opacity-0 md:translate-y-2 md:transition md:duration-300 md:group-hover:opacity-100 md:group-hover:translate-y-0">
        {/* Mobile gradient (so text stays legible without hover) */}
        <div
          className="absolute inset-0 md:hidden pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div className="relative">
          <p className="text-white font-bold text-sm md:text-base leading-tight">
            {name}
          </p>
          <p className="text-white/75 text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.15em] mt-1">
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ExecutiveBoardSection() {
  return (
    <section id="executive-board" className="py-16 bg-white">
      <style>{`.carousel-hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Section heading */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-2">
            Leadership
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Executive Board
          </h2>
        </div>

        {/* Desktop grid: 5 columns × 2 rows */}
        <div className="hidden md:grid grid-cols-5 gap-4">
          {executives.map((exec, idx) => (
            <MemberCard
              key={exec.id}
              name={exec.name}
              role={exec.role}
              image={exec.image}
              index={idx}
            />
          ))}
        </div>

        {/* Mobile horizontal carousel */}
        <div
          className="carousel-hide-scrollbar flex md:hidden overflow-x-auto gap-3 pb-4 snap-x snap-mandatory scroll-smooth -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {executives.map((exec, idx) => (
            <div key={exec.id} className="flex-shrink-0 w-[200px] snap-start">
              <MemberCard name={exec.name} role={exec.role} image={exec.image} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
