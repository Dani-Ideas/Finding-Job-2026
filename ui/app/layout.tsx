import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Job Scraper Dashboard",
  description: "Explorador de ofertas de empleo scrapeadas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
