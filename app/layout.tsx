import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CoachG Client Portal",
  description: "Revenue OS training portal for COACHG clients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${dmSans.variable}`}
    >
      <body className="font-body antialiased">
        <Sidebar />
        <div className="relative z-10 min-h-screen lg:pl-64">
          <main className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-12">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
