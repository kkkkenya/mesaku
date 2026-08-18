import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, X, ShoppingBag, Archive, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EmptyState from "@/components/admin/EmptyState";
import ArchiveTabs from "@/components/admin/ArchiveTabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Merch = Tables<"merchandise">;

const inputCls =
  "w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors";
const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

export default function AdminMerchandise() {
  const [items, setItems] = useState<Merch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Merch> | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [view, setView] = useState<"active" | "archived">("active");

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("merchandise")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openNew = () => {
    setEditing({
      name: "",
      description: "",
      price: 0,
      status: "draft",
      stock_status: "in_stock",
      featured: false,
    });
    setImageFile(null);
  };

  const save = async () => {
    if (!editing?.name) return;
    setSaving(true);

    let image_url = editing.image_url || null;
    if (imageFile) {
      const url = await uploadFile("media", imageFile, "merchandise");
      if (url) image_url = url;
    }

    const payload = {
      name: editing.name!,
      description: editing.description || null,
      price: editing.price ?? null,
      order_url: editing.order_url || null,
      image_url,
      status: editing.status || "draft",
      stock_status: editing.stock_status || "in_stock",
      featured: editing.featured ?? false,
      archived: editing.archived ?? false,
    };

    const result = editing.id
      ? await supabase.from("merchandise").update(payload).eq("id", editing.id)
      : await supabase.from("merchandise").insert(payload);

    if (result.error) {
      toast.error("Failed to save item: " + result.error.message);
      setSaving(false);
      return;
    }

    toast.success(editing.id ? "Item updated" : "Item created");
    setSaving(false);
    setEditing(null);
    setImageFile(null);
    fetchItems();
  };

  const toggleStatus = async (item: Merch) => {
    const newStatus = item.status === "published" ? "draft" : "published";
    await supabase.from("merchandise").update({ status: newStatus }).eq("id", item.id);
    fetchItems();
  };

  const toggleArchive = async (item: Merch) => {
    const next = !item.archived;
    const { error } = await supabase.from("merchandise").update({ archived: next }).eq("id", item.id);
    if (error) {
      toast.error("Failed to update: " + error.message);
      return;
    }
    toast.success(next ? "Item archived" : "Item restored");
    fetchItems();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await supabase.from("merchandise").delete().eq("id", id);
    fetchItems();
  };

  const archivedItems = items.filter((i) => i.archived);
  const activeItems = items.filter((i) => !i.archived);
  const visible = view === "archived" ? archivedItems : activeItems;

  return (
    <div className="max-w-5xl">
      <AdminPageHeader
        title="Merchandise"
        breadcrumb="Merchandise"
        subtitle="Manage MESA-branded items — set prices, stock status, and product images."
        action={
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-teal text-teal-foreground font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="h-4 w-4" /> New Item
          </button>
        }
      />

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-heading text-xl font-bold text-slate-900">
                {editing.id ? "Edit" : "New"} Item
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className={labelCls}>Item Name</label>
              <input
                className={inputCls}
                placeholder="e.g. MESA-KU Hoodie"
                value={editing.name || ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                className={`${inputCls} h-auto py-3`}
                rows={3}
                placeholder="Materials, sizes, fit notes…"
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Price (KSh)</label>
                <input
                  className={inputCls}
                  type="number"
                  placeholder="e.g. 1500"
                  value={editing.price ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className={labelCls}>Stock Status</label>
                <select
                  className={inputCls}
                  value={editing.stock_status || "in_stock"}
                  onChange={(e) => setEditing({ ...editing, stock_status: e.target.value })}
                >
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="pre_order">Pre-order</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Order URL (optional)</label>
              <input
                className={inputCls}
                placeholder="https://forms.gle/…"
                value={editing.order_url || ""}
                onChange={(e) => setEditing({ ...editing, order_url: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Product Image</label>
              {editing.image_url && !imageFile && (
                <img
                  src={editing.image_url}
                  alt=""
                  className="h-32 object-cover rounded-md mb-2 border border-slate-200"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal file:text-teal-foreground file:font-semibold file:cursor-pointer"
              />
            </div>

            <div>
              <label className={labelCls}>Visibility</label>
              <select
                className={inputCls}
                value={editing.status || "draft"}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editing.featured ?? false}
                onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-teal focus:ring-teal"
              />
              Mark as featured
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.archived ?? false}
                onChange={(e) => setEditing({ ...editing, archived: e.target.checked })}
                className="h-4 w-4 accent-teal"
              />
              <span className="text-sm font-semibold text-slate-700">
                Archived
                <span className="block text-xs font-normal text-slate-500">
                  Hidden from the shop, shown in the public archive.
                </span>
              </span>
            </label>

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
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Item"}
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
          icon={view === "archived" ? <Archive className="h-7 w-7" /> : <ShoppingBag className="h-7 w-7" />}
          title={view === "archived" ? "Archive is empty" : "No merchandise yet"}
          description={
            view === "archived"
              ? "Archived products will appear here and stay visible in the public archive."
              : "Add your first product to start showcasing MESA-branded items."
          }
          action={
            view === "archived" ? undefined : (
              <button
                onClick={openNew}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-teal text-teal-foreground font-semibold hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> New Item
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {visible.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${
                item.archived ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt=""
                    className={`h-14 w-14 sm:h-16 sm:w-16 object-cover rounded-lg shrink-0 ${
                      item.archived ? "grayscale" : ""
                    }`}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500 truncate">
                    KSh {item.price?.toLocaleString() ?? "—"} · {item.stock_status}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    item.archived
                      ? "bg-slate-200 text-slate-600"
                      : item.status === "published"
                        ? "bg-teal text-teal-foreground"
                        : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {item.archived ? "archived" : item.status}
                </span>
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
                        onClick={() => toggleStatus(item)}
                        aria-label={item.status === "published" ? "Unpublish" : "Publish"}
                        className="h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                      >
                        {item.status === "published" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {item.status === "published" ? "Unpublish" : "Publish"}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          setEditing(item);
                          setImageFile(null);
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
                        onClick={() => remove(item.id)}
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
