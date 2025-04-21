import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConvexClientProvider from "@/components/provider/convex-provider";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/provider/theme-provider";

export const metadata: Metadata = {
  title: "Jotion",
  description: "The Connected workspace where better, faster work happens.",
  icons: [
    {
      media: "(prefers-color-scheme: light)",
      url: "/logo.svg",
      href: "/logo.svg",
    },
    {
      media: "(prefers-color-scheme: dark)",
      url: "/logo-dark.svg",
      href: "/logo-dark.svg",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="jotion-theme"
          >
            {/* <Toaster position="bottom-center" /> */}
            {children}
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
