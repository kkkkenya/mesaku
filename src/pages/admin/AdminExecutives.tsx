import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, deleteFile } from "@/lib/storage";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  Archive,
  ArchiveRestore,
  ChevronUp,
  ChevronDown,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EmptyState from "@/components/admin/EmptyState";
import ArchiveTabs from "@/components/admin/ArchiveTabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { bundledPhotos } from "@/data/executivePhotos";

type Exec = Tables<"executives">;

const inputCls =
  "w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors";
const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

const photoFor = (exec: Exec) => exec.image_url ?? bundledPhotos[exec.id] ?? null;

export default function AdminExecutives() {
  const [items, setItems] = useState<Exec[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Exec> | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [reordering, setReordering] = useState<string | null>(null);
  const [view, setView] = useState<"active" | "archived">("active");

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("executives")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast.error("Failed to load executives: " + error.message);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openNew = () => {
    const nextIndex = Math.max(0, ...items.map((i) => i.order_index)) + 1;
    setEditing({ name: "", role: "", order_index: nextIndex });
    setImageFile(null);
    setPreviewUrl(null);
    setOriginalUrl(null);
  };

  const openEdit = (item: Exec) => {
    setEditing(item);
    setImageFile(null);
    setPreviewUrl(null);
    setOriginalUrl(item.image_url ?? null);
  };

  const closeModal = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setEditing(null);
    setImageFile(null);
    setPreviewUrl(null);
    setOriginalUrl(null);
  };

  const onFileChange = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const save = async () => {
    if (!editing?.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!editing?.role?.trim()) {
      toast.error("Position is required");
      return;
    }
    setSaving(true);

    let image_url = editing.image_url ?? null;
    if (imageFile) {
      const url = await uploadFile("media", imageFile, "executives");
      if (!url) {
        toast.error("Photo upload failed — please try again.");
        setSaving(false);
        return;
      }
      image_url = url;
    }

    const payload = {
      name: editing.name.trim(),
      role: editing.role.trim(),
      image_url,
    };

    const result = editing.id
      ? await supabase.from("executives").update(payload).eq("id", editing.id)
      : await supabase.from("executives").insert(payload);

    if (result.error) {
      toast.error("Failed to save: " + result.error.message);
      setSaving(false);
      return;
    }

    // Photo replaced or removed — clean up the old file in storage.
    if (originalUrl && originalUrl !== image_url) {
      await deleteFile("media", originalUrl);
    }

    toast.success(editing.id ? "Executive updated" : "Executive added");
    closeModal();
    setSaving(false);
    fetchItems();
  };

  const move = async (item: Exec, direction: -1 | 1) => {
    const sorted = [...items].sort((a, b) => a.order_index - b.order_index);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const targetIdx = idx + direction;
    const target = sorted[targetIdx];
    if (!target) return;

    setReordering(item.id);
    // Renumber both rows from their positions so duplicates can't stick.
    const updates = [
      supabase.from("executives").update({ order_index: idx + 1 }).eq("id", target.id),
      supabase.from("executives").update({ order_index: targetIdx + 1 }).eq("id", item.id),
    ];
    const results = await Promise.all(updates);
    setReordering(null);
    if (results.some((r) => r.error)) {
      toast.error("Failed to reorder: " + results.find((r) => r.error)?.error?.message);
      return;
    }
    fetchItems();
  };

  const toggleArchive = async (item: Exec) => {
    const next = !item.archived;
    const { error } = await supabase.from("executives").update({ archived: next }).eq("id", item.id);
    if (error) {
      toast.error("Failed to update: " + error.message);
      return;
    }
    toast.success(next ? "Executive archived — hidden from the public site" : "Executive restored");
    fetchItems();
  };

  const remove = async (item: Exec) => {
    if (!confirm(`Delete ${item.name} permanently?`)) return;
    const { error } = await supabase.from("executives").delete().eq("id", item.id);
    if (error) {
      toast.error("Failed to delete: " + error.message);
      return;
    }
    if (item.image_url) await deleteFile("media", item.image_url);
    fetchItems();
  };

  const archivedItems = items.filter((i) => i.archived);
  const activeItems = items.filter((i) => !i.archived);
  const visible = view === "archived" ? archivedItems : activeItems;

  const modalPhoto = imageFile
    ? previewUrl
    : editing?.image_url
      ? editing.image_url
      : editing?.id
        ? photoFor(editing as Exec)
        : null;

  return (
    <div className="max-w-5xl">
      <AdminPageHeader
        title="Executive Board"
        breadcrumb="Executives"
        subtitle="Manage the leadership team shown on the homepage — update names, positions, and photos, or add new members."
        action={
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-teal text-teal-foreground font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Executive
          </button>
        }
      />

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-heading text-xl font-bold text-slate-900">
                {editing.id ? "Edit" : "New"} Executive
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className={labelCls}>Full Name</label>
              <input
                className={inputCls}
                placeholder="e.g. Jane Wanjiku"
                value={editing.name || ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Position</label>
              <input
                className={inputCls}
                placeholder="e.g. Chairperson"
                value={editing.role || ""}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Photo</label>
              {modalPhoto && (
                <div className="relative inline-block mb-2">
                  <img
                    src={modalPhoto}
                    alt=""
                    className="h-40 w-[120px] object-cover object-top rounded-md border border-slate-200"
                  />
                  <button
                    onClick={() => {
                      onFileChange(null);
                      setEditing({ ...editing, image_url: null });
                    }}
                    className="absolute -top-2 -right-2 h-6 w-6 inline-flex items-center justify-center rounded-full bg-slate-900 text-white hover:bg-red-600 shadow"
                    aria-label="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal file:text-teal-foreground file:font-semibold file:cursor-pointer"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Portrait photos work best (3:4). Leave empty to show a placeholder.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={closeModal}
                className="h-11 px-6 rounded-lg border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center h-11 px-6 rounded-lg bg-teal text-teal-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Executive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && items.length > 0 && (
        <ArchiveTabs
          view={view}
          onChange={setView}
          activeCount={activeItems.length}
          archivedCount={archivedItems.length}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-teal" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={view === "archived" ? <Archive className="h-7 w-7" /> : <Users className="h-7 w-7" />}
          title={view === "archived" ? "Archive is empty" : "No executives yet"}
          description={
            view === "archived"
              ? "Archived members are hidden from the homepage but kept here for future reference."
              : "Add the first board member — they will appear in the Executive Board section on the homepage."
          }
          action={
            view === "archived" ? undefined : (
              <button
                onClick={openNew}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-teal text-teal-foreground font-semibold hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Add Executive
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {visible.map((item, idx) => (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${
                item.archived ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                {photoFor(item) ? (
                  <img
                    src={photoFor(item)!}
                    alt=""
                    className={`h-14 w-14 sm:h-16 sm:w-16 object-cover object-top rounded-lg shrink-0 ${
                      item.archived ? "grayscale" : ""
                    }`}
                  />
                ) : (
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <UserRound className="h-6 w-6 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500 truncate">{item.role}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {!item.archived && (
                  <div className="flex sm:flex-col gap-0.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => move(item, -1)}
                          disabled={idx === 0 || reordering !== null}
                          aria-label="Move up"
                          className="h-6 w-9 sm:h-6 sm:w-7 inline-flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-25 disabled:hover:bg-transparent"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Move up</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => move(item, 1)}
                          disabled={idx === visible.length - 1 || reordering !== null}
                          aria-label="Move down"
                          className="h-6 w-9 sm:h-6 sm:w-7 inline-flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-25 disabled:hover:bg-transparent"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Move down</TooltipContent>
                    </Tooltip>
                  </div>
                )}
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleArchive(item)}
                        aria-label={item.archived ? "Restore from archive" : "Archive"}
                        className="h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                      >
                        {item.archived ? (
                          <ArchiveRestore className="h-4 w-4" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{item.archived ? "Restore" : "Archive"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => openEdit(item)}
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
                        onClick={() => remove(item)}
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
