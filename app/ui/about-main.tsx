"use client";

import { use, Suspense } from "react";
import { Carousel } from "@/components/ui/carousel";
import TiltedCard from "@/components/ui/tilted-card";
import { Skeleton } from "@/components/ui/skeleton";
import { request } from "@/hooks/use-request";

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
