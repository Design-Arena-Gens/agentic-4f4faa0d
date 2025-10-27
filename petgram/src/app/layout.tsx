import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Petgram | Joyful Social Space for Animal Lovers",
  description:
    "Petgram is the playful-yet-professional social hub where every animal shines. Discover adorable content, connect with fellow caretakers, and share your pet's story with the world.",
  metadataBase: new URL("https://agentic-4f4faa0d.vercel.app"),
  openGraph: {
    title: "Petgram | Joyful Social Space for Animal Lovers",
    description:
      "Share heartwarming animal moments, discover new friends, and celebrate the pet community on Petgram.",
    url: "https://agentic-4f4faa0d.vercel.app",
    type: "website",
    siteName: "Petgram",
  },
  twitter: {
    card: "summary_large_image",
    title: "Petgram | Joyful Social Space for Animal Lovers",
    description:
      "A playful, vibrant home for animal-first stories, videos, and community connections.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased bg-sand-100 text-forest-900`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
