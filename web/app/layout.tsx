import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Playfair_Display, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const heading = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const body = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Happy Wedding",
  description: "Nền tảng thiệp cưới online có trang quản trị",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="vi" className={`${heading.variable} ${body.variable}`}>
        <body className="relative">{children}</body>
      </html>
    </ClerkProvider>
  );
}
