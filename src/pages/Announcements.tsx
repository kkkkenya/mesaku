import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

type Announcement = {
  id: string;
  title: string;
  description: string;
  tag: string;
  date: string;
  published: boolean;
  created_at: string;
};

const TAGS = ["All", "Announcement", "Event", "News", "Update"] as const;

const Announcements = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string>("All");

  useEffect(() => {
    document.title = "News & Announcements | MESA KU - Kenyatta University";
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("published", true)
        .order("date", { ascending: false });
      if (!mounted) return;
      if (error) setError(error.message);
      else setItems((data ?? []) as Announcement[]);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = activeTag === "All" ? items : items.filter((i) => i.tag === activeTag);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>News & Announcements | MESA KU</title>
        <meta name="description" content="Latest news, updates and announcements from MESA KU at Kenyatta University." />
        <link rel="canonical" href="https://mesaku.lovable.app/announcements" />
        <meta property="og:title" content="News & Announcements | MESA KU" />
        <meta property="og:description" content="Latest news, updates and announcements from MESA KU at Kenyatta University." />
        <meta property="og:url" content="https://mesaku.lovable.app/announcements" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "News & Announcements",
          url: "https://mesaku.lovable.app/announcements",
          description: "Latest news, updates and announcements from MESA KU at Kenyatta University.",
          isPartOf: { "@type": "WebSite", name: "MESA KU", url: "https://mesaku.lovable.app" },
        })}</script>
      </Helmet>
      <Navbar />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 md:px-8 pt-24 pb-16">
          <Link to="/" className="inline-flex items-center gap-1 text-[#1E3A8A] text-sm hover:underline mb-6">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <h1 className="text-center text-3xl md:text-4xl font-bold text-[#1E3A8A]">
            News & Announcements
          </h1>
          <p className="text-center text-gray-500 mt-2 mb-8">
            Everything happening at MESA KU
          </p>

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-4 px-4 md:justify-center md:mx-0 md:px-0">
            {TAGS.map((t) => {
              const active = activeTag === t;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTag(t)}
                  className={`shrink-0 px-4 h-9 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#1E3A8A] text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-[#1E3A8A]"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* List */}
          <div className="flex flex-col gap-4">
            {loading &&
              [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#D4A017] animate-pulse"
                >
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                  <div className="h-5 w-3/4 bg-gray-200 rounded mt-3" />
                  <div className="h-3 w-full bg-gray-100 rounded mt-3" />
                  <div className="h-3 w-5/6 bg-gray-100 rounded mt-2" />
                </div>
              ))}

            {!loading && error && (
              <div className="text-center text-red-600 py-8">Could not load announcements.</div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No announcements in this category yet.
              </div>
            )}

            {!loading &&
              !error &&
              filtered.map((a) => (
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
                  <p className="text-gray-600 text-sm mt-1 whitespace-pre-line">{a.description}</p>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Announcements;
