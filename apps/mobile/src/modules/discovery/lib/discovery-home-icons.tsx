import type { ReactElement } from "react";
import { Archery } from "@repo/icons/Archery";
import { BabyFace1 } from "@repo/icons/BabyFace1";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Basketball } from "@repo/icons/Basketball";
import { Bicycle } from "@repo/icons/Bicycle";
import { Boxing } from "@repo/icons/Boxing";
import { Building2 } from "@repo/icons/Building2";
import { Car1 } from "@repo/icons/Car1";
import { Coffee } from "@repo/icons/Coffee";
import { Crown1 } from "@repo/icons/Crown1";
import { GenderFemale } from "@repo/icons/GenderFemale";
import { GenderMale } from "@repo/icons/GenderMale";
import { Golf } from "@repo/icons/Golf";
import { HandHeart } from "@repo/icons/HandHeart";
import { IceSkating } from "@repo/icons/IceSkating";
import { Lock1 } from "@repo/icons/Lock1";
import { Moon } from "@repo/icons/Moon";
import { PersonAcrobatics } from "@repo/icons/PersonAcrobatics";
import { PersonArmsSpread } from "@repo/icons/PersonArmsSpread";
import { PersonDodgeball } from "@repo/icons/PersonDodgeball";
import { PersonHiking } from "@repo/icons/PersonHiking";
import { PersonInjured } from "@repo/icons/PersonInjured";
import { PersonKarate } from "@repo/icons/PersonKarate";
import { PersonMan1 } from "@repo/icons/PersonMan1";
import { PersonSwimming } from "@repo/icons/PersonSwimming";
import { PersonWoman1 } from "@repo/icons/PersonWoman1";
import { PersonRunning } from "@repo/icons/PersonRunning";
import { PersonYoga } from "@repo/icons/PersonYoga";
import { Shower1 } from "@repo/icons/Shower1";
import { Soccer } from "@repo/icons/Soccer";
import { SoccerField } from "@repo/icons/SoccerField";
import { Tennis } from "@repo/icons/Tennis";
import { Volleyball } from "@repo/icons/Volleyball";
import { UsersThree } from "@repo/icons/UsersThree";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { Weight } from "@repo/icons/Weight";
import { Wheelchair } from "@repo/icons/Wheelchair";
import { WifiFull } from "@repo/icons/WifiFull";
import type {
  HomeAmenityItem,
  HomeFeatureItem,
} from "./home-browse-data";

const FEATURE_ICON_SIZE = 20;
const AMENITY_ICON_SIZE = 48;
const CLUB_CATEGORY_ICON_SIZE = 40;

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

/** Maps `club_category` ref icon catalog names to `@repo/icons`. */
export function discoveryClubCategoryIcon(
  iconKey: string | null | undefined,
): ReactElement {
  const size = CLUB_CATEGORY_ICON_SIZE;
  switch (iconKey) {
    case "BarbellHorizontal":
      return <BarbellHorizontal size={size} />;
    case "PersonWoman1":
      return <PersonWoman1 size={size} />;
    case "PersonMan1":
      return <PersonMan1 size={size} />;
    case "PersonArmsSpread":
      return <PersonArmsSpread size={size} />;
    case "UsersThree":
      return <UsersThree size={size} />;
    case "PersonYoga":
      return <PersonYoga size={size} />;
    case "Weight":
      return <Weight size={size} />;
    case "PersonKarate":
      return <PersonKarate size={size} />;
    case "Boxing":
      return <Boxing size={size} />;
    case "PersonSwimming":
      return <PersonSwimming size={size} />;
    case "Building2":
      return <Building2 size={size} />;
    case "SoccerField":
      return <SoccerField size={size} />;
    case "Tennis":
      return <Tennis size={size} />;
    case "Archery":
      return <Archery size={size} />;
    case "PersonHiking":
      return <PersonHiking size={size} />;
    case "Bicycle":
      return <Bicycle size={size} />;
    case "PersonAcrobatics":
      return <PersonAcrobatics size={size} />;
    case "PersonInjured":
      return <PersonInjured size={size} />;
    case "Volleyball":
      return <Volleyball size={size} />;
    case "Basketball":
      return <Basketball size={size} />;
    case "PersonDodgeball":
      return <PersonDodgeball size={size} />;
    case "IceSkating":
      return <IceSkating size={size} />;
    case "HandHeart":
      return <HandHeart size={size} />;
    case "Golf":
      return <Golf size={size} />;
    default:
      return <Building2 size={size} />;
  }
}

/** Maps sport / sport-category catalog icon names to `@repo/icons`. */
export function discoverySportIcon(
  iconKey: string | null | undefined,
  size = 28,
): ReactElement {
  switch (iconKey) {
    case "Soccer":
      return <Soccer size={size} />;
    case "SoccerField":
      return <SoccerField size={size} />;
    case "Volleyball":
      return <Volleyball size={size} />;
    case "Tennis":
      return <Tennis size={size} />;
    case "BarbellHorizontal":
      return <BarbellHorizontal size={size} />;
    case "Weight":
      return <Weight size={size} />;
    case "PersonYoga":
      return <PersonYoga size={size} />;
    case "PersonKarate":
      return <PersonKarate size={size} />;
    case "Boxing":
      return <Boxing size={size} />;
    case "PersonSwimming":
      return <PersonSwimming size={size} />;
    case "Bicycle":
      return <Bicycle size={size} />;
    case "PersonHiking":
      return <PersonHiking size={size} />;
    case "PersonRunning":
      return <PersonRunning size={size} />;
    case "PersonAcrobatics":
      return <PersonAcrobatics size={size} />;
    case "PersonArmsSpread":
      return <PersonArmsSpread size={size} />;
    case "Archery":
      return <Archery size={size} />;
    default:
      return <PersonKarate size={size} />;
  }
}
