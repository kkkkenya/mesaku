import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, X } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Merch = Tables<"merchandise">;

export default function AdminMerchandise() {
  const [items, setItems] = useState<Merch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Merch> | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("merchandise")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openNew = () => {
    setEditing({ name: "", description: "", price: 0, status: "draft", stock_status: "in_stock", featured: false });
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
    };

    if (editing.id) {
      await supabase.from("merchandise").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("merchandise").insert(payload);
    }

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

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await supabase.from("merchandise").delete().eq("id", id);
    fetchItems();
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
        <h1 className="font-heading text-2xl font-bold">Merchandise</h1>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> New Item
        </Button>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">{editing.id ? "Edit" : "New"} Item</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <Input placeholder="Name" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <Textarea placeholder="Description" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <Input type="number" placeholder="Price (KSh)" value={editing.price ?? ""} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} />
            <Input placeholder="Order URL (optional)" value={editing.order_url || ""} onChange={(e) => setEditing({ ...editing, order_url: e.target.value })} />
            <div>
              <label className="text-sm font-medium">Product Image</label>
              {editing.image_url && !imageFile && (
                <img src={editing.image_url} alt="" className="h-32 object-cover rounded-md mb-2" />
              )}
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>
            <select
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
              value={editing.stock_status || "in_stock"}
              onChange={(e) => setEditing({ ...editing, stock_status: e.target.value })}
            >
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="pre_order">Pre-order</option>
            </select>
            <select
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
              value={editing.status || "draft"}
              onChange={(e) => setEditing({ ...editing, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.featured ?? false} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
              Featured
            </label>
            <Button onClick={save} disabled={saving} className="w-full h-12">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No merchandise yet. Add your first item!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-card rounded-lg border">
              {item.image_url && (
                <img src={item.image_url} alt="" className="h-16 w-16 object-cover rounded-md shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  KSh {item.price?.toLocaleString() ?? "—"} · {item.stock_status}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {item.status}
              </span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => toggleStatus(item)}>
                  {item.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setEditing(item); setImageFile(null); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(item.id)}>
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
