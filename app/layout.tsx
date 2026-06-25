import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Развилка",
  description: "Посмотри, куда ведёт каждый выбор",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
