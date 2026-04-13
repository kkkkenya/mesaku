import { MapPin, Clock } from "lucide-react";
import eventCultural from "@/assets/event-cultural.jpg";
import eventMovie from "@/assets/event-movie.jpg";
import eventArts from "@/assets/event-arts.jpg";
import { useInView } from "@/hooks/useInView";

const events = [
  {
    title: "Engineering Expo & Showcase",
    desc: "Present your mechanical engineering projects and prototypes to industry professionals and fellow students. Network, learn, and compete for top honours...",
    image: eventCultural,
    day: "28", month: "SEPT", year: "2024",
    location: "Engineering Block, KU",
    time: "9:00 AM – 4:00 PM",
  },
  {
    title: "Workshop: Welding & Fabrication",
    desc: "Get hands-on experience with MIG and TIG welding techniques, metal cutting, and fabrication fundamentals guided by certified instructors...",
    image: eventMovie,
    day: "30", month: "SEPT", year: "2024",
    location: "Mechanical Lab, KU",
    time: "10:00 AM – 1:00 PM",
  },
  {
    title: "CAD Design Bootcamp",
    desc: "Master SolidWorks and AutoCAD in this intensive bootcamp. Learn 3D modelling, technical drawing, and simulation for real-world engineering applications...",
    image: eventArts,
    day: "28", month: "NOV", year: "2024",
    location: "Computer Lab 3, KU",
    time: "11:00 AM – 3:00 PM",
  },
];

const EventsSection = () => {
  const { ref, inView } = useInView();

  return (
    <section id="events" className="py-20 bg-surface" ref={ref}>
      <div className="container mx-auto px-6">
        <h2 className={`font-heading text-3xl md:text-4xl font-bold text-navy mb-12 ${inView ? "animate-fade-in-up" : "opacity-0"}`}>
          Upcoming Events
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <div
              key={event.title}
              className={`bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 ${
                inView ? `animate-fade-in-up animation-delay-${(i + 1) * 100}` : "opacity-0"
              }`}
            >
              <img src={event.image} alt={event.title} className="w-full h-48 object-cover" loading="lazy" />
              <div className="p-5">
                <h3 className="font-heading text-lg font-bold text-navy mb-2">{event.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{event.desc}</p>

                <div className="flex items-start gap-4 mb-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-primary leading-none">{event.day}</span>
                    <div className="text-[10px] font-semibold text-muted-foreground tracking-wide">{event.month}</div>
                    <div className="text-[10px] text-muted-foreground">{event.year}</div>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.time}</span>
                  </div>
                </div>

                <button className="w-full border border-primary text-primary py-2 rounded-md text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
                  RSVP
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <button className={`border border-navy text-navy px-6 py-2 rounded-full text-sm font-medium hover:bg-navy hover:text-navy-foreground transition-colors duration-300 ${inView ? "animate-fade-in-up animation-delay-500" : "opacity-0"}`}>
            SEE ALL EVENTS →
          </button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
