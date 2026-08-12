import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Indian Climate Index — Track Climate Extremes Across India",
  description:
    "The Indian Climate Index tracks the frequency of extreme heat, rainfall, drought, and wind events across India's states and districts, relative to a historical baseline.",
  keywords: [
    "India",
    "climate index",
    "climate change",
    "extreme heat",
    "rainfall",
    "drought",
    "states",
    "districts",
  ],
  openGraph: {
    title: "Indian Climate Index",
    description:
      "Interactive climate data visualization for India — state by state, district by district.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-gray-950 font-sans text-white">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
