"use client";

import { Typography } from "@heroui/react";
import { ArrowUpRight } from "@repo/icons/ArrowUpRight";
import { ArticleCard } from "@repo/ui/cards/ArticleCard";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LANDING_ARTICLES } from "../../lib/landing-assets";
import { landingReveal } from "../../lib/landing-motion";
import { landingBlogsSectionStyles } from "./LandingBlogsSection.styles";
import type { LandingBlogsSectionProps } from "./LandingBlogsSection.types";

function Reveal({
  children,
  delay,
  className,
}: {
  children: ReactNode;
  delay: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      transition={landingReveal(delay)}
      viewport={{ once: true, margin: "-50px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

export function LandingBlogsSection({ className }: LandingBlogsSectionProps) {
  const slots = landingBlogsSectionStyles();
  const router = useRouter();

  return (
    <section
      className={slots.root({ className })}
      dir="rtl"
      id="articles"
      lang="fa"
    >
      <div className={slots.inner()}>
        <header className={slots.header()}>
          <Reveal delay={0.1}>
            <Typography className={slots.heading()} type="h3" weight="medium">
              راهنماهایی که در اپ هم می‌خوانی
            </Typography>
          </Reveal>
          <Reveal delay={0.2}>
            <Typography className={slots.sub()} type="body">
              گرم‌کردن، تغذیه و ریکاوری. همان کارت مقاله کشف Gym4Me، برای تمرین
              هوشمندانه‌تر.
            </Typography>
          </Reveal>
          <Reveal delay={0.3}>
            <Link className={slots.cta()} href="/articles">
              مشاهده همه مقالات
              <ArrowUpRight aria-hidden size={16} />
            </Link>
          </Reveal>
        </header>

        <div className={slots.rail()}>
          {LANDING_ARTICLES.map((article, index) => (
            <Reveal delay={0.2 + index * 0.08} key={article.id}>
              <ArticleCard
                actionLabel="ادامه مطلب"
                author={{ name: article.authorName }}
                category={article.category}
                className={slots.card()}
                coverSrc={article.coverSrc}
                likesLabel={article.likesLabel}
                publishedAtLabel={article.publishedAtLabel}
                readingTimeLabel={`${article.readingTimeMinutes} دقیقه مطالعه`}
                title={article.title}
                variant="stacked"
                viewsLabel={article.viewsLabel}
                onPress={() => router.push("/articles")}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
