import type { Metadata } from "next";
import { createTranslator } from "next-intl";
import { getMessages } from "next-intl/server";

import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const messages = await getMessages();
  const i18n = createTranslator({
    locale: params.locale,
    messages,
    namespace: "site",
  });
  return {
    title: `${i18n("title")} | ${i18n("error-404")}`,
  };
}

export default function CatchAllPage() {
  notFound();
}
