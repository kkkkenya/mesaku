import { Wrench, Handshake, Trophy, Briefcase, GraduationCap, Globe } from "lucide-react";

const benefits = [
  {
    icon: "Wrench",
    title: "Hands-On Projects",
    description: "Work on real engineering projects that build practical skills beyond the classroom.",
  },
  {
    icon: "Handshake",
    title: "Industry Networking",
    description: "Connect with professionals, companies, and alumni in the mechanical engineering field.",
  },
  {
    icon: "Trophy",
    title: "Competitions & Awards",
    description: "Participate in national and regional engineering competitions and represent KU.",
  },
  {
    icon: "Briefcase",
    title: "Career Development",
    description: "Access workshops, mentorship, CV clinics, and internship opportunities.",
  },
  {
    icon: "GraduationCap",
    title: "Academic Support",
    description: "Join study groups, access resources, and get peer support from fellow engineers.",
  },
  {
    icon: "Globe",
    title: "Community Impact",
    description: "Be part of projects that solve real problems and give back to the community.",
  },
] as const;

const iconMap = { Wrench, Handshake, Trophy, Briefcase, GraduationCap, Globe };

const WhyJoinSection = () => {
  const handleJoin = () => {
    window.open(
      "https://wa.me/254792180744?text=Hi%2C%20I%27d%20like%20to%20join%20MESA%20KU",
      "_blank"
    );
  };

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <p className="text-center text-[#D4A017] font-semibold uppercase tracking-wider text-sm">
          Membership
        </p>
        <h2 className="text-center font-heading text-3xl md:text-4xl font-bold text-[#1E3A8A] mt-2">
          Why Join MESA KU?
        </h2>
        <p className="text-center text-gray-600 mt-3 max-w-2xl mx-auto">
          More than a club — a launchpad for your engineering career.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
          {benefits.map((b) => {
            const Icon = iconMap[b.icon as keyof typeof iconMap];
            return (
              <div
                key={b.title}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
              >
                <div className="w-12 h-12 rounded-lg bg-[#1E3A8A]/10 flex items-center justify-center">
                  <Icon className="text-[#1E3A8A]" size={24} />
                </div>
                <h3 className="font-bold text-[#1E3A8A] text-base mt-3">{b.title}</h3>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">{b.description}</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-12">
          <button
            onClick={handleJoin}
            className="bg-[#1E3A8A] text-white px-8 h-14 text-base font-semibold rounded-lg hover:bg-[#D4A017] transition-colors duration-200"
          >
            Join MESA KU Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhyJoinSection;
