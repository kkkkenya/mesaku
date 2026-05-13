import { MapPin, Clock, CalendarCheck, CalendarPlus, Loader2, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useInView } from "@/hooks/useInView";
import type { Tables } from "@/integrations/supabase/types";
import CalendarOptionsSheet from "./CalendarOptionsSheet";

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
  const [calEvent, setCalEvent] = useState<EventData | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("event_date", { ascending: true })
      .limit(3)
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, []);

  // Calendar handled by CalendarOptionsSheet via setCalEvent

  return (
    <section id="events" className="py-12 md:py-20 bg-gray-50" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2 className={`font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-12 ${inView ? "animate-fade-in-up" : "opacity-0"}`}>
          From workshops and industrial visits to design competitions and community activities — here is what MESA KU has coming up.
        </h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No upcoming events right now. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {events.map((event, i) => {
              const dateInfo = event.event_date ? formatDate(event.event_date) : null;
              return (
                <div
                  key={event.id}
                  className={`bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 flex flex-col ${
                    inView ? `animate-fade-in-up animation-delay-${(i + 1) * 100}` : "opacity-0"
                  }`}
                >
                  {event.poster_url && (
                    <img src={event.poster_url} alt={`${event.title} - MESA KU event at Kenyatta University`} className="w-full h-48 object-cover" loading="lazy" />
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="font-heading text-lg font-bold text-navy mb-1.5">{event.title}</h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">{event.description}</p>

                    {/* Event meta */}
                    {dateInfo && (
                      <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3.5 py-2.5 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <CalendarCheck className="w-4 h-4 text-primary shrink-0" />
                          <span>{dateInfo.day} {dateInfo.month} {dateInfo.year}</span>
                        </div>
                        <span className="text-border">|</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          {formatTime(event.event_date!)}
                        </span>
                        {event.venue && (
                          <>
                            <span className="text-border">|</span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{event.venue}</span>
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Actions — pushed to bottom */}
                    <div className="mt-auto flex flex-col gap-2">
                      {event.rsvp_url && (
                        <button
                          onClick={() => setRsvpEvent(event)}
                          className="flex items-center justify-center gap-2 bg-[#1E3A8A] text-white h-11 rounded-lg text-sm font-semibold hover:bg-[#15498f] transition-colors w-full"
                        >
                          <CalendarCheck size={16} /> RSVP Now
                        </button>
                      )}
                      {event.event_date && (
                        <button
                          onClick={() => addToCalendar(event)}
                          className="flex items-center justify-center gap-2 text-[#1E3A8A] h-9 rounded-lg text-sm font-medium hover:bg-muted/60 transition-colors w-full"
                        >
                          <CalendarPlus size={15} /> Add to Calendar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="flex justify-center mt-10">
            <Link
              to="/events"
              className="border border-[#1E3A8A] text-[#1E3A8A] px-6 h-12 inline-flex items-center rounded-lg hover:bg-[#1E3A8A] hover:text-white transition-colors font-semibold"
            >
              See All Events
            </Link>
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
