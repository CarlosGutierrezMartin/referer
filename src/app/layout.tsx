import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Referer - La Capa de Verdad para el Video Online",
  description: "Vincula fuentes bibliográficas y evidencias a momentos exactos de tus videos. La plataforma para creadores que valoran la credibilidad sobre el clickbait.",
  keywords: ["fuentes", "bibliografía", "YouTube", "verificación", "credibilidad", "fact-checking"],
  authors: [{ name: "Referer" }],
  openGraph: {
    title: "Referer - La Capa de Verdad para el Video Online",
    description: "Vincula fuentes bibliográficas y evidencias a momentos exactos de tus videos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
