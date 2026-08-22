import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import { Button } from "@heroui/react/button";
import { FieldError } from "@heroui/react/field-error";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { Modal } from "@heroui/react/modal";
import { SearchField } from "@heroui/react/search-field";
import { Spinner } from "@heroui/react/spinner";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { ICON_NAMES, isIconName } from "@repo/icons/catalog";
import { getCachedIcon, loadIcon } from "@repo/icons/load-icon";
import type { IconProps } from "@repo/icons/create-icon";
import { MagnifyingGlass } from "@repo/icons/MagnifyingGlass";
import { Trash2 } from "@repo/icons/Trash2";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslations } from "next-intl";
import { adminIconFieldVariants } from "./AdminIconField.styles";
import type { AdminIconFieldProps } from "./AdminIconField.types";

const COLS_SM = 4;
const COLS_MD = 6;
const COLS_LG = 8;
const ROW_HEIGHT = 88;

function useColumnCount() {
  const [cols, setCols] = useState(COLS_LG);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      if (width < 640) setCols(COLS_SM);
      else if (width < 768) setCols(COLS_MD);
      else setCols(COLS_LG);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cols;
}

/** Resolve an icon without putting a component function into React state. */
function useIconComponent(name: string | null): {
  Comp: ComponentType<IconProps> | null;
  pending: boolean;
} {
  const [, bump] = useState(0);

  useEffect(() => {
    if (!name || !isIconName(name)) return;
    if (getCachedIcon(name)) return;

    let cancelled = false;
    void loadIcon(name).then(() => {
      if (!cancelled) bump((n) => n + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [name]);

  if (!name || !isIconName(name)) {
    return { Comp: null, pending: false };
  }

  const cached = getCachedIcon(name) ?? null;
  return { Comp: cached, pending: !cached };
}

function IconGlyph({
  name,
  size = 22,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const { Comp, pending } = useIconComponent(name);

  if (pending) {
    return <Spinner className={className} color="current" size="sm" />;
  }
  if (!Comp) {
    return (
      <Typography className={className} type="body-xs">
        ?
      </Typography>
    );
  }
  return <Comp className={className} size={size} />;
}

function IconPickerModal({
  isOpen,
  selected,
  onOpenChange,
  onSelect,
}: {
  isOpen: boolean;
  selected: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (name: string) => void;
}) {
  const t = useTranslations("Admin.Form.iconPicker");
  const styles = adminIconFieldVariants();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const cols = useColumnCount();
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    if (!deferredQuery) return ICON_NAMES as readonly string[];
    return (ICON_NAMES as readonly string[]).filter((name) =>
      name.toLowerCase().includes(deferredQuery),
    );
  }, [deferredQuery]);

  const rowCount = Math.ceil(filtered.length / cols) || 0;

  const virtualizer = useVirtualizer({
    count: isOpen && scrollEl ? rowCount : 0,
    getScrollElement: () => scrollEl,
    estimateSize: () => ROW_HEIGHT,
    overscan: 3,
  });

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(() => setQuery(""));
  }, [isOpen]);

  useEffect(() => {
    if (!scrollEl) return;
    scrollEl.scrollTop = 0;
  }, [deferredQuery, scrollEl]);

  const setScrollRef = useCallback((node: HTMLDivElement | null) => {
    setScrollEl(node);
  }, []);

  const handleSelect = useCallback(
    (name: string) => {
      onOpenChange(false);
      // Defer value write until after modal teardown so the backdrop cannot
      // stick around if the parent form re-renders mid-close.
      queueMicrotask(() => onSelect(name));
    },
    [onOpenChange, onSelect],
  );

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container scroll="inside" size="lg">
          <Modal.Dialog className={styles.dialog()}>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{t("title")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className={styles.modalBody()}>
              <SearchField
                aria-label={t("searchAriaLabel")}
                autoComplete="off"
                className={styles.search()}
                name="admin-icon-search"
                value={query}
                onChange={setQuery}
              >
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    dir="ltr"
                    placeholder={t("searchPlaceholder")}
                    spellCheck={false}
                  />
                </SearchField.Group>
              </SearchField>
              <Typography className={styles.meta()}>
                {t("count", { count: filtered.length })}
              </Typography>
              <div className={styles.scroll()} ref={setScrollRef}>
                {filtered.length === 0 ? (
                  <div className={styles.empty()}>{t("empty")}</div>
                ) : (
                  <div
                    className="relative w-full"
                    style={{ height: virtualizer.getTotalSize() }}
                  >
                    {virtualizer.getVirtualItems().map((virtualRow) => {
                      const start = virtualRow.index * cols;
                      const rowIcons = filtered.slice(start, start + cols);
                      return (
                        <div
                          key={virtualRow.key}
                          className={styles.gridRow()}
                          style={{
                            height: virtualRow.size,
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          {rowIcons.map((name) => {
                            const isSelected = name === selected;
                            return (
                              <button
                                key={name}
                                aria-label={name}
                                aria-pressed={isSelected}
                                className={styles.cell({
                                  selected: isSelected,
                                })}
                                type="button"
                                onClick={() => handleSelect(name)}
                              >
                                <IconGlyph name={name} size={24} />
                                <span className={styles.cellName()} dir="ltr">
                                  {name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="tertiary">
                {t("close")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export function AdminIconField({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  name,
  isInvalid,
  errorMessage,
  isDisabled,
  inputRef,
  className,
}: AdminIconFieldProps) {
  const t = useTranslations("Admin.Form.iconPicker");
  const styles = adminIconFieldVariants();
  const [open, setOpen] = useState(false);
  const knownIcon = isIconName(value) ? value : null;

  return (
    <div className={styles.root({ className })}>
      <TextField
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        name={name}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
      >
        <Label>{label}</Label>
        <div className={styles.row()}>
          <div
            aria-hidden
            className={styles.preview({
              className: knownIcon ? undefined : styles.previewEmpty(),
            })}
          >
            {knownIcon ? (
              <IconGlyph name={knownIcon} size={20} />
            ) : (
              <MagnifyingGlass size={18} />
            )}
          </div>
          <Input
            className={styles.input()}
            dir="ltr"
            placeholder={placeholder}
            // Dual @types/react resolutions across workspace packages.
            ref={inputRef as never}
          />
          <div className={styles.actions()}>
            <Button
              isDisabled={isDisabled}
              size="sm"
              variant="secondary"
              onPress={() => setOpen(true)}
            >
              {t("browse")}
            </Button>
            {value ? (
              <Button
                isDisabled={isDisabled}
                isIconOnly
                size="lg"
                variant="tertiary"
                aria-label={t("clear")}
                onPress={() => onChange("")}
              >
                <Trash2 size={18} />
              </Button>
            ) : null}
          </div>
        </div>
        <FieldError>{errorMessage}</FieldError>
      </TextField>

      <IconPickerModal
        isOpen={open}
        selected={value}
        onOpenChange={setOpen}
        onSelect={onChange}
      />
    </div>
  );
}
