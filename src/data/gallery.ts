import gallery1 from "@/assets/gallery/gallery-1.jpg";
import gallery2 from "@/assets/gallery/gallery-2.jpg";
import gallery3 from "@/assets/gallery/gallery-3.jpg";
import gallery4 from "@/assets/gallery/gallery-4.jpg";
import gallery5 from "@/assets/gallery/gallery-5.jpg";
import gallery6 from "@/assets/gallery/gallery-6.jpg";

export interface GalleryImage {
  src: string;
  name: string;
}

export const DRIVE_FOLDER_URL =
  "https://drive.google.com/drive/folders/1QQne18fymmmIZZFYGypddydKLPfoAjYd?usp=drive_link";

// Single source of truth for gallery images.
// To add/remove images: drop a file in src/assets/gallery/ and update this list.
export const galleryImages: GalleryImage[] = [
  { src: gallery1, name: "Computer Lab Session" },
  { src: gallery2, name: "Team Collaboration" },
  { src: gallery3, name: "Lecture Hall" },
  { src: gallery4, name: "Graduate School Building" },
  { src: gallery5, name: "Workshop Session" },
  { src: gallery6, name: "Students Having Fun" },
];
