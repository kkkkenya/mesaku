import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, deleteFile } from "@/lib/storage";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  FolderOpen,
  Download,
  Link2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EmptyState from "@/components/admin/EmptyState";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Asset = Tables<"assets">;

const inputCls =
  "w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors";
const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "logo", label: "Logos" },
  { value: "document", label: "Documents" },
  { value: "photo", label: "Photos" },
  { value: "other", label: "Other" },
] as const;

const CATEGORY_LABEL: Record<string, string> = {
  logo: "Logo",
  document: "Document",
  photo: "Photo",
  other: "Other",
};

const ACCEPTED = "image/*,application/pdf";
const MAX_ASSET_BYTES = 10 * 1024 * 1024; // 10 MB

const formatSize = (bytes: number | null) => {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const mimeLabel = (mime: string) => {
  if (mime === "application/pdf") return "PDF";
  if (mime.startsWith("image/")) return mime.replace("image/", "").toUpperCase();
  return mime || "File";
};

const extFromUrl = (url: string) => {
  const clean = url.split("?")[0];
  const ext = clean.split(".").pop();
  return ext && ext.length <= 5 ? ext : "";
};

const isImage = (a: Asset) => a.mime.startsWith("image/");

function AssetThumb({ asset }: { asset: Asset }) {
  const [broken, setBroken] = useState(false);
  if (!isImage(asset) || broken) {
    return (
      <div className="flex h-36 w-full items-center justify-center bg-slate-50 border-b border-slate-100">
        <FileText className="h-10 w-10 text-slate-300" />
      </div>
    );
  }
  return (
    <div className="flex h-36 w-full items-center justify-center overflow-hidden bg-slate-50 border-b border-slate-100">
      <img
        src={asset.file_url}
        alt={asset.name}
        onError={() => setBroken(true)}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}

export default function AdminAssets() {
  const [items, setItems] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Partial<Asset> | null>(null);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load assets: " + error.message);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openNew = () => {
    setEditing({ name: "", category: "other" });
    setFile(null);
    setOriginalUrl(null);
  };

  const openEdit = (item: Asset) => {
    setEditing(item);
    setFile(null);
    setOriginalUrl(item.file_url);
  };

  const closeModal = () => {
    setEditing(null);
    setFile(null);
    setOriginalUrl(null);
  };

  const onFileChange = (f: File | null) => {
    if (f && f.size > MAX_ASSET_BYTES) {
      toast.error("File is larger than 10 MB.");
      return;
    }
    setFile(f);
    // Pre-fill the name from the filename (without extension) for new uploads
    if (f && editing && !editing.id && !editing.name?.trim()) {
      const base = f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      setEditing({ ...editing, name: base });
    }
  };

  const save = async () => {
    if (!editing?.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!editing.id && !file) {
      toast.error("Choose a file to upload");
      return;
    }
    setSaving(true);

    let file_url = editing.file_url || "";
    let mime = editing.mime || "";
    let size_bytes = editing.size_bytes ?? null;
    if (file) {
      const url = await uploadFile("media", file, "assets");
      if (!url) {
        toast.error("Upload failed — the storage bucket may not accept this file type.");
        setSaving(false);
        return;
      }
      file_url = url;
      mime = file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "");
      size_bytes = file.size;
    }

    const payload = {
      name: editing.name.trim(),
      category: editing.category || "other",
      file_url,
      mime,
      size_bytes,
    };

    const result = editing.id
      ? await supabase.from("assets").update(payload).eq("id", editing.id)
      : await supabase.from("assets").insert(payload);

    if (result.error) {
      toast.error("Failed to save: " + result.error.message);
      setSaving(false);
      return;
    }

    // File replaced — clean up the old one in storage
    if (editing.id && originalUrl && originalUrl !== file_url) {
      await deleteFile("media", originalUrl);
    }

    toast.success(editing.id ? "Asset updated" : "Asset uploaded");
    closeModal();
    setSaving(false);
    fetchItems();
  };

  const remove = async (item: Asset) => {
    if (!confirm(`Delete "${item.name}" permanently?`)) return;
    const { error } = await supabase.from("assets").delete().eq("id", item.id);
    if (error) {
      toast.error("Failed to delete: " + error.message);
      return;
    }
    await deleteFile("media", item.file_url);
    toast.success("Asset deleted");
    fetchItems();
  };

  const download = async (item: Asset) => {
    setDownloading(item.id);
    try {
      const res = await fetch(item.file_url);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const ext = extFromUrl(item.file_url);
      link.download = ext ? `${item.name}.${ext}` : item.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in a new tab so the browser handles it
      window.open(item.file_url, "_blank", "noopener");
    } finally {
      setDownloading(null);
    }
  };

  const copyLink = async (item: Asset) => {
    try {
      await navigator.clipboard.writeText(item.file_url);
      toast.success("Link copied — paste it into your newsletter or poster");
    } catch {
      toast.error("Couldn't copy the link. Long-press the file to copy it.");
    }
  };

  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);
  const countFor = (c: string) => (c === "all" ? items.length : items.filter((i) => i.category === c).length);

  return (
    <div className="max-w-5xl">
      <AdminPageHeader
        title="Assets"
        breadcrumb="Assets"
        subtitle="Logos, photos, and documents (PDF) for newsletters, posters, and posts — download or copy a link anytime."
        action={
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-teal text-teal-foreground font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="h-4 w-4" /> Upload Asset
          </button>
        }
      />

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-heading text-xl font-bold text-slate-900">
                {editing.id ? "Edit" : "Upload"} Asset
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className={labelCls}>Name</label>
              <input
                className={inputCls}
                placeholder="e.g. MESA Logo (white)"
                value={editing.name || ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Category</label>
              <select
                className={inputCls}
                value={editing.category || "other"}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              >
                {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>{editing.id ? "Replace file (optional)" : "File"}</label>
              {editing.id && !file && (
                <p className="text-sm text-slate-500 mb-2">
                  Current file: {mimeLabel(editing.mime)} {formatSize(editing.size_bytes)}
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal file:text-teal-foreground file:font-semibold file:cursor-pointer"
              />
              {file && (
                <p className="mt-1.5 text-xs text-slate-500">
                  {file.name} · {formatSize(file.size)}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1.5">
                Images (PNG, JPG, SVG) or PDF, up to 10 MB.
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
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing.id ? "Save Changes" : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilter(c.value)}
              className={`h-9 px-4 rounded-full text-sm font-semibold transition-colors ${
                filter === c.value
                  ? "bg-teal text-teal-foreground"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {c.label} <span className="opacity-60">{countFor(c.value)}</span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-teal" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-7 w-7" />}
          title={filter === "all" ? "No assets yet" : `No ${CATEGORY_LABEL[filter]?.toLowerCase() + "s"} yet`}
          description="Upload logos, photos, and PDFs here so the whole team can grab them for newsletters and posters."
          action={
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-teal text-teal-foreground font-semibold hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Upload Asset
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <div
              key={item.id}
              className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <AssetThumb asset={item} />
              <div className="p-4 flex flex-col flex-1">
                <p className="font-semibold text-slate-900 truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {CATEGORY_LABEL[item.category] ?? item.category} · {mimeLabel(item.mime)}
                  {item.size_bytes != null ? ` · ${formatSize(item.size_bytes)}` : ""}
                </p>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => download(item)}
                        aria-label="Download"
                        className="h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                      >
                        {downloading === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Download</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => copyLink(item)}
                        aria-label="Copy link"
                        className="h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                      >
                        <Link2 className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Copy link</TooltipContent>
                  </Tooltip>
                  <span className="flex-1" />
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
