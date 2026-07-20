import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Solis Lawyers | Professional Legal Services in Australia",
    template: "%s | Solis Lawyers",
  },
  description:
    "Solis Lawyers provides expert legal services in migration law, criminal law, family law, and conveyancing across Australia. Contact us for professional legal advice.",
  keywords: [
    "Solis Lawyers",
    "Australian lawyers",
    "migration law",
    "criminal law",
    "family law",
    "conveyancing",
    "legal services Australia",
    "immigration lawyer",
  ],
  authors: [{ name: "Solis Lawyers" }],
  creator: "Solis Lawyers",
  metadataBase: new URL("https://solislaw.com.au"),
  openGraph: {
    type: "website",
    locale: "en_AU",
    alternateLocale: "vi_VN",
    url: "https://solislaw.com.au",
    siteName: "Solis Lawyers",
    title: "Solis Lawyers | Professional Legal Services in Australia",
    description:
      "Expert legal services in migration, criminal, family law and conveyancing across Australia.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Solis Lawyers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solis Lawyers | Professional Legal Services",
    description:
      "Expert legal services in migration, criminal, family law and conveyancing across Australia.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
