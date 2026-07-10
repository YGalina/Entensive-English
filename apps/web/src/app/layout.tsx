import type { Metadata, Viewport } from "next";
import { Golos_Text, Lora } from "next/font/google";
import Script from "next/script";
import { marina } from "@ie/tokens";
import "./globals.css";

// Дизайн-система «Living Content»: Golos Text — голос интерфейса,
// Lora — голос языка (английские слова, фразы, чтение).
const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Intensive English — интенсив по методу Петрусинского",
  description:
    "Сверхнасыщенный сеанс вместо карточек по одному слову: перегрузка → активизация в контексте → узнавание.",
};

export const viewport: Viewport = {
  themeColor: marina.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${golos.variable} ${lora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
