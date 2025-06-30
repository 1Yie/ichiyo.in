import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Ubuntu_Sans, Source_Code_Pro, Raleway } from "next/font/google";
import "@/app/globals.css";

import ClientThemeWrapper from '@/ui/clientTheme-wrapper';

import { NextIntlClientProvider } from "next-intl";
import NextTopLoader from "nextjs-toploader";

import Header from "@/app/ui/header";
import Footer from "@/app/ui/footer";

export const metadata: Metadata = {
  title: "ichiyo (@1Yie)",
  description: "Hi! I am ichiyo",
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
  const locale = await getLocale();

  return (
    <html  lang={locale}>
      <body 
        className={`antialiased ${ubuntu.className} ${sourceCodePro.className} ${raleway.className}`}
      >
        <ClientThemeWrapper>
          <NextIntlClientProvider>
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
            {children}
            <Footer />
          </NextIntlClientProvider>
        </ClientThemeWrapper>
      </body>
    </html>
  );
}
