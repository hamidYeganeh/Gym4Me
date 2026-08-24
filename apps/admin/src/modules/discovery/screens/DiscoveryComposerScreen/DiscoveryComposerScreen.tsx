import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DiscoverySectionDefinition,
  DiscoverySectionKind,
} from "@repo/api/discovery";
import type {
  AdminDiscoveryPage,
  PreviewDiscoveryDraftResponse,
} from "@repo/api/admin";
import { ApiError } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { AdminShell } from "@/shared/components";
import { adminDiscovery } from "@/shared/lib/api";
import { DiscoverySectionEditor } from "../../components/DiscoverySectionEditor";

const PAGE_KEY = "discovery_home";

const COMPONENTS: Record<DiscoverySectionKind, string> = {
  banners: "banner_carousel",
  club_categories: "club_category_grid",
  sport_categories: "sport_category_rail",
  sports: "sport_rail",
  clubs: "club_rail",
  articles: "article_rail",
};

function newSection(
  kind: DiscoverySectionKind = "clubs",
): DiscoverySectionDefinition {
  const id = `${kind}-${Date.now().toString(36)}`;
  return {
    id,
    kind,
    content: { title: "سکشن جدید" },
    source: {
      strategy:
        kind === "articles"
          ? "latest"
          : kind === "clubs"
            ? "top_rated"
            : kind === "banners"
              ? "active"
              : "featured",
      limit: 8,
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

export function DiscoveryComposerScreen() {
  const [page, setPage] = useState<AdminDiscoveryPage | null>(null);
  const [sections, setSections] = useState<DiscoverySectionDefinition[]>([]);
  const [preview, setPreview] = useState<PreviewDiscoveryDraftResponse | null>(
    null,
  );
  const [authenticatedPreview, setAuthenticatedPreview] = useState(true);
  const [sportIds, setSportIds] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const next = await adminDiscovery.get(PAGE_KEY);
      setPage(next);
      setSections(next.draftSections);
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause.message : "بارگذاری ناموفق بود.",
      );
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const next = await adminDiscovery.saveDraft(PAGE_KEY, { sections });
      setPage(next);
      toast.success("پیش‌نویس ذخیره شد.");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "ذخیره ناموفق بود.");
    } finally {
      setBusy(false);
    }
  };

  const runPreview = async () => {
    setBusy(true);
    setError(null);
    try {
      await adminDiscovery.saveDraft(PAGE_KEY, { sections });
      const next = await adminDiscovery.preview(PAGE_KEY, {
        page: 1,
        page_size: 8,
        context: {
          authenticated: authenticatedPreview,
          activeRole: authenticatedPreview ? "athlete" : undefined,
          sportIds: sportIds
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        },
      });
      setPreview(next);
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause.message : "پیش‌نمایش ناموفق بود.",
      );
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    setBusy(true);
    setError(null);
    try {
      await adminDiscovery.saveDraft(PAGE_KEY, { sections });
      const next = await adminDiscovery.publish(PAGE_KEY);
      setPage(next);
      toast.success(`نسخه ${next.publishedRevision} منتشر شد.`);
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause.message : "انتشار ناموفق بود.",
      );
    } finally {
      setBusy(false);
    }
  };

  const summary = useMemo(
    () => `${sections.length} سکشن · ${Math.ceil(sections.length / 8)} صفحه`,
    [sections.length],
  );

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    setSections((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  };

  return (
    <AdminShell
      activeNavId="ops"
      breadcrumbs={[{ label: "صفحات اکتشاف" }]}
      opsSection={{ activeTabId: "discovery" }}
    >
      <div className="space-y-5 p-4 md:p-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">چیدمان صفحه اکتشاف</h1>
            <p className="mt-1 text-sm text-foreground-500">
              {summary} · نسخه منتشرشده {page?.publishedRevision ?? 0}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-xl border border-divider px-4 py-2"
              disabled={busy}
              type="button"
              onClick={() =>
                setSections((current) => [...current, newSection()])
              }
            >
              افزودن سکشن
            </button>
            <button
              className="rounded-xl border border-primary px-4 py-2 text-primary"
              disabled={busy}
              type="button"
              onClick={() => void save()}
            >
              ذخیره پیش‌نویس
            </button>
            <button
              className="rounded-xl bg-primary px-4 py-2 text-primary-foreground"
              disabled={busy}
              type="button"
              onClick={() => void publish()}
            >
              انتشار
            </button>
          </div>
        </header>

        {error ? (
          <div className="rounded-xl bg-danger-50 p-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-4">
            {sections.map((section, index) => (
              <DiscoverySectionEditor
                index={index}
                key={section.id}
                section={section}
                total={sections.length}
                onChange={(next) =>
                  setSections((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? next : item,
                    ),
                  )
                }
                onMove={(direction) => move(index, direction)}
                onRemove={() =>
                  setSections((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              />
            ))}
          </div>

          <aside className="sticky top-4 space-y-4 rounded-2xl border border-divider bg-surface p-4">
            <div>
              <h2 className="font-semibold">پیش‌نمایش داده واقعی</h2>
              <p className="text-xs text-foreground-500">
                همان composer و targeting مورد استفاده موبایل
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                checked={authenticatedPreview}
                type="checkbox"
                onChange={(event) =>
                  setAuthenticatedPreview(event.target.checked)
                }
              />
              کاربر واردشده با نقش ورزشکار
            </label>
            <label className="space-y-1 text-sm">
              <span>علایق آزمایشی (slug/id)</span>
              <input
                className="w-full rounded-xl border border-divider bg-surface px-3 py-2"
                placeholder="yoga, bodybuilding"
                value={sportIds}
                onChange={(event) => setSportIds(event.target.value)}
              />
            </label>
            <button
              className="w-full rounded-xl bg-default-100 px-4 py-2 font-medium"
              disabled={busy}
              type="button"
              onClick={() => void runPreview()}
            >
              {busy ? "در حال پردازش..." : "ساخت پیش‌نمایش"}
            </button>
            <div className="max-h-[60vh] space-y-3 overflow-auto">
              {preview?.result.map((section) => (
                <section
                  className="rounded-xl bg-default-50 p-3"
                  key={section.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-sm">{section.content.title}</strong>
                    <span className="text-xs text-foreground-500">
                      {section.items.length} آیتم
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2 overflow-hidden">
                    {section.items.slice(0, 4).map((item, index) => (
                      <div
                        className="min-w-24 rounded-lg border border-divider bg-surface p-2 text-xs"
                        key={`${section.id}-${index}`}
                      >
                        {itemLabel(item)}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}
