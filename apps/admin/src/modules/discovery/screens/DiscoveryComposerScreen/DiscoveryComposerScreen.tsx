import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  Label,
  ListBox,
  Modal,
  Select,
  Switch,
} from "@heroui/react";
import {
  ApiError,
  type LocationNode,
  type RefItem,
  type SportNode,
} from "@repo/api";
import type {
  DiscoverySectionDefinition,
  DiscoverySectionKind,
} from "@repo/api/discovery";
import type {
  AdminDiscoveryPage,
  PreviewDiscoveryDraftResponse,
} from "@repo/api/admin";
import { toast } from "@repo/ui/kit/Toast";
import { AdminShell } from "@/shared/components";
import { adminBasics, adminDiscovery } from "@/shared/lib/api";
import {
  DiscoveryComposerSkeleton,
  DiscoveryPreviewSkeleton,
} from "../../components/DiscoveryComposerSkeleton";
import {
  DISCOVERY_KIND_META,
  DISCOVERY_SECTION_KINDS,
  DISCOVERY_STRATEGIES,
  DiscoverySectionEditor,
} from "../../components/DiscoverySectionEditor";
import { DiscoverySportAutocomplete } from "../../components/DiscoverySportAutocomplete";

const DISCOVERY_PAGES = [
  { key: "discovery_home", label: "خانه اکتشاف" },
  { key: "discovery_clubs", label: "کشف باشگاه‌ها" },
  { key: "discovery_coaches", label: "کشف مربی‌ها" },
  { key: "discovery_sports", label: "کشف ورزش‌ها" },
  { key: "discovery_articles", label: "کشف مقالات" },
  { key: "discovery_classes", label: "کشف کلاس‌ها" },
] as const;
type DiscoveryPageKey = (typeof DISCOVERY_PAGES)[number]["key"];
type BusyOperation = "load" | "save" | "preview" | "publish";
type SectionErrors = Record<string, string>;

const COMPONENTS: Record<DiscoverySectionKind, string> = {
  banners: "banner_carousel",
  club_categories: "club_category_grid",
  sport_categories: "sport_category_rail",
  sports: "sport_rail",
  clubs: "club_rail",
  coaches: "coach_rail",
  classes: "class_rail",
  spaces: "space_rail",
  slots: "slot_rail",
  equipment: "equipment_grid",
  membership_plans: "membership_plan_rail",
  bookable_offers: "bookable_offer_rail",
  amenities: "amenity_rail",
  articles: "article_rail",
};

function newSection(
  kind: DiscoverySectionKind = "clubs",
  pageKey: DiscoveryPageKey = "discovery_home",
): DiscoverySectionDefinition {
  const id = `${kind}-${crypto.randomUUID()}`;
  return {
    id,
    kind,
    content: { title: "" },
    source: {
      strategy: DISCOVERY_STRATEGIES[kind][0]!.value,
      limit: 8,
      filters:
        kind === "banners" &&
        ["discovery_home", "discovery_clubs", "discovery_coaches"].includes(
          pageKey,
        )
          ? { placement: pageKey }
          : undefined,
    },
    presentation: {
      component: COMPONENTS[kind],
      layout: kind === "banners" ? "hero" : "horizontal",
    },
    emptyBehavior: "hide",
  };
}

function itemLabel(item: unknown): string {
  if (!item || typeof item !== "object") return "آیتم";
  const value = item as Record<string, unknown>;
  return String(value.name ?? value.title ?? value.slug ?? value.id ?? "آیتم");
}

function validateSection(section: DiscoverySectionDefinition): SectionErrors {
  const errors: SectionErrors = {};
  if (section.content.title.length > 160)
    errors.title = "عنوان نمی‌تواند بیشتر از ۱۶۰ کاراکتر باشد.";
  if ((section.content.subtitle?.length ?? 0) > 300)
    errors.subtitle = "توضیح کوتاه نمی‌تواند بیشتر از ۳۰۰ کاراکتر باشد.";
  if ((section.content.icon?.length ?? 0) > 80)
    errors.icon = "مقدار آیکن نمی‌تواند بیشتر از ۸۰ کاراکتر باشد.";
  if (
    !Number.isInteger(section.source.limit) ||
    section.source.limit < 1 ||
    section.source.limit > 12
  )
    errors.limit = "تعداد کارت‌ها باید عددی بین ۱ تا ۱۲ باشد.";
  if (section.presentation.layout === "single" && section.source.limit !== 1)
    errors.limit = "در چیدمان تک کارت، تعداد کارت‌ها باید ۱ باشد.";
  if (
    section.presentation.rows !== undefined &&
    (section.presentation.rows < 1 || section.presentation.rows > 4)
  )
    errors.rows = "تعداد ردیف باید بین ۱ تا ۴ باشد.";
  const link = section.content.action?.link;
  if (link && !link.startsWith("/") && !link.startsWith("https://"))
    errors.actionLink = "لینک باید با / یا https:// شروع شود.";
  if ((section.content.action?.label?.length ?? 0) > 80)
    errors.actionLabel = "متن دکمه نمی‌تواند بیشتر از ۸۰ کاراکتر باشد.";
  const radius = section.source.filters?.radiusMeters;
  if (
    radius !== undefined &&
    (typeof radius !== "number" || radius < 100 || radius > 100000)
  )
    errors.radiusMeters = "شعاع جست‌وجو باید بین ۱۰۰ تا ۱۰۰٬۰۰۰ متر باشد.";
  return errors;
}

export function DiscoveryComposerScreen() {
  const { pageKey: routePageKey } = useParams<{ pageKey: string }>();
  const pageKey = DISCOVERY_PAGES.some((item) => item.key === routePageKey)
    ? (routePageKey as DiscoveryPageKey)
    : "discovery_home";
  const [page, setPage] = useState<AdminDiscoveryPage | null>(null);
  const [sections, setSections] = useState<DiscoverySectionDefinition[]>([]);
  const [preview, setPreview] = useState<PreviewDiscoveryDraftResponse | null>(
    null,
  );
  const [authenticatedPreview, setAuthenticatedPreview] = useState(true);
  const [sportIds, setSportIds] = useState<string[]>([]);
  const [sportOptions, setSportOptions] = useState<SportNode[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<RefItem[]>([]);
  const [locationOptions, setLocationOptions] = useState<LocationNode[]>([]);
  const [sportsLoading, setSportsLoading] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<BusyOperation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy("load");
    setSportsLoading(true);
    setError(null);
    try {
      const [pageResult, sportsResult, categoriesResult, locationsResult] =
        await Promise.allSettled([
          adminDiscovery.get(pageKey),
          adminBasics.listSports({ kind: "sport" }),
          adminBasics.listRefs("club_category"),
          adminBasics.listLocations({ kind: "city" }),
        ]);
      if (pageResult.status === "rejected") throw pageResult.reason;
      setPage(pageResult.value);
      setSections(pageResult.value.draftSections);
      setActiveSectionId(pageResult.value.draftSections[0]?.id ?? null);
      setPreview(null);
      setDirty(false);
      setSportOptions(
        sportsResult.status === "fulfilled" ? sportsResult.value.result : [],
      );
      setCategoryOptions(
        categoriesResult.status === "fulfilled"
          ? categoriesResult.value.result
          : [],
      );
      setLocationOptions(
        locationsResult.status === "fulfilled"
          ? locationsResult.value.result
          : [],
      );
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause.message : "بارگذاری ناموفق بود.",
      );
    } finally {
      setBusy(null);
      setSportsLoading(false);
    }
  }, [pageKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!ensureValid()) return;
    setBusy("save");
    setError(null);
    try {
      const next = await adminDiscovery.saveDraft(pageKey, { sections });
      setPage(next);
      setDirty(false);
      toast.success("پیش‌نویس ذخیره شد.");
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? `پیش‌نویس ذخیره نشد: ${cause.message}`
          : "پیش‌نویس ذخیره نشد. اتصال را بررسی و دوباره تلاش کنید.",
      );
    } finally {
      setBusy(null);
    }
  };

  const runPreview = async () => {
    if (!ensureValid()) return;
    setBusy("preview");
    setError(null);
    try {
      await adminDiscovery.saveDraft(pageKey, { sections });
      setDirty(false);
      const next = await adminDiscovery.preview(pageKey, {
        page: 1,
        page_size: 64,
        context: {
          authenticated: authenticatedPreview,
          activeRole: authenticatedPreview ? "athlete" : undefined,
          sportIds,
        },
      });
      setPreview(next);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? `پیش‌نمایش ساخته نشد: ${cause.message}`
          : "پیش‌نمایش ساخته نشد. اتصال را بررسی و دوباره تلاش کنید.",
      );
    } finally {
      setBusy(null);
    }
  };

  const publish = async () => {
    if (!ensureValid()) return;
    setBusy("publish");
    setError(null);
    try {
      await adminDiscovery.saveDraft(pageKey, { sections });
      const next = await adminDiscovery.publish(pageKey);
      setPage(next);
      setDirty(false);
      toast.success(`نسخه ${next.publishedRevision} منتشر شد.`);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? `انتشار انجام نشد: ${cause.message}`
          : "انتشار انجام نشد. اتصال را بررسی و دوباره تلاش کنید.",
      );
    } finally {
      setBusy(null);
    }
  };

  const summary = useMemo(() => `${sections.length} سکشن`, [sections.length]);
  const validationErrors = useMemo(
    () =>
      Object.fromEntries(
        sections.map((section) => [section.id, validateSection(section)]),
      ) as Record<string, SectionErrors>,
    [sections],
  );
  const invalidSectionIds = useMemo(
    () =>
      sections
        .filter(
          (section) =>
            Object.keys(validationErrors[section.id] ?? {}).length > 0,
        )
        .map((section) => section.id),
    [sections, validationErrors],
  );

  function ensureValid() {
    const firstInvalidId = invalidSectionIds[0];
    if (!firstInvalidId) return true;
    setActiveSectionId(firstInvalidId);
    setError(
      `${invalidSectionIds.length} سکشن نیاز به اصلاح دارد. فیلدهای مشکل‌دار با رنگ خطا مشخص شده‌اند.`,
    );
    return false;
  }

  const moveToIndex = (sourceId: string, destinationIndex: number) => {
    setSections((current) => {
      const sourceIndex = current.findIndex((item) => item.id === sourceId);
      if (sourceIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      if (!moved) return current;
      const adjustedIndex =
        sourceIndex < destinationIndex
          ? destinationIndex - 1
          : destinationIndex;
      next.splice(Math.max(0, Math.min(adjustedIndex, next.length)), 0, moved);
      return next;
    });
    setDirty(true);
  };

  const activeSection = sections.find((item) => item.id === activeSectionId);
  const activeIndex = activeSection
    ? sections.findIndex((item) => item.id === activeSection.id)
    : -1;

  const isInitialLoading = busy === "load" && page === null;
  const addSection = (kind: DiscoverySectionKind) => {
    const section = newSection(kind, pageKey);
    setSections((current) => [...current, section]);
    setDirty(true);
    setActiveSectionId(section.id);
    setShowSectionPicker(false);
  };

  return (
    <AdminShell
      activeNavId="discovery"
      discoverySection={{ activeTabId: pageKey }}
    >
      {isInitialLoading ? (
        <>
          <span aria-live="polite" className="sr-only" role="status">
            در حال بارگذاری سازنده صفحه اکتشاف…
          </span>
          <DiscoveryComposerSkeleton />
        </>
      ) : (
        <div
          aria-busy={busy !== null}
          className="min-h-screen overflow-x-hidden bg-default-50/50 p-4 md:p-6"
        >
          <header className="sticky top-0 z-20 mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-divider bg-surface/95 p-4 shadow-sm backdrop-blur-xl">
            <div className="max-w-5xl">
              <h1 className="text-xl font-bold md:text-2xl">
                {DISCOVERY_PAGES.find((item) => item.key === pageKey)?.label}
              </h1>
              <p className="mt-1 text-sm text-foreground-500">
                {summary} · نسخه منتشرشده {page?.publishedRevision ?? 0}
                {dirty ? " · تغییرات ذخیره‌نشده" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                isDisabled={busy !== null}
                variant="outline"
                onPress={() => setShowSectionPicker((current) => !current)}
              >
                افزودن سکشن
              </Button>
              <Button
                isDisabled={busy !== null || sections.length < 2}
                variant="outline"
                onPress={() => setReorderOpen(true)}
              >
                ترتیب سکشن‌ها
              </Button>
              <Button
                isDisabled={busy !== null || sections.length === 0}
                variant="outline"
                onPress={() => void save()}
              >
                {busy === "save" ? "در حال ذخیره…" : "ذخیره پیش‌نویس"}
              </Button>
              <Button
                isDisabled={busy !== null || sections.length === 0}
                variant="primary"
                onPress={() => void publish()}
              >
                {busy === "publish" ? "در حال انتشار…" : "انتشار"}
              </Button>
            </div>
          </header>

          {showSectionPicker || sections.length === 0 ? (
            <Card className="mb-5" variant="secondary">
              <Card.Header>
                <Card.Title>
                  {sections.length === 0
                    ? "اولین بخش صفحه را انتخاب کنید"
                    : "چه بخشی اضافه شود؟"}
                </Card.Title>
                <Card.Description>
                  بعداً می‌توانید ترتیب و محتوای هر بخش را تغییر دهید.
                </Card.Description>
              </Card.Header>
              <Card.Content className="grid grid-flow-dense gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {DISCOVERY_SECTION_KINDS.map((kind) => {
                  const meta = DISCOVERY_KIND_META[kind];
                  return (
                    <Button
                      className="group h-auto min-h-24 items-start justify-start overflow-hidden whitespace-normal p-4 text-start transition-transform hover:-translate-y-0.5"
                      key={kind}
                      variant="outline"
                      onPress={() => addSection(kind)}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg text-primary">
                        {meta.icon}
                      </span>
                      <span>
                        <strong className="block">{meta.label}</strong>
                        <small className="mt-1 block font-normal text-foreground-500">
                          {meta.description}
                        </small>
                      </span>
                    </Button>
                  );
                })}
              </Card.Content>
            </Card>
          ) : null}

          {error ? (
            <div
              className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/20 bg-danger-50 p-3 text-sm text-danger"
              role="alert"
            >
              <span>{error}</span>
              {invalidSectionIds.length > 0 ? (
                <Button
                  size="sm"
                  variant="danger-soft"
                  onPress={() => setActiveSectionId(invalidSectionIds[0]!)}
                >
                  رفتن به اولین خطا
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              <main className="min-w-0">
                {sections.length > 0 ? (
                  <Card className="mb-4" variant="secondary">
                    <Card.Content className="flex flex-col gap-3 md:flex-row md:items-end">
                      <Select
                        fullWidth
                        value={activeSectionId ?? undefined}
                        variant="secondary"
                        onChange={(next: Key | null) =>
                          setActiveSectionId(next ? String(next) : null)
                        }
                      >
                        <Label>سکشنی که می‌خواهید ویرایش کنید</Label>
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {sections.map((section, index) => {
                              const meta = DISCOVERY_KIND_META[section.kind];
                              const count = Object.keys(
                                validationErrors[section.id] ?? {},
                              ).length;
                              return (
                                <ListBox.Item
                                  id={section.id}
                                  key={section.id}
                                  textValue={`${index + 1}. ${section.content.title || meta.label}`}
                                >
                                  {index + 1}.{" "}
                                  {section.content.title || meta.label}
                                  {count ? ` — ${count} خطا` : ""}
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              );
                            })}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                      <Button
                        variant="outline"
                        onPress={() => setReorderOpen(true)}
                      >
                        تغییر ترتیب
                      </Button>
                    </Card.Content>
                  </Card>
                ) : null}
                {activeSection && activeIndex >= 0 ? (
                  <DiscoverySectionEditor
                    index={activeIndex}
                    section={activeSection}
                    errors={validationErrors[activeSection.id]}
                    categoryOptions={categoryOptions}
                    locationOptions={locationOptions}
                    sportOptions={sportOptions}
                    sportsLoading={sportsLoading}
                    onChange={(next) => {
                      setError(null);
                      setDirty(true);
                      setSections((current) =>
                        current.map((item) =>
                          item.id === activeSection.id ? next : item,
                        ),
                      );
                    }}
                    onRemove={() => {
                      const nextId =
                        sections[activeIndex + 1]?.id ??
                        sections[activeIndex - 1]?.id ??
                        null;
                      setActiveSectionId(nextId);
                      setDirty(true);
                      setSections((current) =>
                        current.filter((item) => item.id !== activeSection.id),
                      );
                    }}
                  />
                ) : (
                  <Card
                    className="grid min-h-96 place-items-center border-dashed"
                    variant="secondary"
                  >
                    <Card.Content className="items-center text-center">
                      <Card.Title>
                        یک سکشن را برای ویرایش انتخاب کنید
                      </Card.Title>
                      <Card.Description className="mt-2">
                        یا اولین سکشن صفحه را بسازید.
                      </Card.Description>
                    </Card.Content>
                  </Card>
                )}
              </main>
            </div>

            <aside className="min-w-0 2xl:sticky 2xl:top-28">
              <Card
                className="overflow-hidden border border-divider bg-surface shadow-lg"
                variant="secondary"
              >
                <Card.Header>
                  <Card.Title>پیش‌نمایش موبایل</Card.Title>
                  <Card.Description>
                    نتیجه‌ی واقعی سرویس، دقیقاً با همین ترتیب
                  </Card.Description>
                </Card.Header>
                <Card.Content className="space-y-4">
                  <div className="space-y-3 rounded-2xl border border-divider bg-default-50 p-3">
                    <Switch
                      isSelected={authenticatedPreview}
                      onChange={setAuthenticatedPreview}
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                        کاربر واردشده با نقش ورزشکار
                      </Switch.Content>
                    </Switch>
                    <DiscoverySportAutocomplete
                      description="پیش‌نمایش را مثل کاربری با این علایق بسازید."
                      isLoading={sportsLoading}
                      label="علایق کاربر آزمایشی"
                      options={sportOptions}
                      value={sportIds}
                      onChange={setSportIds}
                    />
                    <Button
                      fullWidth
                      isDisabled={busy !== null || sections.length === 0}
                      variant="secondary"
                      onPress={() => void runPreview()}
                    >
                      {busy === "preview"
                        ? "در حال ساخت پیش‌نمایش…"
                        : "ساخت پیش‌نمایش"}
                    </Button>
                  </div>
                  {busy === "preview" ? (
                    <DiscoveryPreviewSkeleton />
                  ) : (
                    <div className="max-h-[58vh] space-y-6 overflow-auto rounded-[2rem] border border-white/10 bg-[#151718] p-4 shadow-inner">
                      {(preview?.result ?? sections).map((section) => {
                        const realSection = preview?.result.find(
                          (item) => item.id === section.id,
                        );
                        const meta = DISCOVERY_KIND_META[section.kind];
                        const items = realSection?.items ?? [];
                        return (
                          <section className="min-w-0" key={section.id}>
                            <div className="flex items-center justify-between gap-2">
                              <strong className="text-sm text-white">
                                {section.content.title || meta.label}
                              </strong>
                              <span className="text-xs text-white/45">
                                {realSection
                                  ? `${items.length} آیتم`
                                  : meta.label}
                              </span>
                            </div>
                            <div className="mt-3 flex gap-2 overflow-hidden">
                              {(items.length
                                ? items.slice(0, 4)
                                : Array.from({
                                    length: Math.min(section.source.limit, 4),
                                  })
                              ).map((item, index) => (
                                <div
                                  className={`${section.kind === "banners" ? "min-w-[85%]" : "min-w-24"} min-h-16 rounded-xl border border-white/10 bg-white/[0.07] p-2 text-xs text-white/75`}
                                  key={`${section.id}-${index}`}
                                >
                                  {items.length ? itemLabel(item) : meta.label}
                                </div>
                              ))}
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  )}
                </Card.Content>
              </Card>
            </aside>
          </div>

          <Modal>
            <Modal.Backdrop isOpen={reorderOpen} onOpenChange={setReorderOpen}>
              <Modal.Container scroll="inside" size="lg">
                <Modal.Dialog>
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Heading>ترتیب سکشن‌های صفحه</Modal.Heading>
                    <p className="text-sm text-foreground-500">
                      کارت را بکشید؛ نوار سبز دقیقاً محل قرار گرفتن آن را نشان
                      می‌دهد.
                    </p>
                  </Modal.Header>
                  <Modal.Body className="space-y-1 py-3">
                    {sections.map((section, index) => {
                      const meta = DISCOVERY_KIND_META[section.kind];
                      return (
                        <Fragment key={section.id}>
                          <div
                            className={`grid place-items-center rounded-xl border-2 border-dashed text-xs font-medium transition-all ${
                              draggedSectionId
                                ? dropIndex === index
                                  ? "min-h-14 border-primary bg-primary/10 text-primary"
                                  : "min-h-5 border-transparent"
                                : "h-2 border-transparent"
                            }`}
                            onDragOver={(event) => {
                              event.preventDefault();
                              setDropIndex(index);
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              if (draggedSectionId)
                                moveToIndex(draggedSectionId, index);
                              setDraggedSectionId(null);
                              setDropIndex(null);
                            }}
                          >
                            {draggedSectionId && dropIndex === index
                              ? "اینجا قرار می‌گیرد"
                              : null}
                          </div>
                          <Card
                            className={`cursor-grab border border-divider active:cursor-grabbing ${
                              draggedSectionId === section.id
                                ? "opacity-40"
                                : ""
                            }`}
                            draggable
                            onDragEnd={() => {
                              setDraggedSectionId(null);
                              setDropIndex(null);
                            }}
                            onDragStart={(event) => {
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData(
                                "text/plain",
                                section.id,
                              );
                              setDraggedSectionId(section.id);
                            }}
                          >
                            <Card.Content className="flex-row items-center gap-3 p-4">
                              <span
                                className="text-xl text-foreground-400"
                                aria-hidden
                              >
                                ⠿
                              </span>
                              <span className="grid size-8 place-items-center rounded-lg bg-default-100 text-sm font-semibold">
                                {index + 1}
                              </span>
                              <span className="min-w-0 flex-1">
                                <strong className="block truncate">
                                  {section.content.title || meta.label}
                                </strong>
                                <small className="text-foreground-500">
                                  {meta.label} · {section.source.limit} کارت
                                </small>
                              </span>
                            </Card.Content>
                          </Card>
                        </Fragment>
                      );
                    })}
                    <div
                      className={`grid place-items-center rounded-xl border-2 border-dashed text-xs font-medium transition-all ${
                        draggedSectionId
                          ? dropIndex === sections.length
                            ? "min-h-14 border-primary bg-primary/10 text-primary"
                            : "min-h-5 border-transparent"
                          : "h-2 border-transparent"
                      }`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDropIndex(sections.length);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (draggedSectionId)
                          moveToIndex(draggedSectionId, sections.length);
                        setDraggedSectionId(null);
                        setDropIndex(null);
                      }}
                    >
                      {draggedSectionId && dropIndex === sections.length
                        ? "در انتهای صفحه قرار می‌گیرد"
                        : null}
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="primary"
                      onPress={() => setReorderOpen(false)}
                    >
                      تأیید ترتیب
                    </Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        </div>
      )}
    </AdminShell>
  );
}
