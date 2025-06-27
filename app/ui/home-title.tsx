import { useTranslations } from "next-intl";
import SplitText from "@/components/ui/split-text";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import FadeContent from "@/components/ui/fade-content";

export default function Home() {
  const i18n = useTranslations("home-title");
  return (
    <div className="border-b">
      <section className="section-base p-3 bg-squares h-[40vh] sm:h-[60vh]">
        <div className="flex flex-col justify-center items-center min-h-full text-center font-bold font-kinghwa">
          <SplitText
            text={i18n("home-title")}
            className="text-3xl sm:text-5xl"
            delay={40}
            duration={0.6}
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
            <p className="text-2xl sm:text-4xl text-gray-400 m-2 sm:m-5">
              {i18n("hr")}
            </p>
          </FadeContent>
          <ContainerTextFlip
            className="h-[5.5vh]"
            textClassName="text-3xl sm:text-5xl leading-none m-0 text-primary"
            interval={4000}
            words={[
              i18n("text-1"),
              i18n("text-2"),
              i18n("text-3"),
              i18n("text-4"),
              i18n("text-5"),
              i18n("text-6"),
              i18n("text-7"),
              i18n("text-8"),
            ]}
          />
        </div>
      </section>
    </div>
  );
}
