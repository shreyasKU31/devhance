import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { WebsiteJsonLd, SoftwareApplicationJsonLd, OrganizationJsonLd } from "@/components/JsonLd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = "https://devhance.in";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "DevHance - Transform GitHub Repos into Professional Case Studies",
    template: "%s | DevHance",
  },
  description: "Stop sending ugly GitHub links. DevHance transforms your repositories into client-winning case studies and investor-grade technical audits in 30 seconds.",
  keywords: [
  "GitHub portfolio generator",
  "GitHub project case study",
  "developer proof of work tool",
  "AI case study generator for developers",
  "SaaS portfolio builder for engineers",
  "GitHub to portfolio converter",
  "AI project analysis tool",
  "VC-style project evaluation",
  "developer credibility platform",
  "AI repo analysis",
  "software engineer portfolio tools",
  "project documentation generator",
  "startup idea validation tool",
  "developer storytelling platform",
  "AI-powered project report generator",
  "tech portfolio enhancement tool",
  "GitHub project insights",
  "developer skills verification tool",
  "Next.js developer portfolio SaaS",
  "AI analysis for coding projects"
],
  authors: [{ name: "DevHance" }],
  creator: "DevHance",
  publisher: "DevHance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "DevHance",
    title: "DevHance - Transform GitHub Repos into Professional Case Studies",
    description: "Stop sending ugly GitHub links. Transform your repositories into client-winning case studies and investor-grade technical audits in 30 seconds.",
    images: [
      {
        url: "/DH Logo.png",
        width: 1200,
        height: 630,
        alt: "DevHance - Transform Your Code into Proof",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevHance - Transform GitHub Repos into Professional Case Studies",
    description: "Stop sending ugly GitHub links. Transform your repositories into client-winning case studies in 30 seconds.",
    images: ["/DH Logo.png"],
    creator: "@devhance",
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
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: baseUrl,
  },
};

export const viewport = {
  themeColor: "#22D3EE",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="apple-touch-icon" href="/DH Logo.png" />
          <WebsiteJsonLd />
          <SoftwareApplicationJsonLd />
          <OrganizationJsonLd />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
        >
          <GoogleAnalytics />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

