import {
  Autocomplete,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Description,
  Input,
  Label,
  ListBox,
  Select,
  SearchField,
  TextField,
  useFilter,
} from "@heroui/react";
import { FieldError } from "@heroui/react/field-error";
import type { Key } from "react";
import type { Role, SportNode } from "@repo/api";
import type {
  DiscoverySectionDefinition,
  DiscoverySourceStrategy,
} from "@repo/api/discovery";
import { AdminIconField } from "@/shared/components";
import { DiscoverySportAutocomplete } from "../DiscoverySportAutocomplete";
import {
  DISCOVERY_KIND_META,
  DISCOVERY_STRATEGIES,
} from "./discovery-section-options";

type Props = {
  index: number;
  section: DiscoverySectionDefinition;
  sportOptions: SportNode[];
  categoryOptions?: Array<{ id: string; name: string }>;
  locationOptions?: Array<{ id: string; name: string }>;
  sportsLoading?: boolean;
  errors?: Record<string, string>;
  onChange: (section: DiscoverySectionDefinition) => void;
  onRemove: () => void;
};

type SelectOption = { value: string; label: string };

const LAYOUT_OPTIONS: SelectOption[] = [
  { value: "horizontal", label: "اسکرول افقی" },
  { value: "grid", label: "شبکه‌ای" },
  { value: "single", label: "تک کارت" },
  { value: "hero", label: "بنر بزرگ" },
];

function SelectField({
  label,
  value,
  options,
  description,
  error,
  onChange,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  description?: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      fullWidth
      isInvalid={Boolean(error)}
      value={value}
      variant="secondary"
      onChange={(next: Key | null) => onChange(String(next ?? ""))}
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      {description ? <Description>{description}</Description> : null}
      <FieldError>{error}</FieldError>
      <Select.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item
              id={option.value}
              key={option.value}
              textValue={option.label}
            >
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

function ModelOptionAutocomplete({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ id: string; name: string }>;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const { contains } = useFilter({ sensitivity: "base" });
  return (
    <Autocomplete
      allowsEmptyCollection
      fullWidth
      placeholder={placeholder}
      value={value || null}
      variant="secondary"
      onChange={(key: Key | null) => onChange(key == null ? "" : String(key))}
      onClear={() => onChange("")}
    >
      <Label>{label}</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus fullWidth>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="جست‌وجو با نام…" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox>
            {options.map((option) => (
              <ListBox.Item
                id={option.id}
                key={option.id}
                textValue={option.name}
              >
                {option.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

function Field({
  label,
  description,
  value,
  placeholder,
  error,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      fullWidth
      isInvalid={Boolean(error)}
      value={value}
      onChange={onChange}
    >
      <Label>{label}</Label>
      <Input placeholder={placeholder} />
      {description ? <Description>{description}</Description> : null}
      <FieldError>{error}</FieldError>
    </TextField>
  );
}

export function DiscoverySectionEditor({
  index,
  section,
  sportOptions,
  categoryOptions = [],
  locationOptions = [],
  sportsLoading,
  errors = {},
  onChange,
  onRemove,
}: Props) {
  const meta = DISCOVERY_KIND_META[section.kind];
  const strategies = DISCOVERY_STRATEGIES[section.kind];
  const patch = (next: Partial<DiscoverySectionDefinition>) =>
    onChange({ ...section, ...next });
  const patchFilter = (key: string, value: unknown) => {
    const filters = { ...section.source.filters };
    if (value === undefined || value === "") delete filters[key];
    else filters[key] = value;
    patch({
      source: {
        ...section.source,
        filters: Object.keys(filters).length ? filters : undefined,
      },
    });
  };

  return (
    <Card className="overflow-visible" variant="default">
      <Card.Header className="flex-row items-start justify-between gap-4 border-b border-divider">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-xl text-primary">
            {meta.icon}
          </span>
          <div>
            <Card.Title>
              {index + 1}. {meta.label}
            </Card.Title>
            <Card.Description>{meta.description}</Card.Description>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <Button size="sm" variant="danger-soft" onPress={onRemove}>
            حذف
          </Button>
        </div>
      </Card.Header>

      <Card.Content className="space-y-6 pt-5">
        <section>
          <div className="mb-3">
            <h4 className="font-semibold">محتوای نمایشی</h4>
            <p className="text-sm text-foreground-500">
              متن‌هایی که کاربر بالای این سکشن می‌بیند.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              error={errors.title}
              label="عنوان سکشن (اختیاری)"
              placeholder={`مثلاً ${meta.label}`}
              value={section.content.title}
              onChange={(title) =>
                patch({ content: { ...section.content, title } })
              }
            />
            <Field
              error={errors.subtitle}
              label="توضیح کوتاه (اختیاری)"
              placeholder="یک جمله کوتاه برای راهنمایی کاربر"
              value={section.content.subtitle ?? ""}
              onChange={(subtitle) =>
                patch({
                  content: {
                    ...section.content,
                    subtitle: subtitle || undefined,
                  },
                })
              }
            />
            <AdminIconField
              errorMessage={errors.icon}
              isInvalid={Boolean(errors.icon)}
              label="آیکن عنوان (اختیاری)"
              placeholder="جست‌وجو و انتخاب آیکن"
              value={section.content.icon ?? ""}
              onChange={(icon) =>
                patch({
                  content: { ...section.content, icon: icon || undefined },
                })
              }
            />
          </div>
        </section>

        <section className="rounded-2xl bg-default-50 p-4">
          <div className="mb-3">
            <h4 className="font-semibold">انتخاب محتوا</h4>
            <p className="text-sm text-foreground-500">
              مشخص کنید چه داده‌ای و با چه تعدادی نمایش داده شود.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              fullWidth
              value={section.source.strategy}
              variant="secondary"
              onChange={(value: Key | null) =>
                patch({
                  source: {
                    ...section.source,
                    strategy: String(value) as DiscoverySourceStrategy,
                  },
                })
              }
            >
              <Label>نحوه انتخاب محتوا</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Description>
                {
                  strategies.find(
                    (item) => item.value === section.source.strategy,
                  )?.hint
                }
              </Description>
              <Select.Popover>
                <ListBox>
                  {strategies.map((strategy) => (
                    <ListBox.Item
                      id={strategy.value}
                      key={strategy.value}
                      textValue={strategy.label}
                    >
                      {strategy.label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            <TextField
              fullWidth
              isInvalid={Boolean(errors.limit)}
              value={String(section.source.limit)}
              onChange={(value) =>
                patch({
                  source: {
                    ...section.source,
                    limit: Math.max(1, Math.min(12, Number(value) || 1)),
                  },
                })
              }
            >
              <Label>تعداد کارت‌ها</Label>
              <Input inputMode="numeric" max={12} min={1} type="number" />
              <Description>بین ۱ تا ۱۲ آیتم</Description>
              <FieldError>{errors.limit}</FieldError>
            </TextField>
            {section.kind === "clubs" ? (
              <>
                <DiscoverySportAutocomplete
                  description="فقط باشگاه‌های مرتبط با ورزش انتخاب‌شده نمایش داده می‌شوند."
                  isLoading={sportsLoading}
                  label="فیلتر ورزش (اختیاری)"
                  options={sportOptions}
                  value={
                    typeof section.source.filters?.sportId === "string"
                      ? [section.source.filters.sportId]
                      : []
                  }
                  onChange={(sportIds) => patchFilter("sportId", sportIds[0])}
                />
                <ModelOptionAutocomplete
                  label="دسته‌بندی باشگاه (اختیاری)"
                  options={categoryOptions}
                  placeholder="دسته‌بندی را انتخاب کنید"
                  value={String(section.source.filters?.categoryId ?? "")}
                  onChange={(categoryId) =>
                    patchFilter("categoryId", categoryId)
                  }
                />
                <ModelOptionAutocomplete
                  label="شهر باشگاه (اختیاری)"
                  options={locationOptions}
                  placeholder="شهر را انتخاب کنید"
                  value={String(section.source.filters?.locationId ?? "")}
                  onChange={(locationId) =>
                    patchFilter("locationId", locationId)
                  }
                />
                <SelectField
                  label="حداقل امتیاز باشگاه"
                  options={[
                    { value: "none", label: "بدون محدودیت" },
                    { value: "3", label: "۳ و بالاتر" },
                    { value: "4", label: "۴ و بالاتر" },
                    { value: "4.5", label: "۴٫۵ و بالاتر" },
                  ]}
                  value={String(section.source.filters?.minRating ?? "none")}
                  onChange={(value) =>
                    patchFilter(
                      "minRating",
                      value === "none" ? undefined : Number(value),
                    )
                  }
                />
                <SelectField
                  label="مخاطب باشگاه"
                  options={[
                    { value: "none", label: "همه" },
                    { value: "mixed", label: "مختلط" },
                    { value: "female_only", label: "ویژه بانوان" },
                    { value: "male_only", label: "ویژه آقایان" },
                  ]}
                  value={String(section.source.filters?.genderPolicy ?? "none")}
                  onChange={(value) =>
                    patchFilter(
                      "genderPolicy",
                      value === "none" ? undefined : value,
                    )
                  }
                />
                {section.source.strategy === "nearby" ? (
                  <TextField
                    fullWidth
                    isInvalid={Boolean(errors.radiusMeters)}
                    value={String(
                      section.source.filters?.radiusMeters ?? 10000,
                    )}
                    onChange={(value) =>
                      patchFilter("radiusMeters", Number(value))
                    }
                  >
                    <Label>شعاع جست‌وجو</Label>
                    <Input
                      inputMode="numeric"
                      max={100000}
                      min={100}
                      type="number"
                    />
                    <Description>فاصله بر حسب متر</Description>
                    <FieldError>{errors.radiusMeters}</FieldError>
                  </TextField>
                ) : null}
              </>
            ) : null}
            {section.kind === "coaches" ||
            section.kind === "classes" ||
            section.kind === "spaces" ? (
              <DiscoverySportAutocomplete
                description="فقط موارد مرتبط با ورزش انتخاب‌شده نمایش داده می‌شوند."
                isLoading={sportsLoading}
                label="فیلتر ورزش (اختیاری)"
                options={sportOptions}
                value={
                  typeof section.source.filters?.sportId === "string"
                    ? [section.source.filters.sportId]
                    : []
                }
                onChange={(sportIds) => patchFilter("sportId", sportIds[0])}
              />
            ) : null}
            {section.kind === "coaches" &&
            section.source.strategy === "nearby" ? (
              <ModelOptionAutocomplete
                label="شهر مربی (اختیاری)"
                options={locationOptions}
                placeholder="شهر را انتخاب کنید"
                value={String(section.source.filters?.locationId ?? "")}
                onChange={(locationId) => patchFilter("locationId", locationId)}
              />
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-divider p-4">
          <div className="mb-3">
            <h4 className="font-semibold">ظاهر سکشن</h4>
            <p className="text-sm text-foreground-500">
              شکل چیدمان کارت‌ها و پس‌زمینه را مشخص کنید.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              description="در حالت تک کارت، تعداد آیتم خودکار باید ۱ باشد."
              error={errors.layout}
              label="نوع چیدمان"
              options={LAYOUT_OPTIONS.filter((option) =>
                section.kind === "banners"
                  ? ["hero", "single", "horizontal"].includes(option.value)
                  : ["horizontal", "grid", "single"].includes(option.value),
              )}
              value={section.presentation.layout}
              onChange={(layout) =>
                patch({
                  presentation: { ...section.presentation, layout },
                  source:
                    layout === "single"
                      ? { ...section.source, limit: 1 }
                      : section.source,
                })
              }
            />
            <SelectField
              label="ظاهر کارت"
              options={[
                { value: "default", label: "استاندارد" },
                { value: "compact", label: "فشرده" },
                { value: "featured", label: "برجسته" },
                { value: "minimal", label: "مینیمال" },
              ]}
              value={section.presentation.cardVariant ?? "default"}
              onChange={(cardVariant) =>
                patch({
                  presentation: {
                    ...section.presentation,
                    cardVariant,
                  },
                })
              }
            />
            {section.presentation.layout === "grid" ? (
              <SelectField
                error={errors.rows}
                label="تعداد ردیف"
                options={[1, 2, 3, 4].map((rows) => ({
                  value: String(rows),
                  label: `${rows} ردیف`,
                }))}
                value={String(section.presentation.rows ?? 1)}
                onChange={(rows) =>
                  patch({
                    presentation: {
                      ...section.presentation,
                      rows: Number(rows),
                    },
                  })
                }
              />
            ) : null}
            <SelectField
              label="رنگ زمینه"
              options={[
                { value: "surface", label: "سطح معمولی" },
                { value: "muted", label: "خنثی" },
                { value: "accent", label: "رنگ برند" },
                { value: "warning", label: "تأکیدی" },
              ]}
              value={section.presentation.background?.tone ?? "surface"}
              onChange={(tone) =>
                patch({
                  presentation: {
                    ...section.presentation,
                    background: {
                      ...section.presentation.background,
                      tone,
                    },
                  },
                })
              }
            />
            <SelectField
              label="الگوی پس‌زمینه"
              options={[
                { value: "none", label: "بدون الگو" },
                { value: "dots", label: "نقطه‌ای" },
                { value: "grid", label: "شبکه‌ای" },
                { value: "waves", label: "موجی" },
              ]}
              value={section.presentation.background?.pattern ?? "none"}
              onChange={(pattern) =>
                patch({
                  presentation: {
                    ...section.presentation,
                    background: {
                      ...section.presentation.background,
                      pattern: pattern === "none" ? undefined : pattern,
                    },
                  },
                })
              }
            />
          </div>
        </section>

        <section>
          <div className="mb-3">
            <h4 className="font-semibold">نمایش هدفمند</h4>
            <p className="text-sm text-foreground-500">
              اگر محدودیتی نگذارید، این سکشن برای همه نمایش داده می‌شود.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              fullWidth
              value={section.targeting?.authentication ?? "all"}
              variant="secondary"
              onChange={(value: Key | null) =>
                patch({
                  targeting: {
                    ...section.targeting,
                    authentication: String(value) as
                      "all" | "guest" | "required",
                  },
                })
              }
            >
              <Label>مخاطب سکشن</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="all" textValue="همه کاربران">
                    همه کاربران
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="guest" textValue="فقط کاربران مهمان">
                    فقط کاربران مهمان
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="required" textValue="فقط کاربران واردشده">
                    فقط کاربران واردشده
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
            <DiscoverySportAutocomplete
              description="فقط کاربرانی که یکی از این ورزش‌ها را در علایق خود دارند."
              isLoading={sportsLoading}
              label="علایق ورزشی (اختیاری)"
              options={sportOptions}
              value={section.targeting?.sportIds ?? []}
              onChange={(sportIds) =>
                patch({
                  targeting: {
                    ...section.targeting,
                    sportIds,
                  },
                })
              }
            />
            <SelectField
              label="تطبیق علایق"
              options={[
                { value: "any", label: "داشتن حداقل یکی از علایق" },
                { value: "all", label: "داشتن همه علایق" },
              ]}
              value={section.targeting?.match ?? "any"}
              onChange={(match) =>
                patch({
                  targeting: {
                    ...section.targeting,
                    match: match as "any" | "all",
                  },
                })
              }
            />
            <CheckboxGroup
              value={section.targeting?.activeRoles ?? []}
              onChange={(activeRoles) =>
                patch({
                  targeting: {
                    ...section.targeting,
                    activeRoles: activeRoles as Role[],
                  },
                })
              }
            >
              <Label>نقش‌های مجاز (اختیاری)</Label>
              <div className="flex flex-wrap gap-4">
                <Checkbox value="athlete">ورزشکار</Checkbox>
                <Checkbox value="coach">مربی</Checkbox>
                <Checkbox value="club_owner">مالک باشگاه</Checkbox>
                <Checkbox value="club_staff">پرسنل باشگاه</Checkbox>
              </div>
            </CheckboxGroup>
          </div>
        </section>

        <section className="rounded-2xl border border-divider p-4">
          <div className="mb-3">
            <h4 className="font-semibold">دکمه و محتوای خالی</h4>
            <p className="text-sm text-foreground-500">
              رفتار سکشن را برای مشاهده همه یا نبودن داده تنظیم کنید.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              error={errors.actionLink}
              label="لینک دکمه (اختیاری)"
              placeholder="/discovery/clubs"
              value={section.content.action?.link ?? ""}
              onChange={(link) =>
                patch({
                  content: {
                    ...section.content,
                    action: link
                      ? {
                          ...section.content.action,
                          label: section.content.action?.label ?? "مشاهده همه",
                          link,
                        }
                      : undefined,
                  },
                })
              }
            />
            {section.content.action ? (
              <>
                <Field
                  error={errors.actionLabel}
                  label="متن دکمه (اختیاری)"
                  placeholder="مشاهده همه"
                  value={section.content.action.label ?? ""}
                  onChange={(label) =>
                    patch({
                      content: {
                        ...section.content,
                        action: {
                          ...section.content.action!,
                          label: label || undefined,
                        },
                      },
                    })
                  }
                />
                <SelectField
                  label="ظاهر دکمه"
                  options={[
                    { value: "link", label: "لینک ساده" },
                    { value: "button", label: "دکمه" },
                    { value: "outline", label: "دکمه خطی" },
                  ]}
                  value={section.content.action.variant ?? "link"}
                  onChange={(variant) =>
                    patch({
                      content: {
                        ...section.content,
                        action: { ...section.content.action!, variant },
                      },
                    })
                  }
                />
              </>
            ) : null}
            <SelectField
              label="اگر داده‌ای نبود"
              options={[
                { value: "hide", label: "سکشن نمایش داده نشود" },
                { value: "show_empty", label: "حالت خالی نمایش داده شود" },
                { value: "fallback", label: "از منبع جایگزین استفاده شود" },
              ]}
              value={section.emptyBehavior ?? "hide"}
              onChange={(emptyBehavior) =>
                patch({
                  emptyBehavior: emptyBehavior as
                    "hide" | "show_empty" | "fallback",
                  fallback:
                    emptyBehavior === "fallback"
                      ? {
                          strategy: strategies[0]!.value,
                        }
                      : undefined,
                })
              }
            />
            {section.emptyBehavior === "fallback" ? (
              <SelectField
                label="منبع جایگزین"
                options={strategies.map(({ value, label }) => ({
                  value,
                  label,
                }))}
                value={section.fallback?.strategy ?? strategies[0]!.value}
                onChange={(strategy) =>
                  patch({
                    fallback: {
                      ...section.fallback,
                      strategy: strategy as DiscoverySourceStrategy,
                    },
                  })
                }
              />
            ) : null}
          </div>
        </section>
      </Card.Content>
    </Card>
  );
}
