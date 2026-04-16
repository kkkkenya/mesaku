import { MapPin, Clock, CalendarCheck, CalendarPlus, X } from "lucide-react";
import { useState } from "react";
import eventCultural from "@/assets/event-cultural.jpg";
import eventMovie from "@/assets/event-movie.jpg";
import eventArts from "@/assets/event-arts.jpg";
import { useInView } from "@/hooks/useInView";

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  description: string;
  rsvpFormUrl: string;
  image: string;
}

const events: EventData[] = [
  {
    id: "expo-2025",
    title: "Engineering Expo & Showcase",
    date: "2025-09-28",
    time: "09:00",
    endTime: "16:00",
    location: "Engineering Block, KU",
    description: "Present your mechanical engineering projects and prototypes to industry professionals and fellow students. Network, learn, and compete for top honours.",
    rsvpFormUrl: "https://forms.gle/placeholder",
    image: eventCultural,
  },
  {
    id: "welding-2025",
    title: "Workshop: Welding & Fabrication",
    date: "2025-09-30",
    time: "10:00",
    endTime: "13:00",
    location: "Mechanical Lab, KU",
    description: "Get hands-on experience with MIG and TIG welding techniques, metal cutting, and fabrication fundamentals guided by certified instructors.",
    rsvpFormUrl: "https://forms.gle/placeholder",
    image: eventMovie,
  },
  {
    id: "cad-2025",
    title: "CAD Design Bootcamp",
    date: "2025-11-28",
    time: "11:00",
    endTime: "15:00",
    location: "Computer Lab 3, KU",
    description: "Master SolidWorks and AutoCAD in this intensive bootcamp. Learn 3D modelling, technical drawing, and simulation for real-world engineering applications.",
    rsvpFormUrl: "https://forms.gle/placeholder",
    image: eventArts,
  },
];

const formatDate = (d: string) => {
  const date = new Date(d + "T00:00:00");
  return { day: String(date.getDate()), month: date.toLocaleString("en", { month: "short" }).toUpperCase(), year: String(date.getFullYear()) };
};

const EventsSection = () => {
  const { ref, inView } = useInView();
  const [rsvpEvent, setRsvpEvent] = useState<EventData | null>(null);

  const addToCalendar = (event: EventData) => {
    const startDate = event.date.replace(/-/g, "");
    const startTime = event.time.replace(":", "") + "00";
    const endTime = event.endTime.replace(":", "") + "00";
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}T${startTime}/${startDate}T${endTime}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    window.open(calUrl, "_blank");
  };

  return (
    <section id="events" className="py-12 md:py-20 bg-surface" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2 className={`font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-12 ${inView ? "animate-fade-in-up" : "opacity-0"}`}>
          Upcoming Events
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {events.map((event, i) => {
            const { day, month, year } = formatDate(event.date);
            return (
              <div
                key={event.id}
                className={`bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 ${
                  inView ? `animate-fade-in-up animation-delay-${(i + 1) * 100}` : "opacity-0"
                }`}
              >
                <img src={event.image} alt={event.title} className="w-full h-48 object-cover" loading="lazy" />
                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-navy mb-2">{event.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed mb-4">{event.description}</p>

                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-primary leading-none">{day}</span>
                      <div className="text-[10px] font-semibold text-muted-foreground tracking-wide">{month}</div>
                      <div className="text-[10px] text-muted-foreground">{year}</div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.time} – {event.endTime}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setRsvpEvent(event)}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#1E3A8A] text-white h-12 rounded-lg text-base font-semibold hover:opacity-90 transition-opacity"
                    >
                      <CalendarCheck size={16} /> RSVP
                    </button>
                    <button
                      onClick={() => addToCalendar(event)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white text-[#1E3A8A] border-[1.5px] border-[#1E3A8A] h-12 rounded-lg text-base font-semibold hover:bg-[#1E3A8A]/5 transition-colors"
                    >
                      <CalendarPlus size={16} /> Add to Calendar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RSVP Modal */}
      {rsvpEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setRsvpEvent(null)}
        >
          <div
            className="bg-white w-full h-full md:w-[600px] md:h-auto md:max-h-[90vh] md:rounded-xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-heading text-lg font-bold">{rsvpEvent.title}</h3>
              <button onClick={() => setRsvpEvent(null)} className="p-1">
                <X size={24} />
              </button>
            </div>
            <iframe
              src={rsvpEvent.rsvpFormUrl}
              width="100%"
              height="480"
              frameBorder={0}
              title="RSVP Form"
              className="w-full"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default EventsSection;
