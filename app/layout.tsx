import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AudioEngine from "@/components/player/AudioEngine";
import MiniPlayer from "@/components/player/MiniPlayer";
import PlayerSheet from "@/components/player/PlayerSheet";
import BottomNav from "@/components/shared/BottomNav";
import ServiceWorkerRegister from "@/components/shared/ServiceWorkerRegister";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "ArchBeat",
  title: "ArchBeat",
  description: "Pemutar musik ArchBeat — dengarkan dan cari jutaan lagu.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ArchBeat",
  },
  icons: {
    icon: [{ url: "/favicon.png" }],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} dark`}>
      <body className="bg-base-900 text-base-50 font-sans antialiased overscroll-none">
        <ServiceWorkerRegister />
        <AudioEngine />
        <div className="mx-auto flex min-h-[100dvh] max-w-[560px] flex-col bg-base-900">
          <main className="flex-1 overflow-y-auto pb-[144px]">{children}</main>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[560px]">
          <MiniPlayer />
          <BottomNav />
        </div>
        <PlayerSheet />
      </body>
    </html>
  );
}
