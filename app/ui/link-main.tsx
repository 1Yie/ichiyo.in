"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Highlighter, StickyNote, Send } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Social {
  name: string;
  link: string;
  icon: { light: string; dark: string };
}

interface Friend {
  name: string;
  image: string;
  description: string;
  social: Social[];
  pinned?: boolean;
}

// 无动画灰色占位块，用于接口返回空数据时显示
function PlaceholderBlock({ className }: { className: string }) {
  return (
    <div
      className={`${className} bg-gray-300 dark:bg-gray-700 rounded-md select-none`}
      aria-hidden="true"
    />
  );
}

// 虚拟占位骨架屏（无动画版）
function FriendPlaceholder({
  isPinned = false,
  isReversed = false,
}: {
  isPinned?: boolean;
  isReversed?: boolean;
}) {
  if (isPinned) {
    return (
      <div
        className={`flex items-center gap-4 sm:gap-6 ${
          isReversed ? "flex-row-reverse text-right" : "flex-row"
        }`}
      >
        {/* 圆形头像占位 */}
        <div
          className="rounded-full border-2 border-gray-300 dark:border-gray-600 bg-gray-300 dark:bg-gray-700 select-none"
          style={{ width: 150, height: 150 }}
          aria-hidden="true"
        />
        <div
          className={`max-w-lg space-y-2 ${isReversed ? "text-right ml-auto" : ""}`}
        >
          <PlaceholderBlock
            className={`h-6 w-32 ${isReversed ? "ml-auto" : ""}`}
          />
          <PlaceholderBlock
            className={`h-4 w-full max-w-[300px] ${isReversed ? "ml-auto" : ""}`}
          />
          <div
            className={`flex gap-3 ${isReversed ? "justify-end" : "justify-start"}`}
          >
            <PlaceholderBlock className="w-5 h-5 rounded-full" />
            <PlaceholderBlock className="w-5 h-5 rounded-full" />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-40 flex flex-col items-center text-center space-y-2">
        {/* 圆形头像占位 */}
        <div
          className="rounded-full border-2 border-gray-300 dark:border-gray-600 bg-gray-300 dark:bg-gray-700 select-none"
          style={{ width: 90, height: 90 }}
          aria-hidden="true"
        />
        <PlaceholderBlock className="w-20 h-4 mx-auto" />
        <PlaceholderBlock className="w-24 h-3 mx-auto" />
        <div className="flex gap-2 justify-center">
          <PlaceholderBlock className="w-5 h-5 rounded-full" />
          <PlaceholderBlock className="w-5 h-5 rounded-full" />
        </div>
      </div>
    );
  }
}

export default function LinkMain() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/friend")
      .then((res) => {
        if (!res.ok) throw new Error("获取友链失败");
        return res.json();
      })
      .then(
        (
          data: {
            name: string;
            image: string;
            description: string;
            pinned?: boolean;
            socialLinks: {
              name: string;
              link: string;
              iconLight: string;
              iconDark: string;
            }[];
          }[]
        ) => {
          const mapped = data.map((friend) => ({
            name: friend.name,
            image: friend.image,
            description: friend.description,
            pinned: friend.pinned,
            social: friend.socialLinks.map((s) => ({
              name: s.name,
              link: s.link,
              icon: {
                light: s.iconLight,
                dark: s.iconDark,
              },
            })),
          }));
          setFriends(mapped);
        }
      )
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const pinnedFriends = friends.filter((f) => f.pinned);
  const otherFriends = friends.filter((f) => !f.pinned);

  // 是否显示虚拟占位（非加载且对应数组为空）
  const showPinnedPlaceholder = !loading && pinnedFriends.length === 0;
  const showOtherPlaceholder = !loading && otherFriends.length === 0;

  return (
    <>
      <div className="border-b">
        <section className="section-base">
          <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-10 sm:space-y-12">
            {/* pinned 区块 */}
            <h2 className="text-xl sm:text-2xl font-light tracking-widest text-center mb-6 sm:mb-8">
              Respected
            </h2>
            <div className="space-y-8 sm:space-y-10">
              {loading
                ? Array.from({ length: 2 }).map((_, idx) => (
                    <Skeleton
                      key={idx}
                      className={`w-full h-[160px] rounded-lg`}
                    />
                  ))
                : showPinnedPlaceholder
                ? Array.from({ length: 2 }).map((_, idx) => (
                    <FriendPlaceholder key={idx} isPinned isReversed={idx % 2 !== 0} />
                  ))
                : pinnedFriends.map((friend, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 sm:gap-6 ${
                        idx % 2 === 0
                          ? "flex-row"
                          : "flex-row-reverse text-right"
                      }`}
                    >
                      <Image
                        src={friend.image}
                        alt={friend.name}
                        width={90}
                        height={90}
                        className="rounded-full border-2 border-gray-300 object-cover sm:w-[150px] sm:h-[150px]"
                        priority
                      />
                      <div className="max-w-lg">
                        <h3 className="text-xl sm:text-3xl font-semibold">
                          {friend.name}
                        </h3>
                        <p className="mt-1 sm:mt-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                          {friend.description}
                        </p>
                        <div
                          className={`flex mt-3 sm:mt-4 gap-3 ${
                            idx % 2 === 0 ? "justify-start" : "justify-end"
                          }`}
                        >
                          {friend.social.map((social, i) => (
                            <a
                              key={i}
                              href={social.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={social.name}
                            >
                              <Image
                                src={social.icon.light}
                                alt={social.name}
                                width={20}
                                height={20}
                                className="block dark:hidden hover:opacity-80 transition"
                              />
                              <Image
                                src={social.icon.dark}
                                alt={social.name}
                                width={20}
                                height={20}
                                className="hidden dark:block hover:opacity-80 transition"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            {/* other 区块 */}
            <h2 className="text-xl sm:text-2xl font-light tracking-widest text-center mb-6 sm:mb-8">
              Precious
            </h2>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              {loading
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-24 sm:w-40 flex flex-col items-center text-center space-y-2"
                    >
                      <Skeleton className="w-[60px] h-[60px] sm:w-[90px] sm:h-[90px] rounded-full" />
                      <Skeleton className="w-20 h-4" />
                      <Skeleton className="w-24 h-3" />
                      <div className="flex gap-2">
                        <Skeleton className="w-5 h-5 rounded-full" />
                        <Skeleton className="w-5 h-5 rounded-full" />
                      </div>
                    </div>
                  ))
                : showOtherPlaceholder
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <FriendPlaceholder key={idx} />
                  ))
                : otherFriends.map((friend, idx) => (
                    <div
                      key={idx}
                      className="w-24 sm:w-40 flex flex-col items-center text-center"
                    >
                      <Image
                        src={friend.image}
                        alt={friend.name}
                        width={60}
                        height={60}
                        className="rounded-full border-2 border-gray-300 object-cover sm:w-[90px] sm:h-[90px]"
                        priority
                      />
                      <h4 className="mt-2 sm:mt-3 font-semibold text-base sm:text-lg">
                        {friend.name}
                      </h4>
                      <p className="text-gray-500 text-xs sm:text-sm mt-1">
                        {friend.description}
                      </p>
                      <div className="flex mt-2 space-x-3">
                        {friend.social.map((social, i) => (
                          <a
                            key={i}
                            href={social.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.name}
                          >
                            <Image
                              src={social.icon.light}
                              alt={social.name}
                              width={20}
                              height={20}
                              className="block dark:hidden hover:opacity-80 transition"
                            />
                            <Image
                              src={social.icon.dark}
                              alt={social.name}
                              width={20}
                              height={20}
                              className="hidden dark:block hover:opacity-80 transition"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </section>
      </div>

      <div className="border-b">
        <section className="section-base">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <div className="flex flex-col px-4 py-1 sm:px-8 sm:py-2">
                <AccordionTrigger className="p-2 hover:no-underline hover:bg-accent cursor-pointer">
                  <h1 className="text-xl sm:text-2xl font-bold">如何加入友链？</h1>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-decimal pl-6 sm:pl-8 marker:text-gray-400 text-base sm:text-lg text-gray-700 dark:text-gray-300 space-y-1">
                    <li>确保<strong>内容活跃</strong>，有足够的阅读量；</li>
                    <li> <strong>不轻易弃坑</strong>，保持存活与互联网之中；</li>
                    <li>
                      内容要求<strong>不得违反</strong>国家法律法规，
                      <strong>不涉及</strong>政治敏感内容；
                    </li>
                  </ul>
                  <ul className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
                    <li className="relative pl-10 before:content-['OR.'] before:absolute before:left-0 before:text-gray-400">
                      <strong>
                        <em>
                          <s>成为我的朋友 ξ( ✿＞◡❛)；</s>
                        </em>
                      </strong>
                    </li>
                  </ul>
                </AccordionContent>
              </div>
            </AccordionItem>

            <AccordionItem value="item-2">
              <div className="flex flex-col px-4 py-1 sm:px-8 sm:py-2">
                <AccordionTrigger className="p-2 hover:no-underline hover:bg-accent cursor-pointer">
                  <h1 className="text-xl sm:text-2xl font-bold">如何申请友链？</h1>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="text-base sm:text-lg text-gray-700 dark:text-gray-300 break-words">
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <Highlighter className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-1" />
                      <span>
                        <strong>内容包含</strong>：头像、名称、介绍、链接、以及社交账号地址；
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <StickyNote className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-1" />
                      <span>
                        <strong>邮箱主题</strong>：友链申请，我将在第一时间审核并添加到友链栏目中。
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <Send className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-1" />
                      <span>
                        <strong>邮箱地址</strong>：
                        <a
                          href="mailto:me@ichiyo.in"
                          className="hover:underline break-all"
                        >
                          me@ichiyo.in
                        </a>
                      </span>
                    </li>
                  </ul>
                </AccordionContent>
              </div>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </>
  );
}
