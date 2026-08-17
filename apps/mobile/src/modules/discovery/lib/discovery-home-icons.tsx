import type { ReactElement } from "react";
import { BabyFace1 } from "@repo/icons/BabyFace1";
import { Car1 } from "@repo/icons/Car1";
import { Coffee } from "@repo/icons/Coffee";
import { Crown1 } from "@repo/icons/Crown1";
import { GenderFemale } from "@repo/icons/GenderFemale";
import { GenderMale } from "@repo/icons/GenderMale";
import { Lock1 } from "@repo/icons/Lock1";
import { Moon } from "@repo/icons/Moon";
import { Shower1 } from "@repo/icons/Shower1";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { Wheelchair } from "@repo/icons/Wheelchair";
import { WifiFull } from "@repo/icons/WifiFull";
import type {
  HomeAmenityItem,
  HomeFeatureItem,
} from "./home-browse-data";

const FEATURE_ICON_SIZE = 20;
const AMENITY_ICON_SIZE = 36;

export function discoveryFeatureIcon(
  iconKey: HomeFeatureItem["iconKey"],
): ReactElement {
  switch (iconKey) {
    case "female":
      return <GenderFemale size={FEATURE_ICON_SIZE} />;
    case "male":
      return <GenderMale size={FEATURE_ICON_SIZE} />;
    case "parking":
      return <Car1 size={FEATURE_ICON_SIZE} />;
    case "accessible":
      return <Wheelchair size={FEATURE_ICON_SIZE} />;
    case "kids":
      return <BabyFace1 size={FEATURE_ICON_SIZE} />;
    case "adults":
      return <UsersTwo size={FEATURE_ICON_SIZE} />;
    case "premium":
      return <Crown1 size={FEATURE_ICON_SIZE} />;
    case "open24":
      return <Moon size={FEATURE_ICON_SIZE} />;
  }
}

export function discoveryAmenityIcon(
  iconKey: HomeAmenityItem["iconKey"],
): ReactElement {
  switch (iconKey) {
    case "parking":
      return <Car1 size={AMENITY_ICON_SIZE} />;
    case "shower":
      return <Shower1 size={AMENITY_ICON_SIZE} />;
    case "locker":
      return <Lock1 size={AMENITY_ICON_SIZE} />;
    case "sauna":
      return <Moon size={AMENITY_ICON_SIZE} />;
    case "wifi":
      return <WifiFull size={AMENITY_ICON_SIZE} />;
    case "cafe":
      return <Coffee size={AMENITY_ICON_SIZE} />;
    case "open24":
      return <Moon size={AMENITY_ICON_SIZE} />;
  }
}
