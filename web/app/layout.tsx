import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Playfair_Display, Be_Vietnam_Pro, Dancing_Script, Great_Vibes } from "next/font/google";
import { Toaster } from "react-hot-toast";
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

const script = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
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
      <html lang="vi" className={`${heading.variable} ${body.variable} ${script.variable}`}>
        <body className="relative">
          <Toaster position="top-center" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
