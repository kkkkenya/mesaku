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

        {/* Desktop: horizontal expanding hover */}
        <div className="board">
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

        {/* Tablet: 2×2 grid */}
        <div className="board-tablet">
          {executives.map((exec) => (
            <div key={exec.role} className="tablet-card">
              <img src={exec.image} alt={exec.name} loading="lazy" width={640} height={960} />
              <div className="tablet-overlay" />
              <div className="tablet-info">
                <h3>{exec.name}</h3>
                <p>{exec.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: stacked full-color cards */}
        <div className="board-mobile">
          {executives.map((exec) => (
            <div key={exec.role} className="mobile-card">
              <img src={exec.image} alt={exec.name} loading="lazy" width={640} height={960} />
              <div className="mobile-overlay" />
              <div className="mobile-info">
                <h3>{exec.name}</h3>
                <p>{exec.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
