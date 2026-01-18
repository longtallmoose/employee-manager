import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Using Inter for that premium, institutional HR tech feel
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StaffPilot | Workforce Operating System",
  description: "The ultimate UK-compliant employee management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} font-sans antialiased h-full bg-slate-50`}
      >
        {children}
      </body>
    </html>
  );
}