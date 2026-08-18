import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, X, CalendarDays, Archive, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EmptyState from "@/components/admin/EmptyState";
import ArchiveTabs from "@/components/admin/ArchiveTabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isPastEvent } from "@/lib/archive";

type Event = Tables<"events">;


const inputCls =
  "w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors";

const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Event> | null>(null);
  const [saving, setSaving] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openNew = () => {
    setEditing({ title: "", description: "", venue: "", rsvp_url: "", status: "draft" });
    setPosterFile(null);
  };

  const save = async () => {
    if (!editing?.title) return;
    setSaving(true);

    let poster_url = editing.poster_url || null;
    if (posterFile) {
      const url = await uploadFile("media", posterFile, "events");
      if (url) poster_url = url;
    }

    const payload = {
      title: editing.title!,
      description: editing.description || null,
      venue: editing.venue || null,
      rsvp_url: editing.rsvp_url || null,
      event_date: editing.event_date || null,
      poster_url,
      status: editing.status || "draft",
    };

    const result = editing.id
      ? await supabase.from("events").update(payload).eq("id", editing.id)
      : await supabase.from("events").insert(payload);

    if (result.error) {
      toast.error("Failed to save event: " + result.error.message);
      setSaving(false);
      return;
    }

    toast.success(editing.id ? "Event updated" : "Event created");
    setSaving(false);
    setEditing(null);
    setPosterFile(null);
    fetchEvents();
  };

  const toggleStatus = async (ev: Event) => {
    const newStatus = ev.status === "published" ? "draft" : "published";
    await supabase.from("events").update({ status: newStatus }).eq("id", ev.id);
    fetchEvents();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    fetchEvents();
  };

  return (
    <div className="max-w-5xl">
      <AdminPageHeader
        title="Events"
        breadcrumb="Events"
        subtitle="Manage MESA events — set dates, descriptions, posters, and RSVP links."
        action={
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-teal text-teal-foreground font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="h-4 w-4" /> New Event
          </button>
        }
      />

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-heading text-xl font-bold text-slate-900">
                {editing.id ? "Edit" : "New"} Event
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className={labelCls}>Title</label>
              <input
                className={inputCls}
                placeholder="e.g. Annual Engineering Showcase"
                value={editing.title || ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                className={`${inputCls} h-auto py-3`}
                rows={4}
                placeholder="Tell members what to expect…"
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Venue</label>
                <input
                  className={inputCls}
                  placeholder="e.g. KU Engineering Hall"
                  value={editing.venue || ""}
                  onChange={(e) => setEditing({ ...editing, venue: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Date & Time</label>
                <input
                  className={inputCls}
                  type="datetime-local"
                  value={
                    editing.event_date
                      ? new Date(editing.event_date).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      event_date: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>RSVP URL</label>
              <input
                className={inputCls}
                placeholder="https://forms.gle/…"
                value={editing.rsvp_url || ""}
                onChange={(e) => setEditing({ ...editing, rsvp_url: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Poster Image</label>
              {editing.poster_url && !posterFile && (
                <img
                  src={editing.poster_url}
                  alt=""
                  className="h-32 object-cover rounded-md mb-2 border border-slate-200"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal file:text-teal-foreground file:font-semibold file:cursor-pointer"
              />
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select
                className={inputCls}
                value={editing.status || "draft"}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditing(null)}
                className="h-11 px-6 rounded-lg border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center h-11 px-6 rounded-lg bg-teal text-teal-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-teal" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-7 w-7" />}
          title="No events yet"
          description="Create your first event to start engaging MESA members."
          action={
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-teal text-teal-foreground font-semibold hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> New Event
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                {ev.poster_url && (
                  <img
                    src={ev.poster_url}
                    alt=""
                    className="h-14 w-14 sm:h-16 sm:w-16 object-cover rounded-lg shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-slate-900">{ev.title}</p>
                  <p className="text-sm text-slate-500 truncate">
                    {ev.event_date ? new Date(ev.event_date).toLocaleDateString() : "No date"} ·{" "}
                    {ev.venue || "No venue"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    ev.status === "published"
                      ? "bg-teal text-teal-foreground"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {ev.status}
                </span>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleStatus(ev)}
                        aria-label={ev.status === "published" ? "Unpublish" : "Publish"}
                        className="h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                      >
                        {ev.status === "published" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {ev.status === "published" ? "Unpublish" : "Publish"}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          setEditing(ev);
                          setPosterFile(null);
                        }}
                        aria-label="Edit"
                        className="h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => remove(ev.id)}
                        aria-label="Delete"
                        className="h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-red-50 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
