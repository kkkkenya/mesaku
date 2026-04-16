import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

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

  useEffect(() => { fetchEvents(); }, []);

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

    if (editing.id) {
      await supabase.from("events").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("events").insert(payload);
    }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Events</h1>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> New Event
        </Button>
      </div>

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">{editing.id ? "Edit" : "New"} Event</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <Input placeholder="Title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <Textarea placeholder="Description" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <Input placeholder="Venue" value={editing.venue || ""} onChange={(e) => setEditing({ ...editing, venue: e.target.value })} />
            <Input type="datetime-local" value={editing.event_date ? new Date(editing.event_date).toISOString().slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, event_date: e.target.value ? new Date(e.target.value).toISOString() : null })} />
            <Input placeholder="RSVP URL" value={editing.rsvp_url || ""} onChange={(e) => setEditing({ ...editing, rsvp_url: e.target.value })} />
            <div>
              <label className="text-sm font-medium">Poster Image</label>
              {editing.poster_url && !posterFile && (
                <img src={editing.poster_url} alt="" className="h-32 object-cover rounded-md mb-2" />
              )}
              <Input type="file" accept="image/*" onChange={(e) => setPosterFile(e.target.files?.[0] || null)} />
            </div>
            <select
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
              value={editing.status || "draft"}
              onChange={(e) => setEditing({ ...editing, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <Button onClick={save} disabled={saving} className="w-full h-12">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No events yet. Create your first event!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="flex items-center gap-4 p-4 bg-card rounded-lg border">
              {ev.poster_url && (
                <img src={ev.poster_url} alt="" className="h-16 w-16 object-cover rounded-md shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{ev.title}</p>
                <p className="text-sm text-muted-foreground">
                  {ev.event_date ? new Date(ev.event_date).toLocaleDateString() : "No date"} · {ev.venue || "No venue"}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${ev.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {ev.status}
              </span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => toggleStatus(ev)} title={ev.status === "published" ? "Unpublish" : "Publish"}>
                  {ev.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setEditing(ev); setPosterFile(null); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(ev.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
