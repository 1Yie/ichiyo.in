import { useTranslations } from "next-intl";
import SplitText from "@/components/ui/split-text";
import FadeContent from "@/components/ui/fade-content";

export default function BlogTitle() {
  const i18n = useTranslations("blog-title");
  return (
    <div className="border-b">
      <section className="flex justify-center items-start flex-col section-base bg-squares h-[15vh] sm:h-[20vh]">
        <div className="p-4">
          <SplitText
            text={i18n("blog-title")}
            className="text-2xl sm:text-4xl"
            delay={30}
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
            <p className="text-sm sm:text-lg">{i18n("about-sub-title")}</p>
          </FadeContent>
        </div>
      </section>
    </div>
  );
}
