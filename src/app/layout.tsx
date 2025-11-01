import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AccessibilityWrapper } from "@/components/AccessibilityWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "H.I.T.S. - Hire I.T. Specialists",
  description: "Connect with top IT specialists for your projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <AuthProvider>
          <AccessibilityProvider>
            {children}
            <AccessibilityWrapper />
          </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
