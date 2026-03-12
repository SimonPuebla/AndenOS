import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Andén — Constituí tu empresa en Argentina",
  description:
    "Plataforma guiada para constituir tu empresa en Argentina con acceso a la Ley de Economía del Conocimiento y la Zona Franca Digital Mendoza.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream text-dark antialiased">{children}</body>
    </html>
  );
}
