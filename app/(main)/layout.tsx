import type { Metadata } from "next";
import { Ubuntu_Sans, Source_Code_Pro, Raleway } from "next/font/google";
import "@/app/globals.css";

import ClientThemeWrapper from "@/app/(main)/client-theme-wrapper";

import NextTopLoader from "nextjs-toploader";
import ImageZoom from "@/ui/img-zoom";
import { Toaster } from "@/components/ui/sonner"

import Header from "@/app/ui/header";
import Footer from "@/app/ui/footer";
import { ThemeProvider } from "next-themes";
import FaviconSwitcher from "@/lib/favicon-switcher";
import { UserProvider } from "@/contexts/user-context";
import { VersionCheckerSSE } from "@/components/version-checker-sse";

export const metadata: Metadata = {
  title: "ichiyo (@1Yie)",
};

const ubuntu = Ubuntu_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="scroll-smooth">
      <body
        className={`antialiased ${ubuntu.className} ${sourceCodePro.className} ${raleway.className}`}
      >
        <ClientThemeWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem enableColorScheme={false}>
            <UserProvider>
              <FaviconSwitcher />
              <VersionCheckerSSE />
              <ImageZoom />
              <NextTopLoader
                color="var(--foreground)"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                zIndex={9999}
                easing="ease"
                speed={200}
                shadow="0 0 10px var(--foreground),0 0 5px var(--foreground)"
              />
              <Header />
              <Toaster richColors position="top-center" />
              {children}
              <Footer />
            </UserProvider>
          </ThemeProvider>
        </ClientThemeWrapper>
      </body>
    </html>
  );
}
