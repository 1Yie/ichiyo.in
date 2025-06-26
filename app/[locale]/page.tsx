import { createTranslator } from "next-intl";
import { getMessages } from "next-intl/server";
import type { Metadata } from "next";
import Home from "@/app/ui/home-title";
import HomeProject from "@/app/ui/home-project";

export async function generateMetadata(
  props: Promise<{ params: { locale: string } }>
): Promise<Metadata> {
  const { params } = await props;
  const messages = await getMessages();
  const i18n = createTranslator({
    
    locale: params.locale,
    messages,
    namespace: "site",
  });

  return {
    title: i18n("root-title"),
  };
}

export default function HomePage() {
  return (
    <>
      <Home />
      <HomeProject />
    </>
  );
}
