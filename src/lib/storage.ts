import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "crypto";

export async function uploadFile(bucket: string, file: File, folder: string): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    console.error("Upload error:", error);
    return null;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(bucket: string, path: string) {
  // Extract path from full URL
  const urlParts = path.split(`/storage/v1/object/public/${bucket}/`);
  if (urlParts.length < 2) return;
  await supabase.storage.from(bucket).remove([urlParts[1]]);
}
