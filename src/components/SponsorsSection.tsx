type Sponsor = {
  id: string;
  name: string;
  logoUrl: string | null;
  placeholderBg: string;
  placeholderText: string;
};

const sponsors: Sponsor[] = [
  { id: "cizeri", name: "Cizeri Labs", logoUrl: null, placeholderBg: "#1E3A8A", placeholderText: "CL" },
  { id: "ansys", name: "ANSYS", logoUrl: null, placeholderBg: "#FFB71B", placeholderText: "ANSYS" },
  { id: "solidworks", name: "SolidWorks", logoUrl: null, placeholderBg: "#E2001A", placeholderText: "SW" },
];
// TODO: Replace logoUrl values with Supabase storage URLs when real assets are available.

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
              animation: "mesa-marquee 12s linear infinite",
              display: "flex",
              gap: "60px",
              width: "max-content",
            }}
          >
            {marqueeItems.map((s, idx) => (
              <div key={`${s.id}-${idx}`} className="flex flex-col items-center gap-2 shrink-0">
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
                    className="h-20 w-32 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{
                      backgroundColor: s.placeholderBg,
                      filter: "grayscale(100%)",
                      transition: "filter 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = "grayscale(0%)")}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "grayscale(100%)")}
                  >
                    {s.placeholderText}
                  </div>
                )}
                <p className="text-[#1E3A8A] font-semibold text-sm text-center">{s.name}</p>
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
