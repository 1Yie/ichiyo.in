import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { FaGithub } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import { FaBluesky } from "react-icons/fa6";
import { FaTelegram } from "react-icons/fa6";
import { FaEnvelope } from "react-icons/fa6";
import { FaBilibili } from "react-icons/fa6";

type SocialIconLinkProps = {
  href: string;
  children: React.ReactNode;
};

// const ICP = {
//   name: "萌ICP备20256090号",
//   url: "https://icp.gov.moe/?keyword=20256090",
// };


const ICP = {
  name: "",
  url: "",
};

export default function Footer() {
  const SocialIconLink = ({ href, children }: SocialIconLinkProps) => (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-colors hover:text-gray-700 dark:hover:text-gray-300"
    >
      {children}
    </Link>
  );

  return (
    <div className="relative">
      <section className="section-base">
        <div className="h-14 flex justify-between items-center px-4 sm:px-8 relative">
          <div className="flex items-center space-x-4 font-['Raleway',sans-serif]">
            <Link href="/">
              <p className="text-lg text-primary">ichiyo</p>
            </Link>

            {/* 移动端 版权和 ICP */}
            <div className="flex flex-col items-start md:hidden">
              <p className="text-xs text-gray-500 dark:text-gray-300 font-['Source_Code_Pro',monospace]">
                Copyright © {new Date().getFullYear()} ichiyo
              </p>
              {ICP.name && ICP.url && (
                <div className="flex flex-row items-center justify-center gap-1">
                  <Link
                    href={ICP.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 dark:text-gray-300 font-['Source_Code_Pro',monospace] hover:text-gray-700 dark:hover:text-gray-400 transition-colors"
                  >
                    {ICP.name}
                  </Link>
                  <span className="text-xs text-gray-500 font-['Source_Code_Pro',monospace] dark:text-gray-300">·</span>

                  <Link
                    href="https://travel.moe/go.html?travel=on "
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 font-['Source_Code_Pro',monospace] dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-400 transition-colors whitespace-nowrap"
                  >
                    异次元之旅
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-0 max-md:hidden">
            <p className="text-sm text-gray-500 dark:text-gray-300 font-['Source_Code_Pro',monospace] whitespace-nowrap">
              Copyright © {new Date().getFullYear()} ichiyo
            </p>
            {ICP.name && ICP.url && (
              <div className="flex flex-row items-center justify-center gap-1">
                <Link
                  href={ICP.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 font-['Source_Code_Pro',monospace] dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-400 transition-colors whitespace-nowrap"
                >
                  {ICP.name}
                </Link>
                <span className="text-xs text-gray-500 font-['Source_Code_Pro',monospace] dark:text-gray-300">·</span>

                <Link
                  href="https://travel.moe/go.html?travel=on "
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 font-['Source_Code_Pro',monospace] dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-400 transition-colors whitespace-nowrap"
                >
                  异次元之旅
                </Link>
              </div>
            )}
          </div>

          <div className="sm:w-auto flex justify-end sm:justify-center">
            {/* 移动端 */}
            <NavigationMenu className="flex sm:hidden">
              <NavigationMenuList>
                <NavigationMenuItem className="flex flex-row gap-2">
                  <SocialIconLink href="mailto:me@ichiyo.in">
                    <FaEnvelope size={22} />
                  </SocialIconLink>
                  <SocialIconLink href="https://github.com/1Yie">
                    <FaGithub size={22} />
                  </SocialIconLink>
                  <SocialIconLink href="https://x.com/IchiyoNico">
                    <FaXTwitter size={22} />
                  </SocialIconLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* 桌面端显示全部社交图标 */}
            <NavigationMenu className="hidden sm:flex">
              <NavigationMenuList>
                <NavigationMenuItem className="flex flex-row gap-2">
                  <SocialIconLink href="mailto:me@ichiyo.in">
                    <FaEnvelope size={22} />
                  </SocialIconLink>

                  <SocialIconLink href="https://space.bilibili.com/35020597">
                    <FaBilibili size={22} />
                  </SocialIconLink>

                  <SocialIconLink href="https://github.com/1Yie">
                    <FaGithub size={22} />
                  </SocialIconLink>

                  <SocialIconLink href="https://x.com/IchiyoNico">
                    <FaXTwitter size={22} />
                  </SocialIconLink>

                  <SocialIconLink href="https://t.me/ichiyo233">
                    <FaTelegram size={22} />
                  </SocialIconLink>

                  <SocialIconLink href="https://bsky.app/profile/ichiyo.in">
                    <FaBluesky size={22} />
                  </SocialIconLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </section>
    </div>
  );
}
