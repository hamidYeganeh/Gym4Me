"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Button } from "@heroui/react/button";
import { Checkbox } from "@heroui/react/checkbox";
import { Drawer } from "@heroui/react/drawer";
import { Label } from "@heroui/react/label";
import { NumberField } from "@heroui/react/number-field";
import { SearchField } from "@heroui/react/search-field";
import { TextArea } from "@heroui/react/textarea";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import type { IconProps } from "@repo/icons/create-icon";
import { Check } from "@repo/icons/Check";
import { Pencil1 } from "@repo/icons/Pencil1";
import { Plus } from "@repo/icons/Plus";
import { Sparkle1 } from "@repo/icons/Sparkle1";
import { getCachedIcon, loadIcon } from "@repo/icons/load-icon";
import { useTranslations } from "next-intl";
import {
  toggleCatalogSelection,
  type ClubCreateCatalogSelectionDraft,
} from "@/modules/owner/lib/club-create-form";
import { ownerClubsCreateCatalogSectionVariants } from "./OwnerClubsCreateCatalogSection.styles";
import type { OwnerClubsCreateCatalogSectionProps } from "./OwnerClubsCreateCatalogSection.types";

function CatalogIcon({ name }: { name?: string | null }) {
  const [Icon, setIcon] = useState<ComponentType<IconProps> | null>(() =>
    name ? (getCachedIcon(name) ?? null) : null,
  );

  useEffect(() => {
    let active = true;
    if (!name) {
      setIcon(null);
      return;
    }
    void loadIcon(name).then((next) => {
      if (active) setIcon(() => next);
    });
    return () => {
      active = false;
    };
  }, [name]);

  return Icon ? (
    <Icon aria-hidden size={22} />
  ) : (
    <Sparkle1 aria-hidden size={22} />
  );
}

export function OwnerClubsCreateCatalogSection({
  title,
  hint,
  isLoading,
  options,
  selections,
  supportsQuantity = false,
  onChange,
  className,
}: OwnerClubsCreateCatalogSectionProps) {
  const t = useTranslations("Mobile.ClubCreate");
  const styles = ownerClubsCreateCatalogSectionVariants();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(selections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState<number | null>(1);

  const optionById = useMemo(
    () => new Map(options.map((option) => [option.id, option])),
    [options],
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fa");
    return normalized
      ? options.filter((option) =>
          option.name.toLocaleLowerCase("fa").includes(normalized),
        )
      : options;
  }, [options, query]);

  const openPicker = () => {
    setDraft(selections);
    setQuery("");
    setPickerOpen(true);
  };

  const openEditor = (selection: ClubCreateCatalogSelectionDraft) => {
    setDescription(selection.description);
    setQuantity(selection.quantity ?? 1);
    setEditingId(selection.id);
  };

  return (
    <section className={styles.root({ className })}>
      <div className={styles.header()}>
        <div className={styles.headerCopy()}>
          <Typography className={styles.title()} type="h4" weight="bold">
            {title}
          </Typography>
          <Typography className={styles.hint()} type="body-sm">
            {hint}
          </Typography>
        </div>
        <Button
          className={styles.addButton()}
          fullWidth
          size="lg"
          variant="secondary"
          onPress={openPicker}
        >
          <Plus aria-hidden size={18} />
          {t("catalogAdd")}
        </Button>
      </div>

      {isLoading ? (
        <Typography className={styles.hint()} type="body-sm">
          {t("catalogLoading")}
        </Typography>
      ) : selections.length === 0 ? (
        <Button className={styles.empty()} variant="ghost" onPress={openPicker} size="lg">
          <Plus aria-hidden size={22} />
          <span>{t("catalogSelectHint")}</span>
        </Button>
      ) : (
        <div className={styles.selectedList()}>
          {selections.map((selection) => {
            const option = optionById.get(selection.id);
            return (
              <article className={styles.selectedItem()} key={selection.id}>
                <span className={styles.iconBox()}>
                  <CatalogIcon name={option?.icon} />
                </span>
                <div className={styles.itemCopy()}>
                  <Typography weight="semibold">
                    {option?.name ?? selection.id}
                  </Typography>
                  <Typography className={styles.itemMeta()} type="body-sm">
                    {selection.description ||
                      (supportsQuantity && selection.quantity
                        ? t("catalogQuantityValue", {
                            count: selection.quantity,
                          })
                        : t("catalogNoDetails"))}
                  </Typography>
                </div>
                <Button
                  aria-label={t("catalogEditItem", {
                    name: option?.name ?? selection.id,
                  })}
                  isIconOnly
                  size="lg"
                  variant="ghost"
                  onPress={() => openEditor(selection)}
                >
                  <Pencil1 size={18} />
                </Button>
              </article>
            );
          })}
        </div>
      )}

      <Drawer.Backdrop isOpen={pickerOpen} onOpenChange={setPickerOpen}>
        <Drawer.Content placement="bottom">
          <Drawer.Dialog className={styles.drawer()}>
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>
                {t("catalogPickerTitle", { title })}
              </Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className={styles.drawerBody()}>
              <SearchField fullWidth value={query} onChange={setQuery}>
                <Label>{t("catalogSearch")}</Label>
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input
                    placeholder={t("catalogSearchPlaceholder")}
                  />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
              <div className={styles.optionList()}>
                {filtered.map((option) => {
                  const selected = draft.some((item) => item.id === option.id);
                  return (
                    <Checkbox
                      className={styles.optionRow()}
                      isSelected={selected}
                      key={option.id}
                      onChange={() =>
                        setDraft((current) =>
                          toggleCatalogSelection(
                            current,
                            option.id,
                            supportsQuantity,
                          ),
                        )
                      }
                    >
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <span className={styles.iconBox()}>
                          <CatalogIcon name={option.icon} />
                        </span>
                        <span className={styles.optionName()}>
                          {option.name}
                        </span>
                      </Checkbox.Content>
                    </Checkbox>
                  );
                })}
                {filtered.length === 0 ? (
                  <Typography className={styles.emptyResult()} color="muted">
                    {t("catalogEmpty")}
                  </Typography>
                ) : null}
              </div>
            </Drawer.Body>
            <Drawer.Footer className={styles.drawerFooter()}>
              <Button size="lg"
                fullWidth
                variant="primary"
                onPress={() => {
                  onChange(draft);
                  setPickerOpen(false);
                }}
              >
                <Check aria-hidden size={18} />
                {t("catalogApply", { count: draft.length })}
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>

      <Drawer.Backdrop
        isOpen={editingId != null}
        onOpenChange={(open) => {
          if (!open) setEditingId(null);
        }}
      >
        <Drawer.Content placement="bottom">
          <Drawer.Dialog className={styles.drawer()}>
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>
                {t("catalogEditTitle", {
                  name: optionById.get(editingId ?? "")?.name ?? "",
                })}
              </Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className={styles.editorBody()}>
              {supportsQuantity ? (
                <NumberField
                  fullWidth
                  minValue={1}
                  value={quantity ?? 1}
                  onChange={setQuantity}
                >
                  <Label>{t("catalogQuantity")}</Label>
                  <NumberField.Group>
                    <NumberField.IncrementButton />
                    <NumberField.Input />
                    <NumberField.DecrementButton />
                  </NumberField.Group>
                </NumberField>
              ) : null}
              <TextField
                fullWidth
                value={description}
                onChange={setDescription}
              >
                <Label>{t("catalogDescription")}</Label>
                <TextArea placeholder={t("catalogDescriptionPlaceholder")} />
              </TextField>
            </Drawer.Body>
            <Drawer.Footer className={styles.drawerFooter()}>
              <Button size="lg"
                fullWidth
                variant="primary"
                onPress={() => {
                  if (!editingId) return;
                  onChange(
                    selections.map((item) =>
                      item.id === editingId
                        ? {
                            ...item,
                            description: description.trim(),
                            quantity: supportsQuantity
                              ? Math.max(1, quantity ?? 1)
                              : null,
                          }
                        : item,
                    ),
                  );
                  setEditingId(null);
                }}
              >
                {t("catalogSaveDetails")}
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </section>
  );
}
