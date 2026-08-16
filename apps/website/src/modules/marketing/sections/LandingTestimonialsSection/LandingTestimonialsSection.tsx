"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { LANDING_ASSETS, LANDING_REVIEWS } from "../../lib/landing-assets";
import { landingTestimonialsSectionStyles } from "./LandingTestimonialsSection.styles";
import type {
  LandingOrbitCard,
  LandingTestimonialsSectionProps,
} from "./LandingTestimonialsSection.types";

const PHOTO_IMAGES = [
  LANDING_ASSETS.hero,
  LANDING_ASSETS.collection[1].src,
  LANDING_ASSETS.facilities.clay,
] as const;

const PHOTO_REVIEWS = [
  "بهترین تجربه مربیگری که تا حالا داشتم!",
  "نتایج باورنکردنی فقط در ۳ ماه. پیشنهاد می‌کنم!",
  "حرفه‌ای، متعهد و خیلی مسلط.",
] as const;

const ORBIT_CARDS: LandingOrbitCard[] = [
  {
    kind: "photo",
    imageSrc: PHOTO_IMAGES[0],
    imageAlt: "ورزشکار در حال تمرین",
    review: PHOTO_REVIEWS[0],
  },
  {
    kind: "quote",
    theme: "lime",
    quote: LANDING_REVIEWS[0].content,
    authorName: LANDING_REVIEWS[0].authorName,
    authorRole: LANDING_REVIEWS[0].authorRole,
    avatarSrc: LANDING_REVIEWS[0].avatarSrc,
  },
  {
    kind: "photo",
    imageSrc: PHOTO_IMAGES[1],
    imageAlt: "دویدن در فضای باز",
    review: PHOTO_REVIEWS[1],
  },
  {
    kind: "quote",
    theme: "dark",
    quote: LANDING_REVIEWS[1].content,
    authorName: LANDING_REVIEWS[1].authorName,
    authorRole: LANDING_REVIEWS[1].authorRole,
    avatarSrc: LANDING_REVIEWS[1].avatarSrc,
  },
  {
    kind: "photo",
    imageSrc: PHOTO_IMAGES[2],
    imageAlt: "ورزشکار در باشگاه",
    review: PHOTO_REVIEWS[2],
  },
  {
    kind: "quote",
    theme: "dark",
    quote: LANDING_REVIEWS[2].content,
    authorName: LANDING_REVIEWS[2].authorName,
    authorRole: LANDING_REVIEWS[2].authorRole,
    avatarSrc: LANDING_REVIEWS[2].avatarSrc,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function LandingTestimonialsSection({
  className,
}: LandingTestimonialsSectionProps) {
  const slots = landingTestimonialsSectionStyles();
  const reduceMotion = useReducedMotion();

  return (
    <section id="testimonials" className={slots.root({ className })}>
      <div className={slots.container()}>
        <motion.header
          className={slots.header()}
          initial={reduceMotion ? false : { y: -20, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          whileInView={reduceMotion ? undefined : { y: 0, opacity: 1 }}
        >
          <div className={slots.labelRow()}>
            <span aria-hidden className={slots.darkCircle()}>
              <span className={slots.limeDot()}>•</span>
            </span>
            <span className={slots.labelText()}>نظرات</span>
          </div>
          <h2 className={slots.bigHeading()}>نظر اعضا از داخل اپ</h2>
        </motion.header>

        <motion.div
          className={slots.grid()}
          initial={reduceMotion ? false : "hidden"}
          variants={reduceMotion ? undefined : containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          whileInView={reduceMotion ? undefined : "visible"}
        >
          {ORBIT_CARDS.map((card) =>
            card.kind === "photo" ? (
              <motion.article
                className={slots.card({ className: slots.photoCard() })}
                key={card.review}
                variants={reduceMotion ? undefined : itemVariants}
              >
                <img
                  alt={card.imageAlt}
                  className={slots.photoImg()}
                  src={card.imageSrc}
                />
                <div className={slots.reviewOverlay()}>
                  <div aria-hidden className={slots.reviewStars()}>
                    ★★★★★
                  </div>
                  <p className={slots.reviewText()}>{card.review}</p>
                </div>
              </motion.article>
            ) : (
              <motion.article
                className={slots.testimonialCard({
                  className:
                    card.theme === "lime" ? slots.limeCard() : slots.darkCard(),
                })}
                key={card.authorName}
                variants={reduceMotion ? undefined : itemVariants}
              >
                <div
                  aria-hidden
                  className={slots.quoteIconBox({
                    className:
                      card.theme === "lime"
                        ? slots.quoteIconLime()
                        : slots.quoteIconDark(),
                  })}
                >
                  <span
                    className={slots.quoteMark({
                      className:
                        card.theme === "lime"
                          ? slots.quoteMarkLime()
                          : slots.quoteMarkDark(),
                    })}
                  >
                    "
                  </span>
                </div>
                <p
                  className={slots.quoteText({
                    className:
                      card.theme === "lime"
                        ? slots.quoteTextLime()
                        : slots.quoteTextDark(),
                  })}
                >
                  «{card.quote}»
                </p>
                <div className={slots.authorRow()}>
                  <img
                    alt=""
                    className={slots.avatar({
                      className:
                        card.theme === "lime"
                          ? slots.avatarLime()
                          : slots.avatarDark(),
                    })}
                    src={card.avatarSrc}
                  />
                  <div className={slots.authorMeta()}>
                    <div
                      className={slots.authorName({
                        className:
                          card.theme === "lime"
                            ? slots.authorNameLime()
                            : slots.authorNameDark(),
                      })}
                    >
                      {card.authorName}
                    </div>
                    <div
                      className={slots.authorRole({
                        className:
                          card.theme === "lime"
                            ? slots.authorRoleLime()
                            : slots.authorRoleDark(),
                      })}
                    >
                      {card.authorRole}
                    </div>
                  </div>
                </div>
              </motion.article>
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
}
