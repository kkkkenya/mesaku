import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Plus, Megaphone } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EmptyState from "@/components/admin/EmptyState";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

const inputCls =
  "w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors";

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
        <AdminPageHeader
          title={form.id ? "Edit Announcement" : "New Announcement"}
          breadcrumb="Announcements"
          subtitle="Share updates, news, and events with the MESA-KU community."
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Annual General Meeting 2026"
              className={inputCls}
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide details, context, or instructions for members…"
              className={`${inputCls} h-auto py-3`}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tag</label>
              <select
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value as FormState["tag"] })}
                className={inputCls}
              >
                <option value="Announcement">Announcement</option>
                <option value="Event">Event</option>
                <option value="News">News</option>
                <option value="Update">Update</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputCls}
              />
              {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-teal focus:ring-teal"
            />
            Publish immediately
          </label>

          {saveError && <p className="text-red-600 text-sm">{saveError}</p>}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={() => setMode("list")}
              className="h-11 px-6 rounded-lg border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none h-11 px-6 rounded-lg bg-teal text-teal-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Announcement"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Announcements"
        breadcrumb="Announcements"
        subtitle="Share updates, news, and events with the MESA-KU community."
        action={
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-teal text-teal-foreground font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Announcement</span>
            <span className="sm:hidden">New</span>
          </button>
        }
      />

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-7 w-7" />}
          title="No announcements yet"
          description="Create your first announcement to keep MESA members informed."
          action={
            <button
              onClick={startCreate}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-teal text-teal-foreground font-semibold hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> New Announcement
            </button>
          }
        />
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="md:hidden space-y-3">
            {items.map((row) => (
              <div
                key={row.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-base leading-snug flex-1 text-slate-900">
                    {row.title}
                  </h3>
                  <StatusPill published={row.published} />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
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
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => startEdit(row)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Tag</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Published</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-t border-slate-100 transition-colors hover:bg-teal-soft/40 ${
                      i % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-xs font-medium text-slate-700">
                        {row.tag}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(row.date).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <YesNoPill yes={row.published} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => startEdit(row)}
                              className="p-2 hover:bg-slate-100 rounded-md text-slate-600"
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleDelete(row)}
                              className="p-2 hover:bg-red-50 rounded-md text-red-600"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
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

function StatusPill({ published }: { published: boolean }) {
  return published ? (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal text-teal-foreground">
      Published
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700">
      Draft
    </span>
  );
}

function YesNoPill({ yes }: { yes: boolean }) {
  return yes ? (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700">
      No
    </span>
  );
}
