import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mushroom Field Notes",
  description:
    "A personal mushroom field guide generated from your own photographs using Gemini 3.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="field-guide-shell antialiased">{children}</body>
    </html>
  );
}

