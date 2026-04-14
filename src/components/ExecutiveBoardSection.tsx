import chairmanImg from "@/assets/exec-chairman.jpg";
import viceChairImg from "@/assets/exec-vice-chair.jpg";
import secretaryImg from "@/assets/exec-secretary.jpg";
import treasurerImg from "@/assets/exec-treasurer.jpg";
import "./ExecutiveBoard.css";

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
  return (
    <section id="executive-board" className="exec-section">
      <div className="container mx-auto px-6">
        <p className="section-label">04 // Leadership</p>
        <h2 className="section-title">Executive Board</h2>

        {/* Desktop */}
        <div className="board hidden md:flex">
          {executives.map((exec) => (
            <div key={exec.role} className="member">
              <img
                className="member-photo"
                src={exec.image}
                alt={exec.name}
                loading="lazy"
                width={640}
                height={960}
              />
              <div className="member-overlay" />
              <div className="member-info">
                <span className="member-name">{exec.name}</span>
                <span className="member-role">{exec.role}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile */}
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
