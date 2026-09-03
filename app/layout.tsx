import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { GTMScript } from "@/components/analytics/gtm-script";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Feedme",
  description: "The 5-Page Vertical Snap Bio Reel Platform",
  icons: {
    icon: [
      { url: "/feedm-icon.svg?v=2", type: "image/svg+xml" },
    ],
    shortcut: "/feedm-icon.svg?v=2",
    apple: "/feedm-icon.svg?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" type="image/svg+xml" href="/feedm-icon.svg?v=2" />
        <link rel="apple-touch-icon" href="/feedm-icon.svg?v=2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Montserrat:wght@400;600;700;800;900&family=Outfit:wght@400;600;700;800;900&family=Urbanist:wght@400;600;700;800;900&family=Playfair+Display:wght@400;600;700;800;900&family=Poppins:wght@400;600;700;800;900&family=Rubik:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="h-full font-sans">
        <GTMScript gtmId={process.env.NEXT_PUBLIC_GTM_MARKETING_ID} />
        {children}
      </body>
    </html>
  );
}
