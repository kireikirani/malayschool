import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { SCHOOL_LOGO_URL, SCHOOL_NAME, SCHOOL_OG_IMAGE_URL, SCHOOL_SHORT_NAME } from "@/lib/brand";
import { getSettings } from "@/lib/site-settings";
import { THEME_PRESETS } from "@/lib/theme";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://malayschool.vercel.app/"),
  title: {
    default: SCHOOL_NAME,
    template: `%s | ${SCHOOL_SHORT_NAME}`,
  },
  description: `Laman web rasmi ${SCHOOL_NAME}`,
  icons: {
    icon: SCHOOL_LOGO_URL,
  },
  openGraph: {
    title: SCHOOL_NAME,
    description: `Laman web rasmi ${SCHOOL_NAME}`,
    images: [SCHOOL_OG_IMAGE_URL],
    locale: "ms_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const theme = THEME_PRESETS[settings.themeColor] ?? THEME_PRESETS.navy;
  const isCustomTheme = settings.themeColor !== "navy";

  return (
    <html
      lang="ms"
      className={cn("h-full", "antialiased", geistMono.variable, "font-sans", bodyFont.variable, headingFont.variable)}
    >
      <head>
        {isCustomTheme && (
          <style>{`:root { --primary: ${theme.primary}; --primary-foreground: ${theme.primaryFg}; --ring: ${theme.primary}; }`}</style>
        )}
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
