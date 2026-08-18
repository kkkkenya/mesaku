import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, MapPin, Clock, CalendarCheck, CalendarPlus, Loader2, ExternalLink, ChevronRight, Archive } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CalendarOptionsSheet from "@/components/CalendarOptionsSheet";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { isArchivedEvent } from "@/lib/archive";

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

type EventCardProps = {
  event: EventData;
  past?: boolean;
  onAddToCalendar: (event: EventData) => void;
};

const EventCard = ({ event, past = false, onAddToCalendar }: EventCardProps) => {
  const dateInfo = event.event_date ? formatDate(event.event_date) : null;
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-500 flex flex-col border border-gray-100 ${
        past ? "opacity-75 hover:opacity-100" : "hover:shadow-lg"
      }`}
    >
      {event.poster_url && (
        <img
          src={event.poster_url}
          alt={`${event.title} - MESA KU event at Kenyatta University`}
          className={`w-full h-48 object-cover transition-all duration-500 ${
            past ? "grayscale hover:grayscale-0" : ""
          }`}
          loading="lazy"
        />
      )}
      <div className="p-5 flex flex-col flex-1">
        {past && (
          <span className="self-start mb-2 inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-500 uppercase tracking-wide">
            Past event
          </span>
        )}
        <h3
          className={`font-heading text-lg font-bold mb-1.5 ${
            past ? "text-gray-600" : "text-[#1E3A8A]"
          }`}
        >
          {event.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {event.description}
        </p>

        {dateInfo && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 px-3.5 py-2.5 mb-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5 font-semibold text-gray-900">
              <CalendarCheck
                className={`w-4 h-4 shrink-0 ${past ? "text-gray-400" : "text-[#1E3A8A]"}`}
              />
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

        {!past && (
          <div className="mt-auto flex flex-col gap-2">
            {event.rsvp_url && (
              <a
                href={event.rsvp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#1E3A8A] text-white h-11 rounded-lg text-sm font-semibold hover:bg-[#15498f] transition-colors w-full"
              >
                <CalendarCheck size={16} /> RSVP Now
                <ExternalLink size={13} className="opacity-80" aria-label="Opens in new tab" />
              </a>
            )}
            {event.event_date && (
              <button
                onClick={() => onAddToCalendar(event)}
                className="flex items-center justify-center gap-2 text-[#1E3A8A] h-11 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors w-full"
              >
                <CalendarPlus size={15} /> Add to Calendar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Events = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [calEvent, setCalEvent] = useState<EventData | null>(null);
  const [showArchive, setShowArchive] = useState(false);

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

  const upcoming = useMemo(() => events.filter((e) => !isArchivedEvent(e)), [events]);
  const archived = useMemo(
    () =>
      events
        .filter(isArchivedEvent)
        .sort(
          (a, b) =>
            new Date(b.event_date || 0).getTime() - new Date(a.event_date || 0).getTime()
        ),
    [events]
  );

  const eventsJsonLd = useMemo(
    () =>
      upcoming
        .filter((e) => e.event_date)
        .map((e) => ({
          "@context": "https://schema.org",
          "@type": "Event",
          name: e.title,
          startDate: e.event_date,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: e.venue || "Kenyatta University",
            address: "Kenyatta University, Nairobi, Kenya",
          },
          image: e.poster_url ? [e.poster_url] : undefined,
          description: e.description || undefined,
          organizer: {
            "@type": "Organization",
            name: "MESA KU",
            url: "https://mesaku.lovable.app",
          },
          url: e.rsvp_url || "https://mesaku.lovable.app/events",
        })),
    [upcoming]
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>Events | MESA KU</title>
        <meta name="description" content="Upcoming MESA KU events at Kenyatta University — workshops, talks, industrial visits and engineering competitions." />
        <link rel="canonical" href="https://mesaku.lovable.app/events" />
        <meta property="og:title" content="Events | MESA KU" />
        <meta property="og:description" content="Upcoming MESA KU events at Kenyatta University — workshops, talks, industrial visits and engineering competitions." />
        <meta property="og:url" content="https://mesaku.lovable.app/events" />
        {eventsJsonLd.length > 0 && (
          <script type="application/ld+json">{JSON.stringify(eventsJsonLd)}</script>
        )}
      </Helmet>
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-24 pb-16">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500">
              <li>
                <Link to="/" className="hover:text-[#1E3A8A] hover:underline">Home</Link>
              </li>
              <li><ChevronRight size={12} className="text-gray-400" /></li>
              <li className="font-semibold text-[#1E3A8A]" aria-current="page">Events</li>
            </ol>
          </nav>

          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[#1E3A8A] text-sm hover:underline mb-6 min-h-[44px]"
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
          ) : (
            <>
              {upcoming.length === 0 ? (
                <p className="text-center text-gray-500 py-16">
                  No upcoming events right now. Check back soon!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  {upcoming.map((event) => (
                    <EventCard key={event.id} event={event} onAddToCalendar={setCalEvent} />
                  ))}
                </div>
              )}

              {archived.length > 0 && (
                <section className="mt-14 pt-10 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div>
                      <h2 className="font-heading text-xl md:text-2xl font-bold text-gray-700">
                        Past &amp; Archived Events
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Events that have already taken place.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowArchive((v) => !v)}
                      aria-expanded={showArchive}
                      className="inline-flex items-center gap-1.5 self-start h-11 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors"
                    >
                      <Archive size={15} />
                      {showArchive ? "Hide archive" : `View archive (${archived.length})`}
                    </button>
                  </div>

                  {showArchive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                      {archived.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          past
                          onAddToCalendar={setCalEvent}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}

        </div>
      </main>
      <Footer />
      <CalendarOptionsSheet event={calEvent} onClose={() => setCalEvent(null)} />
    </div>
  );
};

export default Events;
