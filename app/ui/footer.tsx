import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  // NavigationMenuLink,
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
        <div className="h-14 flex justify-between items-center px-4 sm:px-8">
          <div className="flex items-center space-x-4 font-['Raleway',sans-serif]">
            <Link href="/">
              <p className="text-lg text-primary">ichiyo</p>
            </Link>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-4 max-[768px]:hidden">
            <p className="text-sm text-gray-500 dark:text-gray-300 font-['Source_Code_Pro',monospace]">
              Copyright © 2025 ichiyo
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <NavigationMenu>
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
