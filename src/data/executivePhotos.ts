// Photos bundled with the original site, keyed by the seeded executive IDs.
// They are shown only while a member has no photo uploaded in the admin
// panel — once an image_url exists in the database it takes priority.
// Files are full-resolution WebP (quality 92): sharp visually lossless
// conversions of the original PNGs, ~94% smaller.
import isaacImg from "@/assets/exec-isaac.webp";
import gregoryImg from "@/assets/exec-gregory.webp";
import wisemanImg from "@/assets/exec-wiseman.webp";
import lewisImg from "@/assets/exec-lewis.webp";
import noelynImg from "@/assets/exec-noelyn.webp";
import teddyImg from "@/assets/exec-teddy.webp";
import gloriaImg from "@/assets/exec-gloria.webp";
import godwinImg from "@/assets/exec-godwin.webp";
import stephenImg from "@/assets/exec-stephen.webp";
import lyneforImg from "@/assets/exec-lyneford.webp";

export const bundledPhotos: Record<string, string> = {
  "2d506c16-4bf5-4e43-a2c3-e75f66e0cd85": isaacImg,
  "caf9340b-3160-4bf8-a215-445c93c45538": gregoryImg,
  "31eebb2f-623e-4d68-8fb8-adb58bea106c": wisemanImg,
  "92519cdd-17a4-4467-8868-3873726828be": lyneforImg,
  "4d91ca50-db83-4ae1-b2b8-2db736a74e8b": godwinImg,
  "11892945-9035-47e2-b8ea-6769b88f6056": lewisImg,
  "0a340510-6896-4e5e-b265-6e34055074dc": stephenImg,
  "c5a6fe83-fc20-408a-8f82-e2d963e0b10f": teddyImg,
  "1f493c33-bb48-4970-a92b-fd3c62e3f55b": gloriaImg,
  "386c7a8a-66ce-4724-9586-8aa795c39d3d": noelynImg,
};
