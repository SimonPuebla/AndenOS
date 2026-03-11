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
      <body className="bg-cream text-dark antialiased">{children}</body>
    </html>
  );
}
