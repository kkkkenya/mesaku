import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Plus } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  description: string;
  tag: "Announcement" | "Event" | "News" | "Update";
  date: string;
  published: boolean;
  created_at: string;
};

type FormState = {
  id?: string;
  title: string;
  description: string;
  tag: "Announcement" | "Event" | "News" | "Update";
  date: string;
  published: boolean;
};

const blankForm: FormState = {
  title: "",
  description: "",
  tag: "Announcement",
  date: "",
  published: false,
};

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [form, setForm] = useState<FormState>(blankForm);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data ?? []) as Announcement[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const startCreate = () => {
    setForm(blankForm);
    setErrors({});
    setSaveError(null);
    setMode("form");
  };

  const startEdit = (row: Announcement) => {
    setForm({
      id: row.id,
      title: row.title,
      description: row.description,
      tag: row.tag,
      date: row.date,
      published: row.published,
    });
    setErrors({});
    setSaveError(null);
    setMode("form");
  };

  const handleDelete = async (row: Announcement) => {
    if (!confirm("Delete this announcement?")) return;
    await supabase.from("announcements").delete().eq("id", row.id);
    fetchAll();
  };

  const validate = () => {
    const e: { [k: string]: string } = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.date) e.date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      tag: form.tag,
      date: form.date,
      published: form.published,
    };
    const { error } = form.id
      ? await supabase.from("announcements").update(payload).eq("id", form.id)
      : await supabase.from("announcements").insert(payload);
    setSaving(false);
    if (error) {
      setSaveError(error.message);
      return;
    }
    setMode("list");
    fetchAll();
  };

  if (mode === "form") {
    return (
      <div className="max-w-2xl">
        <h1 className="font-heading text-xl md:text-2xl font-bold text-[#1E3A8A] mb-4 md:mb-6">
          {form.id ? "Edit Announcement" : "New Announcement"}
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-input rounded-md h-10 px-3"
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-input rounded-md p-3"
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tag</label>
            <select
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value as FormState["tag"] })}
              className="w-full border border-input rounded-md h-10 px-3 bg-background"
            >
              <option value="Announcement">Announcement</option>
              <option value="Event">Event</option>
              <option value="News">News</option>
              <option value="Update">Update</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-input rounded-md h-10 px-3"
            />
            {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Publish immediately
          </label>

          {saveError && <p className="text-red-600 text-sm">{saveError}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1E3A8A] text-white px-6 h-10 rounded-md font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setMode("list")}
              className="border border-[#1E3A8A] text-[#1E3A8A] px-6 h-10 rounded-md font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
        <h1 className="font-heading text-xl md:text-2xl font-bold text-[#1E3A8A]">
          Announcements
        </h1>
        <button
          onClick={startCreate}
          className="bg-[#1E3A8A] text-white px-3 md:px-4 h-10 rounded-md font-medium flex items-center gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Announcement</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No announcements yet.</p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="md:hidden space-y-3">
            {items.map((row) => (
              <div key={row.id} className="border rounded-lg p-4 bg-card">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-base leading-snug flex-1">
                    {row.title}
                  </h3>
                  <span
                    className={`shrink-0 inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                      row.published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {row.published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span className="inline-block px-2 py-0.5 rounded bg-muted font-medium">
                    {row.tag}
                  </span>
                  <span>
                    {new Date(row.date).toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <button
                    onClick={() => startEdit(row)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-md border text-sm font-medium hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-md border text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Tag</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Published</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-3 font-medium">{row.title}</td>
                    <td className="p-3">{row.tag}</td>
                    <td className="p-3">
                      {new Date(row.date).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          row.published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {row.published ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(row)}
                          className="p-2 hover:bg-muted rounded"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
                          className="p-2 hover:bg-muted rounded text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
