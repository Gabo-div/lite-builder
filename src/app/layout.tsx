import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lite Builder",
  description: "Represent your data in a visual and intuitive way",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
