import type { Metadata } from "next";
import Script from "next/script";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const sourceSans = Source_Sans_3({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Развилка",
  description: "Посмотри, куда ведёт каждый выбор",
};

/** Класс темы на <html> до гидрации — без FOUC и без ручного <head><script>. */
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme')||localStorage.getItem('razvilka-landing-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('light');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${sourceSans.variable} ${sourceSerif.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
