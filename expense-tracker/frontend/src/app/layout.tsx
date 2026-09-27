import type { Metadata, Viewport } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { AuthBootstrap } from "@/features/auth/components/AuthBootstrap";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Personal financial intelligence — record, understand, act",
  applicationName: "Expense Tracker",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0d9488",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${geistMono.variable} min-h-dvh antialiased`}
        suppressHydrationWarning
      >
        <AppProviders>
          <AuthBootstrap>{children}</AuthBootstrap>
        </AppProviders>
      </body>
    </html>
  );
}
