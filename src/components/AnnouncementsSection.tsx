import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Announcement = {
  id: string;
  title: string;
  description: string;
  tag: "Announcement" | "Event" | "News" | "Update";
  date: string;
  published: boolean;
  created_at: string;
};

const AnnouncementsSection = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("published", true)
        .order("date", { ascending: false })
        .limit(3);
      if (!mounted) return;
      if (error) {
        setError(error.message);
      } else {
        setAnnouncements((data ?? []) as Announcement[]);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);


  return (
    <section id="announcements" className="py-16 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <p className="text-center text-[#D4A017] font-semibold uppercase tracking-wider text-sm">
          Latest
        </p>
        <h2 className="text-center font-heading text-3xl md:text-4xl font-bold text-[#1E3A8A] mt-2">
          News & Announcements
        </h2>
        <p className="text-center text-gray-600 mt-3 max-w-2xl mx-auto">
          Stay up to date with everything happening at MESA KU
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {loading &&
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#D4A017] animate-pulse"
              >
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-5 w-3/4 bg-gray-200 rounded mt-3" />
                <div className="h-3 w-full bg-gray-100 rounded mt-3" />
                <div className="h-3 w-5/6 bg-gray-100 rounded mt-2" />
                <div className="h-3 w-24 bg-gray-100 rounded mt-4" />
              </div>
            ))}

          {!loading && error && (
            <div className="md:col-span-3 text-center text-red-600 py-8">
              Could not load announcements.
            </div>
          )}

          {!loading && !error && announcements.length === 0 && (
            <div className="md:col-span-3 text-center text-gray-500 py-8">
              No announcements at this time. Check back soon.
            </div>
          )}

          {!loading &&
            !error &&
            announcements.map((a) => (
              <article
                key={a.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-[#D4A017] p-5"
              >
                <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-[#D4A017]/10 text-[#D4A017]">
                  {a.tag}
                </span>
                <h3 className="font-bold text-[#1E3A8A] text-base mt-2 leading-snug">
                  {a.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-3">{a.description}</p>
                <p className="text-gray-400 text-xs mt-3">
                  {new Date(a.date).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </article>
            ))}
        </div>

        <div className="flex justify-center mt-10">
          <Link
            to="/announcements"
            className="border border-[#1E3A8A] text-[#1E3A8A] px-6 h-12 inline-flex items-center rounded-lg hover:bg-[#1E3A8A] hover:text-white transition-colors font-semibold"
          >
            View All Announcements
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AnnouncementsSection;
