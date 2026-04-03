import { Caveat, Quicksand } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Berner Puppy Dagboek",
  description: "Dagboek voor onze Berner Senner puppy — gewicht, voeding, wandelingen en meer."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${caveat.variable} ${quicksand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
