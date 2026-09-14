import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { bundledPhotos } from "@/data/executivePhotos";

type Executive = Tables<"executives">;

// Shown only if the database fetch fails, so the homepage never loses
// its leadership section.
const fallbackExecutives: Executive[] = [
  { id: "2d506c16-4bf5-4e43-a2c3-e75f66e0cd85", name: "Isaac Omondi Ogweno",    role: "Chairman, MESA",           image_url: null, order_index: 1, archived: false, created_at: "" },
  { id: "caf9340b-3160-4bf8-a215-445c93c45538", name: "Gregory Muhoro",         role: "Deputy Chair",             image_url: null, order_index: 2, archived: false, created_at: "" },
  { id: "31eebb2f-623e-4d68-8fb8-adb58bea106c", name: "Wiseman Kaberia",        role: "Deputy Secretary General", image_url: null, order_index: 3, archived: false, created_at: "" },
  { id: "92519cdd-17a4-4467-8868-3873726828be", name: "Lyneford Muriithi",      role: "Treasurer",                image_url: null, order_index: 4, archived: false, created_at: "" },
  { id: "4d91ca50-db83-4ae1-b2b8-2db736a74e8b", name: "Godwin Fadhili Imbala",  role: "Publicity Secretary",      image_url: null, order_index: 5, archived: false, created_at: "" },
  { id: "11892945-9035-47e2-b8ea-6769b88f6056", name: "Lewis Kimani",           role: "Industrial Lead",          image_url: null, order_index: 6, archived: false, created_at: "" },
  { id: "0a340510-6896-4e5e-b265-6e34055074dc", name: "Stephen Kamau G",        role: "Organizing Secretary",     image_url: null, order_index: 7, archived: false, created_at: "" },
  { id: "c5a6fe83-fc20-408a-8f82-e2d963e0b10f", name: "Teddy Odhiambo Onyango", role: "1st Year Representative",  image_url: null, order_index: 8, archived: false, created_at: "" },
  { id: "1f493c33-bb48-4970-a92b-fd3c62e3f55b", name: "Gloria",                 role: "4th Year Representative",  image_url: null, order_index: 9, archived: false, created_at: "" },
  { id: "386c7a8a-66ce-4724-9586-8aa795c39d3d", name: "Kituyi Noelyn Nasimiyu", role: "Assistant Publicity Lead", image_url: null, order_index: 10, archived: false, created_at: "" },
];

function MemberCard({
  name,
  role,
  image,
}: {
  name: string;
  role: string;
  image?: string;
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
          alt={`${name} - ${role}, MESA KU`}
          width={400}
          height={533}
          // Board sits at the bottom of the page: lazy-load so the photos
          // never compete with the hero, and keep full quality since the
          // wait is acceptable here.
          loading="lazy"
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

function photoFor(exec: Executive): string | undefined {
  return exec.image_url ?? bundledPhotos[exec.id] ?? undefined;
}

export default function ExecutiveBoardSection() {
  const [executives, setExecutives] = useState<Executive[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("executives")
        .select("*")
        .eq("archived", false)
        .order("order_index", { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error("Failed to load executive board:", error);
        setFailed(true);
      }
      setExecutives(data ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const board = executives === null ? null : failed && executives.length === 0 ? fallbackExecutives : executives;

  // Board removed entirely — don't render an empty section.
  if (board !== null && board.length === 0) return null;

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

        {/* Desktop grid: 5 columns */}
        <div className="hidden md:grid grid-cols-5 gap-4">
          {(board ?? Array.from({ length: 10 })).map((exec, idx) =>
            exec ? (
              <MemberCard
                key={exec.id}
                name={exec.name}
                role={exec.role}
                image={photoFor(exec)}
              />
            ) : (
              // Loading skeleton — same silhouette as a photo-less card
              <div
                key={`skeleton-${idx}`}
                className="w-full bg-gray-100 rounded-sm"
                style={{ aspectRatio: "3 / 4" }}
              />
            )
          )}
        </div>

        {/* Mobile horizontal carousel */}
        <div
          className="carousel-hide-scrollbar flex md:hidden overflow-x-auto gap-3 pb-4 snap-x snap-mandatory scroll-smooth -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {(board ?? Array.from({ length: 5 })).map((exec, idx) =>
            exec ? (
              <div key={exec.id} className="flex-shrink-0 w-[200px] snap-start">
                <MemberCard name={exec.name} role={exec.role} image={photoFor(exec)} />
              </div>
            ) : (
              <div
                key={`skeleton-${idx}`}
                className="flex-shrink-0 w-[200px] bg-gray-100 rounded-sm"
                style={{ aspectRatio: "3 / 4" }}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}
