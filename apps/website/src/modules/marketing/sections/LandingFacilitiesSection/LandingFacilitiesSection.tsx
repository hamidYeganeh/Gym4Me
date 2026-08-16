"use client";

import { Car1 } from "@repo/icons/Car1";
import { Coffee } from "@repo/icons/Coffee";
import { Lock1 } from "@repo/icons/Lock1";
import { Moon } from "@repo/icons/Moon";
import { Shower1 } from "@repo/icons/Shower1";
import { WifiFull } from "@repo/icons/WifiFull";
import { ClubAmenityCard } from "@repo/ui/cards/ClubAmenityCard";
import { ClubGalleryCard } from "@repo/ui/cards/ClubGalleryCard";
import { EquipmentBrowseCard } from "@repo/ui/cards/EquipmentBrowseCard";
import type { ReactNode } from "react";
import {
  LANDING_AMENITIES,
  LANDING_EQUIPMENT,
  LANDING_GALLERY,
} from "../../lib/landing-assets";
import { ClipReveal, FadeWords, InViewRise } from "../../lib/landing-reveal";
import { useLandingScroll } from "../../lib/landing-scroll";
import { landingFacilitiesSectionStyles } from "./LandingFacilitiesSection.styles";
import type { LandingFacilitiesSectionProps } from "./LandingFacilitiesSection.types";

const AMENITY_ICONS: Record<(typeof LANDING_AMENITIES)[number]["id"], ReactNode> =
  {
    parking: <Car1 size={36} />,
    shower: <Shower1 size={36} />,
    locker: <Lock1 size={36} />,
    sauna: <Moon size={36} />,
    wifi: <WifiFull size={36} />,
    cafe: <Coffee size={36} />,
    open24: <Moon size={36} />,
  };

export function LandingFacilitiesSection({
  className,
}: LandingFacilitiesSectionProps) {
  const slots = landingFacilitiesSectionStyles();
  const { scrollTo } = useLandingScroll();

  return (
    <section id="facilities" className={slots.root({ className })}>
      <div className={slots.intro()}>
        <ClipReveal
          id="facilities-title"
          as="h2"
          mode="lines"
          text={"امکانات همان باشگاه\nکه در اپ می‌بینی"}
          className={slots.title()}
          stagger={120}
        />
        <FadeWords
          className={slots.body()}
          text="پارکینگ، دوش، سونا و تجهیزات را قبل از رزرو ببین. همان کارت‌هایی که در کشف باشگاه اپ هست."
        />
      </div>

      <div className={slots.block()}>
        <p className={slots.blockTitle()}>امکانات باشگاه</p>
        <div className={slots.amenityRail()}>
          {LANDING_AMENITIES.map((item, i) => (
            <InViewRise delayIn={i * 60} fromY={20} key={item.id}>
              <ClubAmenityCard
                className={slots.amenityCard()}
                icon={AMENITY_ICONS[item.id]}
                subtitle={item.subtitle}
                title={item.name}
              />
            </InViewRise>
          ))}
        </div>
      </div>

      <div className={slots.block()}>
        <p className={slots.blockTitle()}>تجهیزات</p>
        <div className={slots.equipmentGrid()}>
          {LANDING_EQUIPMENT.map((item) => (
            <EquipmentBrowseCard
              image={item.image}
              imageAlt={item.name}
              key={item.id}
              onPress={() => scrollTo("#clubs")}
              size={item.size}
              title={item.name}
            />
          ))}
        </div>
      </div>

      <div className={slots.block()}>
        <p className={slots.blockTitle()}>گالری باشگاه</p>
        <div className={slots.galleryRail()}>
          {LANDING_GALLERY.map((item) => (
            <ClubGalleryCard
              actionLabel="مشاهده باشگاه"
              author={item.author}
              className={slots.galleryCard()}
              image={item.image}
              imageAlt={item.title}
              key={item.id}
              mediaKind="image"
              onPress={() => scrollTo("#clubs")}
              title={item.title}
              viewsLabel={item.viewsLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
