import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "쭈양이 꾹",
    short_name: "쭈양이 꾹",
    description: "스포원파크 부스 탐색 & QR 스탬프 꾹!",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#F97316",
    icons: [
      {
        src: "/assets/favicon/jjuyang_ggook_favicon_symbol_v2.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/assets/favicon/jjuyang_ggook_favicon_symbol_v2.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
