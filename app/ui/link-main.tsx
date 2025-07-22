import { Highlighter, StickyNote, Send } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function LinkMain() {
  return (
    <>
      <div className="border-b">
        <section className="section-base">
          <h1>滚动条</h1>
        </section>
      </div>
      <div className="border-b">
        <section className="section-base">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <div className="flex flex-col px-8 py-6">
                <AccordionTrigger className="p-2 hover:no-underline hover:bg-accent cursor-pointer">
                  <h1 className="text-3xl font-bold">如何加入友链？</h1>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-[decimal] pl-8 marker:text-gray-400 text-lg text-gray-700 dark:text-gray-300">
                    <li>
                      确保<strong>内容活跃</strong>，有足够的阅读量；
                    </li>
                    <li>
                      <strong>不轻易弃坑</strong>，保持存活与互联网之中
                    </li>
                    <li>
                      确保网页链接为 <strong>HTTPS</strong>；
                    </li>
                    <li>
                      内容要求<strong>不得违反</strong>国家法律法规，
                      <strong>不涉及</strong>政治敏感内容；
                    </li>
                  </ul>
                  <ul className="marker:text-gray-400 text-lg text-gray-700 dark:text-gray-300">
                    <li className="relative pl-8 before:content-['OR.'] before:absolute before:left-0 before:text-gray-400">
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
              <div className="flex flex-col px-8 py-6">
                <AccordionTrigger className="p-2 hover:no-underline hover:bg-accent cursor-pointer">
                  <h1 className="text-3xl font-bold">如何申请友链？</h1>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="text-lg text-gray-700 dark:text-gray-300 break-words">
                    <li className="flex items-start gap-2">
                      <Highlighter className="h-5 w-5 shrink-0 self-start mt-1" />
                      <span>
                        <strong>内容包含</strong>
                        ：头像、名称、介绍、链接、以及社交账号地址；
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <StickyNote className="h-5 w-5 shrink-0 self-start mt-1" />
                      <span>
                        <strong>邮箱主题</strong>
                        ：友链申请，我将在第一时间审核并添加到友链栏目中。
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Send className="h-5 w-5 shrink-0 self-start mt-1" />
                      <span>
                        <strong>邮箱地址</strong>：
                        <a
                          href="mailto:me@ichiyo.in"
                          className="hover:underline"
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
