import { useTranslations } from "next-intl";
import { cn } from "../../lib/marketing-cn";
import { ScaledClubCard, ScaledCoachCard } from "../../lib/marketing-scaled-cards";
import { ArrowForeground } from "./MarketingHeroSectionDecorations";
import { marketingHeroSectionStyles } from "./MarketingHeroSection.styles";

type HeroCardData = {
  club: {
    title: string;
    label: string;
    imageSrc: string;
    imageAlt: string;
  };
  coach: {
    name: string;
    specialty: string;
    imageSrc: string;
    imageAlt: string;
    rating: number;
    reviewCount: number;
    yearsOfExperience: number;
    isCertified: boolean;
    isNew: boolean;
    badgeLabel: string;
    certifiedLabel: string;
    experienceLabel: string;
  };
};

export function MarketingHeroFeaturesBlock({ club, coach }: HeroCardData) {
  const t = useTranslations("MarketingLanding.hero");
  const slots = marketingHeroSectionStyles();

  return (
    <section id="features" className={slots.features()}>
      <div className={slots.featuresGrid()}>
        <div className={slots.featureCard()}>
          <h2 className={slots.featureTitle()}>
            {t("features.findClub.titleLine1")}
            <br />
            {t("features.findClub.titleLine2")}
          </h2>
          <p className={slots.featureDescription()}>
            {t("features.findClub.description")}
          </p>
          <div className={slots.featureMedia()}>
            <ScaledClubCard club={club} scale={0.62} />
          </div>
          <div className="absolute -right-12 bottom-8 z-30 hidden h-16 w-16 md:block">
            <ArrowForeground />
          </div>
        </div>

        <div className={cn(slots.featureCard(), "w-full")}>
          <h2 className={slots.featureTitle()}>
            {t("features.chooseCoach.titleLine1")}
            <br />
            {t("features.chooseCoach.titleLine2")}
          </h2>
          <p className={slots.featureDescription()}>
            {t("features.chooseCoach.description")}
          </p>
          <div className={slots.featureMedia()}>
            <ScaledCoachCard coach={coach} scale={0.58} />
          </div>
          <div className="absolute -right-12 bottom-8 z-30 hidden h-16 w-16 md:block">
            <ArrowForeground />
          </div>
        </div>

        <div className={cn(slots.featureCard(), "min-h-64")}>
          <h2 className={slots.featureTitle()}>
            {t("features.bookSession.titleLine1")}
            <br />
            {t("features.bookSession.titleLine2")}
          </h2>
          <p className={cn(slots.featureDescription(), "mb-auto")}>
            {t("features.bookSession.description")}
          </p>
          <div className={slots.metricCard()}>
            <p className={slots.metricLabel()}>
              {t("features.bookSession.metricLabel")}
            </p>
            <p className={slots.metricValue()}>
              {t("features.bookSession.metricValue")}
            </p>
            <div className={slots.metricTail()} />
          </div>
        </div>
      </div>
    </section>
  );
}
