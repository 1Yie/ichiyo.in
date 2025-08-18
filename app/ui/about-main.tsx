"use client";

import { use, Suspense } from "react";
import { Carousel } from "@/components/ui/carousel";
import TiltedCard from "@/components/ui/tilted-card";
import { Skeleton } from "@/components/ui/skeleton";
import { request } from "@/hooks/use-request";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiHtml5,
  SiCss3,
  SiJavascript,
  SiVuedotjs,
  SiNodedotjs,
  SiMysql,
} from "react-icons/si";

import { RiJavaLine } from "react-icons/ri";

import BunLogo from "@/public/img/wordmark.svg";

interface SlideData {
  title: string;
  src: string;
  button?: string;
  link?: string;
}

const getSlides = request<SlideData[]>("/api/pic");

function SlidesLoader() {
  const slides = use(getSlides);

  return (
    <div className="relative overflow-hidden w-full h-full py-20 min-h-[400px] flex items-center justify-center">
      <Carousel slides={slides} />
    </div>
  );
}

function SkillStack() {
  const skills = [
    {
      name: "HTML",
      icon: <SiHtml5 className="w-6 h-6 sm:w-12 sm:h-12 text-orange-400" />,
    },
    {
      name: "CSS",
      icon: <SiCss3 className="w-6 h-6 sm:w-12 sm:h-12 text-blue-400" />,
    },
    {
      name: "JavaScript",
      icon: (
        <SiJavascript className="w-6 h-6 sm:w-12 sm:h-12 text-yellow-400" />
      ),
    },
    {
      name: "TypeScript",
      icon: <SiTypescript className="w-6 h-6 sm:w-12 sm:h-12 text-blue-500" />,
    },
    {
      name: "Tailwind CSS",
      icon: <SiTailwindcss className="w-6 h-6 sm:w-12 sm:h-12 text-sky-400" />,
    },
    {
      name: "React",
      icon: <SiReact className="w-6 h-6 sm:w-12 sm:h-12 text-cyan-400" />,
    },
    {
      name: "Vue",
      icon: <SiVuedotjs className="w-6 h-6 sm:w-12 sm:h-12 text-green-600" />,
    },
    {
      name: "Next.js",
      icon: (
        <SiNextdotjs className="w-6 h-6 sm:w-12 sm:h-12 text-black dark:text-white" />
      ),
    },
    {
      name: "Node.js",
      icon: <SiNodedotjs className="w-6 h-6 sm:w-12 sm:h-12 text-green-700" />,
    },
    {
      name: "Bun",
      icon: (
        <BunLogo className="w-6 h-6 sm:w-12 sm:h-12 text-accent-foreground" />
      ),
    },
    {
      name: "Java",
      icon: <RiJavaLine className="w-6 h-6 sm:w-12 sm:h-12 text-red-500" />,
    },
    {
      name: "MySQL",
      icon: <SiMysql className="w-6 h-6 sm:w-12 sm:h-12 text-yellow-500" />,
    },
  ];

  return (
    <div className="border-b">
      <section className="section-base bg-accent/10 relative">
        <div className="p-2 max-w-xl mx-auto relative">
          {/* 技能标题 */}
          <div className="text-center mb-6">
            <span className="text-background font-medium text-2xl bg-accent-foreground px-4 py-1">
              技术栈
            </span>
          </div>
          {/* 九宫格 */}
          <div className="grid grid-cols-3 gap-0 relative z-10">
            {skills.map((skill, index, arr) => {
              const cols = 3;
              const total = arr.length;
              const lastRowStart = Math.floor((total - 1) / cols) * cols;
              const isLastRow = index >= lastRowStart;
              return (
                <div
                  key={index}
                  className={`
                    aspect-square flex flex-col items-center hover:bg-accent/50 transition-colors duration-300 justify-center
                    border-gray-300 dark:border-gray-800 border-dashed
                    ${index % cols !== cols - 1 ? "border-r" : ""}
                    ${!isLastRow ? "border-b" : ""}
                  `}
                >
                  {skill.icon}
                  <span className="text-sm mt-1">{skill.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AboutMain() {
  return (
    <>
      <div className="border-b">
        <section className="section-base">
          <div className="flex flex-col p-12 gap-5">
            <TiltedCard
              imageSrc="https://dn-qiniu-avatar.qbox.me/avatar/d81d2d77f4683131d6bca4c3b5e5ab39?s=128&d=identicon"
              containerHeight="100px"
              containerWidth="100px"
              imageHeight="100px"
              imageWidth="100px"
              rotateAmplitude={20}
              scaleOnHover={1.1}
              showMobileWarning={false}
              showTooltip={false}
            />

            <div className="flex flex-col gap-2">
              <span>
                <h1 className="inline-block text-4xl mr-2 font-bold">ichiyo</h1>
                <h1 className="inline-block text-lg">
                  取自罗马音一葉（Ichiyō）为名。
                </h1>
              </span>
            </div>
          </div>
        </section>
      </div>

      <SkillStack />

      <div className="border-b">
        <section className="section-base">
          <Suspense
            fallback={
              <div className="relative overflow-hidden w-full h-full py-20 min-h-[400px] flex items-center justify-center">
                <div className="w-[70vmin] h-[70vmin]">
                  <Skeleton className="w-full h-full rounded-xl" />
                </div>
              </div>
            }
          >
            <SlidesLoader />
          </Suspense>
        </section>
      </div>
    </>
  );
}
