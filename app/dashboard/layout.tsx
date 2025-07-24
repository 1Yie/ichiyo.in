import type { Metadata } from "next";
import { Ubuntu_Sans, Source_Code_Pro, Raleway } from "next/font/google";
import "@/app/globals.css";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/ui/app-sidebar";
import NextTopLoader from "nextjs-toploader";

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
    <html>
      <head>
        <link
          id="favicon"
          rel="icon"
          type="image/svg+xml"
          href="/logo_light.svg"
        />
      </head>
      <body
        className={`antialiased ${ubuntu.className} ${sourceCodePro.className} ${raleway.className}`}
      >
        <SidebarProvider>
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
          <AppSidebar />
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
