import type {
  DiscoverySectionDefinition,
  DiscoverySectionKind,
  DiscoverySourceStrategy,
} from "@repo/api/discovery";

const KIND_LABELS: Record<DiscoverySectionKind, string> = {
  banners: "بنرها",
  club_categories: "دسته‌های باشگاه",
  sport_categories: "دسته‌های ورزش",
  sports: "ورزش‌ها",
  clubs: "باشگاه‌ها",
  articles: "مقاله‌ها",
};

const STRATEGIES: Record<DiscoverySectionKind, DiscoverySourceStrategy[]> = {
  banners: ["active"],
  club_categories: ["featured"],
  sport_categories: ["featured"],
  sports: ["featured"],
  clubs: ["top_rated", "nearby", "recommended_for_user", "featured"],
  articles: ["latest"],
};

const COMPONENTS: Record<DiscoverySectionKind, string> = {
  banners: "banner_carousel",
  club_categories: "club_category_grid",
  sport_categories: "sport_category_rail",
  sports: "sport_rail",
  clubs: "club_rail",
  articles: "article_rail",
};

export const DISCOVERY_SECTION_KINDS = Object.keys(
  KIND_LABELS,
) as DiscoverySectionKind[];

type Props = {
  index: number;
  section: DiscoverySectionDefinition;
  total: number;
  onChange: (section: DiscoverySectionDefinition) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
};

const inputClass =
  "w-full rounded-xl border border-divider bg-surface px-3 py-2 text-sm outline-none focus:border-primary";

function commaList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function DiscoverySectionEditor({
  index,
  section,
  total,
  onChange,
  onMove,
  onRemove,
}: Props) {
  const patch = (next: Partial<DiscoverySectionDefinition>) =>
    onChange({ ...section, ...next });

  const changeKind = (kind: DiscoverySectionKind) => {
    patch({
      kind,
      source: { ...section.source, strategy: STRATEGIES[kind][0]! },
      presentation: {
        ...section.presentation,
        component: COMPONENTS[kind],
      },
    });
  };

  return (
    <article className="rounded-2xl border border-divider bg-surface p-4 shadow-sm">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <span className="text-xs text-foreground-500">سکشن {index + 1}</span>
          <h3 className="font-semibold">
            {section.content.title || section.id}
          </h3>
        </div>
        <div className="flex gap-1">
          <button
            className="rounded-lg border border-divider px-2 py-1 disabled:opacity-40"
            disabled={index === 0}
            type="button"
            onClick={() => onMove(-1)}
          >
            ↑
          </button>
          <button
            className="rounded-lg border border-divider px-2 py-1 disabled:opacity-40"
            disabled={index === total - 1}
            type="button"
            onClick={() => onMove(1)}
          >
            ↓
          </button>
          <button
            className="rounded-lg border border-danger-200 px-2 py-1 text-danger"
            type="button"
            onClick={onRemove}
          >
            حذف
          </button>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>شناسه یکتا</span>
          <input
            className={inputClass}
            value={section.id}
            onChange={(event) => patch({ id: event.target.value })}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>نوع داده</span>
          <select
            className={inputClass}
            value={section.kind}
            onChange={(event) =>
              changeKind(event.target.value as DiscoverySectionKind)
            }
          >
            {DISCOVERY_SECTION_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {KIND_LABELS[kind]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span>عنوان</span>
          <input
            className={inputClass}
            value={section.content.title}
            onChange={(event) =>
              patch({
                content: { ...section.content, title: event.target.value },
              })
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>زیرعنوان</span>
          <input
            className={inputClass}
            value={section.content.subtitle ?? ""}
            onChange={(event) =>
              patch({
                content: {
                  ...section.content,
                  subtitle: event.target.value || undefined,
                },
              })
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>استراتژی داده</span>
          <select
            className={inputClass}
            value={section.source.strategy}
            onChange={(event) =>
              patch({
                source: {
                  ...section.source,
                  strategy: event.target.value as DiscoverySourceStrategy,
                },
              })
            }
          >
            {STRATEGIES[section.kind].map((strategy) => (
              <option key={strategy} value={strategy}>
                {strategy}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span>تعداد آیتم (۱ تا ۱۲)</span>
          <input
            className={inputClass}
            max={12}
            min={1}
            type="number"
            value={section.source.limit}
            onChange={(event) =>
              patch({
                source: {
                  ...section.source,
                  limit: Number(event.target.value),
                },
              })
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>Layout</span>
          <select
            className={inputClass}
            value={section.presentation.layout}
            onChange={(event) =>
              patch({
                presentation: {
                  ...section.presentation,
                  layout: event.target.value,
                },
              })
            }
          >
            <option value="horizontal">horizontal</option>
            <option value="grid">grid</option>
            <option value="hero">hero</option>
            <option value="single">single</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span>لینک مشاهده همه</span>
          <input
            className={inputClass}
            value={section.content.action?.link ?? ""}
            onChange={(event) =>
              patch({
                content: {
                  ...section.content,
                  action: event.target.value
                    ? {
                        ...section.content.action,
                        label: section.content.action?.label ?? "مشاهده همه",
                        link: event.target.value,
                      }
                    : undefined,
                },
              })
            }
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>نمایش برای</span>
          <select
            className={inputClass}
            value={section.targeting?.authentication ?? "all"}
            onChange={(event) =>
              patch({
                targeting: {
                  ...section.targeting,
                  authentication: event.target.value as
                    "all" | "guest" | "required",
                },
              })
            }
          >
            <option value="all">همه</option>
            <option value="guest">فقط مهمان</option>
            <option value="required">فقط کاربر واردشده</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span>علایق ورزشی (slug/id با کاما)</span>
          <input
            className={inputClass}
            value={section.targeting?.sportIds?.join(", ") ?? ""}
            onChange={(event) =>
              patch({
                targeting: {
                  ...section.targeting,
                  sportIds: commaList(event.target.value),
                },
              })
            }
          />
        </label>
      </div>
    </article>
  );
}
