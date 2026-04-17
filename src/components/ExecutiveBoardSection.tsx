// ────────────────────────────────────────────────────────────────
// EXECUTIVE BOARD — easy image override
// ────────────────────────────────────────────────────────────────
// To replace the placeholder avatar for any member, just drop their
// photo into `src/assets/` and add an `image` field to that entry
// below. Example:
//
//   import isaacImg from "@/assets/isaac.jpg";
//   { id: 1, name: "Isaac Omondi Ogweno", role: "Chairman, MESA", image: isaacImg },
//
// If `image` is missing, a navy initials avatar is used automatically.
// ────────────────────────────────────────────────────────────────

interface Executive {
  id: number;
  name: string;
  role: string;
  image?: string;
}

const executives: Executive[] = [
  { id: 1,  name: "Isaac Omondi Ogweno",     role: "Chairman, MESA" },
  { id: 2,  name: "Gregory Muhoro",          role: "Deputy Chair" },
  { id: 3,  name: "Wiseman Kaberia",         role: "Deputy Secretary General" },
  { id: 4,  name: "Lyneford Muriithi",       role: "Treasurer" },
  { id: 5,  name: "Godwin Fadhili Imbala",   role: "Publicity Secretary" },
  { id: 6,  name: "Lewis Kimani",            role: "Industrial Lead" },
  { id: 7,  name: "Stephen Kamau G",         role: "Organizing Secretary" },
  { id: 8,  name: "Teddy Odhiambo Onyango",  role: "1st Year Representative" },
  { id: 9,  name: "Gloria",                  role: "4th Year Representative" },
  { id: 10, name: "Kituyi Noelyn Nasimiyu",  role: "Assistant Publicity Lead" },
];

function MemberCard({ name, role, image }: { name: string; role: string; image?: string }) {
  const src =
    image ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E3A8A&color=fff&size=200`;

  return (
    <div
      className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col items-center text-center
                 transition-transform duration-200 hover:scale-100 md:hover:scale-105 hover:shadow-lg"
    >
      <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-200 mb-3">
        <img
          src={src}
          alt={`${name} profile photo`}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      <p className="font-bold text-[#1E3A8A] text-sm leading-tight">{name}</p>
      <p className="text-gray-500 text-xs mt-1 leading-snug">{role}</p>
    </div>
  );
}

export default function ExecutiveBoardSection() {
  return (
    <section id="executive-board" className="py-16 bg-gray-50">
      <style>{`.carousel-hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Section heading */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold tracking-widest text-[#1E3A8A] uppercase mb-2">
            Leadership
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Executive Board</h2>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-5 gap-6">
          {executives.map((exec) => (
            <MemberCard key={exec.id} name={exec.name} role={exec.role} image={exec.image} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div
          className="carousel-hide-scrollbar flex md:hidden overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scroll-smooth -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {executives.map((exec) => (
            <div key={exec.id} className="flex-shrink-0 w-[200px] snap-start">
              <MemberCard name={exec.name} role={exec.role} image={exec.image} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
