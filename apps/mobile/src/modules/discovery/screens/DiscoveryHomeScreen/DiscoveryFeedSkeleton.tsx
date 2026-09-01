import { useRouter } from "@/shared/lib/app-router";
import { useTranslations } from "next-intl";
import { DiscoveryHomeArticlesSection } from "../../sections/DiscoveryHomeArticlesSection";
import { DiscoveryHomeBannersSection } from "../../sections/DiscoveryHomeBannersSection";
import { DiscoveryHomeClubCategoriesSection } from "../../sections/DiscoveryHomeClubCategoriesSection";
import { DiscoveryHomeClubsRailSection } from "../../sections/DiscoveryHomeClubsRailSection";
import { DiscoveryHomeCatalogRailSkeleton } from "../../sections/DiscoveryHomeCatalogRailSection";
import { DiscoveryLocationMapCtaSection } from "../../sections/DiscoveryLocationMapCtaSection";
import { DiscoveryHomeSportCategoriesSection } from "../../sections/DiscoveryHomeSportCategoriesSection";
import { DiscoveryHomeSportsSection } from "../../sections/DiscoveryHomeSportsSection";
import { discoveryHomeScreenStyles as styles } from "./DiscoveryHomeScreen.styles";

type DiscoveryFeedSkeletonProps = {
  mode?: "initial" | "more";
};

export function DiscoveryFeedSkeleton({
  mode = "initial",
}: DiscoveryFeedSkeletonProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();

  if (mode === "more") {
    return (
      <>
        <DiscoveryHomeCatalogRailSkeleton
          hint="نزدیک‌ترین گزینه‌ها با ظرفیت باقی‌مانده"
          title="همین حالا قابل رزرو"
          variant="schedule"
        />
        <DiscoveryLocationMapCtaSection
          ctaLabel={t("mapCta")}
          subtitle={t("mapSubtitle")}
          title={t("mapTitle")}
          onPress={() => router.push("/discovery/map")}
        />
        <DiscoveryHomeCatalogRailSkeleton
          hint="دوش، رختکن، پارکینگ، کمد، سونا و بیشتر"
          title="امکانات رفاهی"
          variant="tile"
        />
        <DiscoveryHomeClubCategoriesSection categories={[]} isLoading />
        <DiscoveryHomeSportCategoriesSection categories={[]} isLoading />
        <DiscoveryHomeSportsSection isLoading sports={[]} />
        <DiscoveryHomeArticlesSection articles={[]} isLoading />
      </>
    );
  }

  return (
    <>
      <div aria-hidden="true" className={styles.banners}>
        <DiscoveryHomeBannersSection banners={[]} isLoading />
      </div>
      <DiscoveryHomeClubsRailSection
        ariaLabel=""
        clubs={[]}
        hint="بر اساس ورزش‌ها و هدف‌های شما"
        isLoading
        keyPrefix="discovery-feed-initial-clubs"
        title="پیشنهاد برای شما"
      />
      <DiscoveryHomeCatalogRailSkeleton
        hint="مربی‌های تأییدشده و باتجربه"
        title="مربی‌های برتر"
        variant="portrait"
      />
      <DiscoveryHomeCatalogRailSkeleton
        hint="کلاس‌هایی که هنوز فرصت ثبت‌نام دارند"
        title="کلاس‌های امروز"
        variant="media"
      />
      <DiscoveryHomeCatalogRailSkeleton
        hint="استخر، زمین و سالن‌های قابل رزرو"
        title="فضاها و زمین‌ها"
        variant="media"
      />
      <DiscoveryHomeCatalogRailSkeleton
        hint="سانس‌های باقی‌مانده با ظرفیت واقعی"
        title="سانس‌های آزاد امروز"
        variant="schedule"
      />
      <DiscoveryHomeCatalogRailSkeleton
        hint="باشگاه را بر اساس تجهیزات موردنیاز پیدا کنید"
        title="تجهیزات ورزشی"
        variant="tile"
      />
      <DiscoveryHomeCatalogRailSkeleton
        hint="عضویت‌های فعال و منتشرشده با قیمت مناسب‌تر"
        title="پلن‌های عضویت اقتصادی"
        variant="pricing"
      />
    </>
  );
}
