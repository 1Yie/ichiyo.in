import type { Metadata } from "next";
import { createTranslator } from "next-intl";
import { getMessages } from "next-intl/server";

import BlogTitle from "@/app/ui/blog-title";
import BlogMain from "@/app/ui/blog-main";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const messages = await getMessages();
  const i18n = createTranslator({
    locale: params.locale,
    messages,
    namespace: "site",
  });

  return {
    title: `${i18n("title")} | ${i18n("blog-title")}`,
  };
}

export default function Blog() {
  return (
    <>
      <BlogTitle />
      <BlogMain />
    </>
  );
}
