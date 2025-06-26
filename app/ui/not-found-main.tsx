import Link from "next/link";
import { useTranslations } from "next-intl";
import SplitText from "@/components/ui/split-text";
import FadeContent from "@/components/ui/fade-content";

export default function NotFoundMain() {
  const i18n = useTranslations("error-404");
  return (
    <div className="border-b">
      <section className="flex flex-col justify-center items-center section-base bg-squares h-[50vh] sm:h-[65vh]">
        <div className="flex-initial flex-col p-6 text-center">
          <SplitText
            text={i18n("title")}
            className="text-3xl sm:text-5xl mb-4"
            delay={60}
            duration={0.4}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
          />

          <FadeContent
            blur={true}
            duration={420}
            easing="ease-out"
            initialOpacity={0}
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 sm:text-lg mb-4">
              {i18n("sub-title")}
            </p>
            <Link
              href="/"
              className="text-sm text-gray-800 dark:text-gray-300 sm:text-lg hover:underline"
            >
              {i18n("back-link")}
            </Link>
          </FadeContent>
        </div>
      </section>
    </div>
  );
}
