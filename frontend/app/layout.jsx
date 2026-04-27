import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter", // optional but useful
});

import { SettingsProvider } from "@/context/settings-context";

export const metadata = {
  title: "Fintrack",
  description: "Fintrack — AI-enhanced portfolio tracking and decision support",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>

        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
