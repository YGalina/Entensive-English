import type { MetadataRoute } from "next";
import { marina } from "@ie/tokens";

// PWA-манифест: приложение ставится на телефон с домашнего экрана
// (Поделиться → «На экран Домой») и открывается без браузерной рамки.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Intensive English — интенсив по методу Петрусинского",
    short_name: "Intensive English",
    description:
      "Сверхнасыщенный сеанс вместо карточек по одному слову: перегрузка → активизация в контексте → узнавание.",
    start_url: "/",
    display: "standalone",
    background_color: marina.color.light.bg,
    theme_color: marina.themeColor,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
