"use client";

import { Carousel } from "@/components/ui/carousel";
import TiltedCard from "@/components/ui/tilted-card";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SlideData {
  title: string;
  src: string;
  button?: string;
  link?: string;
}

export default function AboutMain() {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const res = await fetch("/api/site/data");
        if (!res.ok) throw new Error("请求失败");
        const data = await res.json();
        setSlides(data);
      } catch (err) {
        console.error("加载幻灯片数据失败:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadSlides();
  }, []);

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
          <div className="relative overflow-hidden w-full h-full py-20 min-h-[400px] flex items-center justify-center">
            {loading ? (
              <div className="w-[70vmin] h-[70vmin]">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            ) : error ? (
              <div className="text-center text-lg">
                Ops! Not found img data :(
              </div>
            ) : (
              <Carousel slides={slides} />
            )}
          </div>
        </section>
      </div>
    </>
  );
}
