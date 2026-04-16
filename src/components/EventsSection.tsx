import { MapPin, Clock, CalendarCheck, CalendarPlus, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInView } from "@/hooks/useInView";
import type { Tables } from "@/integrations/supabase/types";

type EventData = Tables<"events">;

const formatDate = (d: string) => {
  const date = new Date(d);
  return {
    day: String(date.getDate()),
    month: date.toLocaleString("en", { month: "short" }).toUpperCase(),
    year: String(date.getFullYear()),
  };
};

const formatTime = (d: string) => {
  const date = new Date(d);
  return date.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const EventsSection = () => {
  const { ref, inView } = useInView();
  const [rsvpEvent, setRsvpEvent] = useState<EventData | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("event_date", { ascending: true })
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, []);

  const addToCalendar = (event: EventData) => {
    if (!event.event_date) return;
    const startDate = event.event_date.replace(/[-:]/g, "").slice(0, 15) + "Z";
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${startDate}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.venue || "")}`;
    window.open(calUrl, "_blank");
  };

  return (
    <section id="events" className="py-12 md:py-20 bg-surface" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2 className={`font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-12 ${inView ? "animate-fade-in-up" : "opacity-0"}`}>
          Upcoming Events
        </h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No upcoming events right now. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {events.map((event, i) => {
              const dateInfo = event.event_date ? formatDate(event.event_date) : null;
              return (
                <div
                  key={event.id}
                  className={`bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 ${
                    inView ? `animate-fade-in-up animation-delay-${(i + 1) * 100}` : "opacity-0"
                  }`}
                >
                  {event.poster_url && (
                    <img src={event.poster_url} alt={event.title} className="w-full h-48 object-cover" loading="lazy" />
                  )}
                  <div className="p-5">
                    <h3 className="font-heading text-lg font-bold text-navy mb-2">{event.title}</h3>
                    <p className="text-muted-foreground text-base leading-relaxed mb-4">{event.description}</p>

                    {dateInfo && (
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-center">
                          <span className="text-3xl font-bold text-primary leading-none">{dateInfo.day}</span>
                          <div className="text-[10px] font-semibold text-muted-foreground tracking-wide">{dateInfo.month}</div>
                          <div className="text-[10px] text-muted-foreground">{dateInfo.year}</div>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          {event.venue && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.venue}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTime(event.event_date!)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      {event.rsvp_url && (
                        <button
                          onClick={() => setRsvpEvent(event)}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#1E3A8A] text-white h-12 rounded-lg text-base font-semibold hover:opacity-90 transition-opacity"
                        >
                          <CalendarCheck size={16} /> RSVP
                        </button>
                      )}
                      {event.event_date && (
                        <button
                          onClick={() => addToCalendar(event)}
                          className="flex-1 flex items-center justify-center gap-2 bg-white text-[#1E3A8A] border-[1.5px] border-[#1E3A8A] h-12 rounded-lg text-base font-semibold hover:bg-[#1E3A8A]/5 transition-colors"
                        >
                          <CalendarPlus size={16} /> Add to Calendar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RSVP Modal */}
      {rsvpEvent && rsvpEvent.rsvp_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setRsvpEvent(null)}>
          <div className="bg-white w-full h-full md:w-[600px] md:h-auto md:max-h-[90vh] md:rounded-xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-heading text-lg font-bold">{rsvpEvent.title}</h3>
              <button onClick={() => setRsvpEvent(null)} className="p-1"><X size={24} /></button>
            </div>
            <iframe src={rsvpEvent.rsvp_url} width="100%" height="480" frameBorder={0} title="RSVP Form" className="w-full" />
          </div>
        </div>
      )}
    </section>
  );
};

export default EventsSection;
