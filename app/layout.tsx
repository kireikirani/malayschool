import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { SCHOOL_LOGO_URL, SCHOOL_NAME, SCHOOL_OG_IMAGE_URL } from "@/lib/brand";

const bodyFont = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

const headingFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  axes: ["opsz", "SOFT", "WONK"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL) : undefined,
  title: SCHOOL_NAME,
  description: `Laman web rasmi ${SCHOOL_NAME}`,
  icons: {
    icon: SCHOOL_LOGO_URL,
  },
  openGraph: {
    title: SCHOOL_NAME,
    images: [SCHOOL_OG_IMAGE_URL],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ms"
      className={cn("h-full", "antialiased", geistMono.variable, "font-sans", bodyFont.variable, headingFont.variable)}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
