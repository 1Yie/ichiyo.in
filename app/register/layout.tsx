import type { Metadata } from "next";

import { Ubuntu_Sans, Source_Code_Pro, Raleway } from "next/font/google";
import "@/app/globals.css";
import ClientThemeWrapper from "./client-wrapper";

import { ThemeProvider } from "next-themes";
import FaviconSwitcher from "@/lib/favicon-switcher";

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
  return (
    <html>
      <body
        className={`antialiased ${ubuntu.className} ${sourceCodePro.className} ${raleway.className}`}
      >
        <ClientThemeWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            enableColorScheme={false}
          >
            <FaviconSwitcher />
            {children}
          </ThemeProvider>
        </ClientThemeWrapper>
      </body>
    </html>
  );
}
