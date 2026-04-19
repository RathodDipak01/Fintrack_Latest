import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter", // optional but useful
});

export const metadata: Metadata = {
  title: "Fintrack",
  description: "Fintrack — AI-enhanced portfolio tracking and decision support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}