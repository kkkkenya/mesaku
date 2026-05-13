import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, CalendarCheck, CalendarPlus, Loader2, ExternalLink, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CalendarOptionsSheet from "@/components/CalendarOptionsSheet";
import { supabase } from "@/integrations/supabase/client";
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

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false });

const Events = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [calEvent, setCalEvent] = useState<EventData | null>(null);

  useEffect(() => {
    document.title = "Upcoming Events | MESA KU - Mechanical Engineering Students Association";
  }, []);

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-24 pb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[#1E3A8A] text-sm hover:underline mb-6"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <h1 className="text-center text-3xl md:text-4xl font-bold text-[#1E3A8A]">
            Upcoming Events
          </h1>
          <p className="text-center text-gray-500 mt-2 mb-10">
            All MESA KU events — workshops, talks, and competitions
          </p>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-[#1E3A8A]" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-center text-gray-500 py-16">
              No upcoming events right now. Check back soon!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {events.map((event) => {
                const dateInfo = event.event_date ? formatDate(event.event_date) : null;
                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col border border-gray-100"
                  >
                    {event.poster_url && (
                      <img
                        src={event.poster_url}
                        alt={`${event.title} - MESA KU event at Kenyatta University`}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-heading text-lg font-bold text-[#1E3A8A] mb-1.5">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {event.description}
                      </p>

                      {dateInfo && (
                        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 px-3.5 py-2.5 mb-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1.5 font-semibold text-gray-900">
                            <CalendarCheck className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                            {dateInfo.day} {dateInfo.month} {dateInfo.year}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            {formatTime(event.event_date!)}
                          </span>
                          {event.venue && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{event.venue}</span>
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-auto flex flex-col gap-2">
                        {event.rsvp_url && (
                          <a
                            href={event.rsvp_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-[#1E3A8A] text-white h-11 rounded-lg text-sm font-semibold hover:bg-[#15498f] transition-colors w-full"
                          >
                            <CalendarCheck size={16} /> RSVP Now
                          </a>
                        )}
                        {event.event_date && (
                          <button
                            onClick={() => addToCalendar(event)}
                            className="flex items-center justify-center gap-2 text-[#1E3A8A] h-9 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors w-full"
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
