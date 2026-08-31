"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Drawer } from "@heroui/react/drawer";
import { Input } from "@heroui/react/input";
import { InputGroup } from "@heroui/react/input-group";
import { Label } from "@heroui/react/label";
import { TextArea } from "@heroui/react/textarea";
import { TextField } from "@heroui/react/textfield";
import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import { Typography } from "@heroui/react/typography";
import { Building1 } from "@repo/icons/Building1";
import { Calendar1 } from "@repo/icons/Calendar1";
import { Check } from "@repo/icons/Check";
import { ChevronDown } from "@repo/icons/ChevronDown";
import { IdentityCard1 } from "@repo/icons/IdentityCard1";
import { Lock1 } from "@repo/icons/Lock1";
import { MapPin1 } from "@repo/icons/MapPin1";
import { MedicalCard1 } from "@repo/icons/MedicalCard1";
import { Pencil1 } from "@repo/icons/Pencil1";
import { Plus } from "@repo/icons/Plus";
import { Telephone1 } from "@repo/icons/Telephone1";
import { User } from "@repo/icons/User";
import { HeightSlider } from "@repo/ui/kit/HeightSlider";
import { LocationPickerMap } from "@repo/ui/kit/LocationPickerMap";
import { WeightSlider } from "@repo/ui/kit/WeightSlider";
import {
  ONBOARDING_HEIGHT_CM_RANGE,
  ONBOARDING_WEIGHT_KG_RANGE,
} from "@/modules/app/lib/onboarding-data";
import type { OnboardingGenderId } from "@/modules/app/lib/onboarding-data";
import { onboardingIdentitySectionVariants } from "./OnboardingIdentitySection.styles";
import type {
  OnboardingIdentitySectionProps,
  OnboardingProvinceOption,
} from "./OnboardingIdentitySection.types";

type DrawerKind = "province" | "address" | null;

const FIELD_ICON = 18;

export function OnboardingIdentitySection({
  value,
  labels,
  provinces,
  onChange,
  className,
}: OnboardingIdentitySectionProps) {
  const styles = onboardingIdentitySectionVariants();
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [draftProvince, setDraftProvince] =
    useState<OnboardingProvinceOption | null>(null);
  const [draftStreet, setDraftStreet] = useState(value.street);
  const [draftPoint, setDraftPoint] = useState(value.mapPoint);

  useEffect(() => {
    if (drawer !== "address") return;
    setDraftStreet(value.street);
    setDraftPoint(value.mapPoint);
  }, [drawer, value.mapPoint, value.street]);

  const openProvince = () => {
    const current =
      provinces.find((item) => item.id === value.provinceId) ??
      provinces[0] ??
      null;
    setDraftProvince(current);
    setDrawer("province");
  };

  const openAddress = () => {
    setDraftStreet(value.street);
    setDraftPoint(value.mapPoint);
    setDrawer("address");
  };

  const confirmProvince = () => {
    if (!draftProvince) {
      setDrawer(null);
      return;
    }
    onChange({
      provinceId: draftProvince.id,
      provinceName: draftProvince.name,
      city: value.city || draftProvince.name,
    });
    setDrawer(null);
  };

  const confirmAddress = () => {
    onChange({
      street: draftStreet.trim(),
      mapPoint: draftPoint,
    });
    setDrawer(null);
  };

  return (
    <div
      className={styles.root({ className })}
      data-onboarding-nested-scroll
    >
      <Typography className={styles.title()} type="h1" weight="bold">
        {labels.title}
      </Typography>

      <div className={styles.avatarWrap()}>
        <div className={styles.avatar()}>
          <User aria-hidden size={40} />
        </div>
        <span aria-hidden className={styles.avatarEdit()}>
          <Pencil1 size={14} />
        </span>
      </div>

      <section className={styles.section()}>
        <div className={styles.sectionHead()}>
          <User aria-hidden className={styles.sectionIcon()} size={20} />
          <Typography className={styles.sectionTitle()}>
            {labels.general}
          </Typography>
        </div>

        <TextField
          className={styles.field()}
          fullWidth
          name="fullName"
          value={value.fullName}
          onChange={(next) => onChange({ fullName: next })}
        >
          <Label>{labels.fullName}</Label>
          <InputGroup variant="secondary">
            <InputGroup.Prefix>
              <User size={FIELD_ICON} />
            </InputGroup.Prefix>
            <InputGroup.Input className={styles.input()} />
          </InputGroup>
        </TextField>

        <Button size="lg"
          className={styles.trigger()}
          variant="ghost"
          onPress={() => {
            const genders = Object.keys(
              labels.genderOptions,
            ) as OnboardingGenderId[];
            if (genders.length === 0) return;
            const current = value.gender ?? genders[0]!;
            const index = Math.max(0, genders.indexOf(current));
            const next = genders[(index + 1) % genders.length]!;
            onChange({ gender: next });
          }}
        >
          <User aria-hidden className={styles.triggerIcon()} size={20} />
          <span className={styles.triggerValue()}>
            {value.gender
              ? labels.genderOptions[value.gender]
              : labels.gender}
          </span>
          <ChevronDown aria-hidden className={styles.triggerIcon()} size={18} />
        </Button>

        <TextField
          className={styles.field()}
          fullWidth
          name="nationalId"
          value={value.nationalId}
          onChange={(next) => onChange({ nationalId: next })}
        >
          <Label>{labels.nationalId}</Label>
          <InputGroup variant="secondary">
            <InputGroup.Prefix>
              <IdentityCard1 size={FIELD_ICON} />
            </InputGroup.Prefix>
            <InputGroup.Input className={styles.input()} />
          </InputGroup>
        </TextField>

        <TextField
          className={styles.field()}
          fullWidth
          name="birthdate"
          value={value.birthdateDisplay}
          onChange={(next) => onChange({ birthdateDisplay: next })}
        >
          <Label>{labels.birthdate}</Label>
          <InputGroup variant="secondary">
            <InputGroup.Input className={styles.input()} />
            <InputGroup.Suffix>
              <Calendar1 size={FIELD_ICON} />
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>

        <TextField
          className={styles.field()}
          fullWidth
          name="phone"
          value={value.phone}
          onChange={(next) => onChange({ phone: next })}
        >
          <Label>{labels.phone}</Label>
          <InputGroup variant="secondary">
            <InputGroup.Prefix>
              <Telephone1 size={FIELD_ICON} />
            </InputGroup.Prefix>
            <InputGroup.Input className={styles.input()} />
          </InputGroup>
        </TextField>
      </section>

      <section className={styles.section()}>
        <div className={styles.sectionHead()}>
          <Building1 aria-hidden className={styles.sectionIcon()} size={20} />
          <Typography className={styles.sectionTitle()}>
            {labels.address}
          </Typography>
        </div>

        <Button
          className={styles.trigger()}
          variant="ghost"
          onPress={openProvince}
         size="lg">
          <MapPin1 aria-hidden className={styles.triggerIcon()} size={20} />
          <span className={styles.triggerValue()}>
            {value.provinceName || labels.province}
          </span>
          <ChevronDown aria-hidden className={styles.triggerIcon()} size={18} />
        </Button>

        <Button
          className={styles.trigger()}
          variant="ghost"
          onPress={openAddress}
         size="lg">
          <MapPin1 aria-hidden className={styles.triggerIcon()} size={20} />
          <span className={styles.triggerValue()}>
            {value.street || labels.street}
          </span>
          <ChevronDown aria-hidden className={styles.triggerIcon()} size={18} />
        </Button>

        <TextField
          className={styles.field()}
          fullWidth
          name="apartment"
          value={value.apartment}
          onChange={(next) => onChange({ apartment: next })}
        >
          <Label>{labels.apartment}</Label>
          <InputGroup variant="secondary">
            <InputGroup.Prefix>
              <Building1 size={FIELD_ICON} />
            </InputGroup.Prefix>
            <InputGroup.Input className={styles.input()} />
          </InputGroup>
        </TextField>

        <div className={styles.row()}>
          <TextField
            className={styles.field()}
            fullWidth
            name="city"
            value={value.city}
            onChange={(next) => onChange({ city: next })}
          >
            <Label>{labels.city}</Label>
            <Input className={styles.input()} variant="secondary" />
          </TextField>
          <TextField
            className={styles.field()}
            fullWidth
            name="postalCode"
            value={value.postalCode}
            onChange={(next) => onChange({ postalCode: next })}
          >
            <Label>{labels.postalCode}</Label>
            <Input className={styles.input()} variant="secondary" />
          </TextField>
        </div>
      </section>

      <section className={styles.section()}>
        <div className={styles.sectionHead()}>
          <MedicalCard1
            aria-hidden
            className={styles.sectionIcon()}
            size={20}
          />
          <Typography className={styles.sectionTitle()}>
            {labels.health}
          </Typography>
        </div>

        <div className={styles.chips()}>
          <Typography className={styles.fieldLabel()}>
            {labels.allergies}
          </Typography>
          {value.allergies.map((item) => (
            <Chip className={styles.chip()} key={item} size="sm" variant="soft">
              {item}
            </Chip>
          ))}
          <Chip className={styles.chip()} size="sm" variant="soft">
            <Plus aria-hidden size={12} />
            <Chip.Label>+2</Chip.Label>
          </Chip>
          <Button className={styles.editLink()} size="lg" variant="ghost">
            {labels.edit}
          </Button>
        </div>

        <TextField
          className={styles.field()}
          fullWidth
          name="conditions"
          value={value.conditions}
          onChange={(next) => onChange({ conditions: next })}
        >
          <Label>{labels.conditions}</Label>
          <InputGroup variant="secondary">
            <InputGroup.Input className={styles.input()} />
            <InputGroup.Suffix>
              <Pencil1 size={16} />
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>

        <TextField
          className={styles.field()}
          fullWidth
          name="medications"
          value={value.medications}
          onChange={(next) => onChange({ medications: next })}
        >
          <Label>{labels.medications}</Label>
          <InputGroup variant="secondary">
            <InputGroup.Input className={styles.input()} />
            <InputGroup.Suffix>
              <Pencil1 size={16} />
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>

        <div className={styles.sliderBlock()}>
          <Typography className={styles.fieldLabel()}>
            {labels.height}
          </Typography>
          <HeightSlider
            aria-label={labels.height}
            max={ONBOARDING_HEIGHT_CM_RANGE.max}
            min={ONBOARDING_HEIGHT_CM_RANGE.min}
            value={value.heightCm}
            onChange={(next) => onChange({ heightCm: next })}
          />
        </div>

        <div className={styles.sliderBlock()}>
          <Typography className={styles.fieldLabel()}>
            {labels.weight}
          </Typography>
          <WeightSlider
            aria-label={labels.weight}
            className="border-0 bg-transparent shadow-none"
            label={null}
            max={ONBOARDING_WEIGHT_KG_RANGE.max}
            min={ONBOARDING_WEIGHT_KG_RANGE.min}
            value={value.weightKg}
            onChange={(next) => onChange({ weightKg: next })}
          />
        </div>

        <TextField
          className={styles.field()}
          fullWidth
          name="note"
          value={value.note}
          onChange={(next) => onChange({ note: next })}
        >
          <Label>{labels.note}</Label>
          <TextArea className={styles.input()} />
        </TextField>
      </section>

      <Typography className={styles.security()} type="body-sm">
        <Lock1 aria-hidden className={styles.securityIcon()} size={16} />
        <TextWithBrand>{labels.securityNote}</TextWithBrand>
      </Typography>

      <Drawer.Backdrop
        isOpen={drawer === "province"}
        onOpenChange={(open) => {
          if (!open) setDrawer(null);
        }}
      >
        <Drawer.Content placement="bottom">
          <Drawer.Dialog>
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>{labels.selectProvinceTitle}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className={styles.drawerBody()}>
              <div
                aria-label={labels.selectProvinceTitle}
                className={styles.wheel()}
                data-onboarding-nested-scroll
                role="listbox"
              >
                {provinces.map((item) => {
                  const selected =
                    (draftProvince?.id ?? value.provinceId) === item.id;
                  return (
                    <Button size="lg"
                      aria-selected={selected}
                      className={styles.wheelItem()}
                      data-selected={selected || undefined}
                      key={item.id}
                      variant="ghost"
                      onPress={() => setDraftProvince(item)}
                    >
                      {item.name}
                    </Button>
                  );
                })}
              </div>
              <Button
                className={styles.selectBtn()}
                fullWidth
                size="lg"
                variant="primary"
                onPress={confirmProvince}
              >
                {labels.selectProvinceAction}
                <Check aria-hidden className={styles.selectIcon()} size={20} />
              </Button>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>

      <Drawer.Backdrop
        isOpen={drawer === "address"}
        onOpenChange={(open) => {
          if (!open) setDrawer(null);
        }}
      >
        <Drawer.Content placement="bottom">
          <Drawer.Dialog>
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>{labels.editAddressTitle}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className={styles.drawerBody()}>
              <TextField
                className={styles.field()}
                fullWidth
                name="streetDraft"
                value={draftStreet}
                onChange={setDraftStreet}
              >
                <Label>{labels.addressSearch}</Label>
                <InputGroup variant="secondary">
                  <InputGroup.Prefix>
                    <MapPin1 size={FIELD_ICON} />
                  </InputGroup.Prefix>
                  <InputGroup.Input className={styles.input()} />
                </InputGroup>
              </TextField>
              <div className={styles.mapShell()}>
                <LocationPickerMap
                  className="size-full"
                  value={draftPoint}
                  zoomInLabel={labels.zoomIn}
                  zoomOutLabel={labels.zoomOut}
                  onChange={setDraftPoint}
                />
              </div>
              <Button
                className={styles.selectBtn()}
                fullWidth
                size="lg"
                variant="primary"
                onPress={confirmAddress}
              >
                {labels.selectProvinceAction}
                <Check aria-hidden className={styles.selectIcon()} size={20} />
              </Button>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </div>
  );
}
