import type { Metadata } from "next";
import { Arvo, Inria_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const arvo = Arvo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700"],
});

const inriaSans = Inria_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Restaurant KPI Dashboard",
  description: "Track restaurant metrics — revenue, labour costs, food costs, and order counts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${arvo.variable} ${inriaSans.variable} font-sans antialiased`}>
<ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
