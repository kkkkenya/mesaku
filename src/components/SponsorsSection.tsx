import kuasaLogo from "@/assets/partners/kuasa.png";
import acesLogo from "@/assets/partners/aces_ku.jpg";
import esaLogo from "@/assets/partners/esa_ku.jpg";
import ansysLogo from "@/assets/partners/ansys.png";
import speLogo from "@/assets/partners/spe.png";
import cezeriLogo from "@/assets/partners/cezeri_lab.png";

type Sponsor = {
  id: string;
  name: string;
  logoUrl: string | null;
  placeholderBg: string;
  placeholderText: string;
  placeholderTextColor?: string;
};

// To swap a placeholder for a real logo, set logoUrl to an imported asset or URL.
const sponsors: Sponsor[] = [
  {
    id: "kuasa",
    name: "KU Aerospace Students Association",
    logoUrl: kuasaLogo,
    placeholderBg: "#003366",
    placeholderText: "KASA",
  },
  {
    id: "aces",
    name: "Association of Civil Engineering Students, Kenyatta University",
    logoUrl: acesLogo,
    placeholderBg: "#5c4033",
    placeholderText: "ACES",
  },
  {
    id: "esaku",
    name: "Engineering Students Association, Kenyatta University",
    logoUrl: esaLogo,
    placeholderBg: "#1a6b3c",
    placeholderText: "ESAKU",
  },
  {
    id: "ansys",
    name: "Ansys",
    logoUrl: ansysLogo,
    placeholderBg: "#FFB71B",
    placeholderText: "ANSYS",
    placeholderTextColor: "#000000",
  },
  {
    id: "spe",
    name: "Society of Petroleum Engineers International",
    logoUrl: speLogo,
    placeholderBg: "#0055a5",
    placeholderText: "SPE",
  },
  {
    id: "4ws",
    name: "4WS Enterprise",
    logoUrl: null,
    placeholderBg: "#e63946",
    placeholderText: "4WS",
  },
  {
    id: "cezeri",
    name: "Cezeri Lab Ulaanbaatar",
    logoUrl: cezeriLogo,
    placeholderBg: "#1a2e4a",
    placeholderText: "CL",
  },
];

const marqueeItems = [...sponsors, ...sponsors];

const SponsorsSection = () => {
  return (
    <section className="py-16 md:py-20 bg-white">
      <style>{`@keyframes mesa-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <p className="text-center text-[#D4A017] font-semibold uppercase tracking-wider text-sm">
          Partners
        </p>
        <h2 className="text-center font-heading text-3xl md:text-4xl font-bold text-[#1E3A8A] mt-2">
          Our Partners & Sponsors
        </h2>
        <p className="text-center text-gray-600 mt-3 max-w-2xl mx-auto">
          Proud to work with industry leaders who support MESA KU
        </p>

        <div className="overflow-hidden w-full mt-10">
          <div
            style={{
              animation: "mesa-marquee 30s linear infinite",
              display: "flex",
              gap: "60px",
              width: "max-content",
            }}
          >
            {marqueeItems.map((s, idx) => (
              <div key={`${s.id}-${idx}`} className="flex flex-col items-center gap-2 shrink-0 w-40">
                {s.logoUrl ? (
                  <img
                    src={s.logoUrl}
                    alt={s.name}
                    className="h-20 w-32 object-contain"
                    style={{ filter: "grayscale(100%)", transition: "filter 0.3s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = "grayscale(0%)")}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "grayscale(100%)")}
                  />
                ) : (
                  <div
                    className="h-20 w-32 rounded-lg flex items-center justify-center font-bold text-lg"
                    style={{
                      backgroundColor: s.placeholderBg,
                      color: s.placeholderTextColor ?? "#ffffff",
                      filter: "grayscale(100%)",
                      transition: "filter 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = "grayscale(0%)")}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "grayscale(100%)")}
                  >
                    {s.placeholderText}
                  </div>
                )}
                <p className="text-[#1E3A8A] font-semibold text-xs text-center leading-tight">{s.name}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-gray-600 mt-10">
          Interested in partnering with us?{" "}
          <a
            href="mailto:mechstudentsassociation.ku@gmail.com"
            className="text-[#1E3A8A] font-semibold hover:underline"
          >
            Contact us
          </a>
        </p>
      </div>
    </section>
  );
};

export default SponsorsSection;
