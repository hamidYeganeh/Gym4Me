import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import type {
  AdminBanner,
  BannerPlacement,
  BannerSlideInput,
  PublishStatus,
} from "@repo/api";
import { ApiError } from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminFormDrawer,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminBanners } from "@/shared/lib/api";
import { BannerSlidesField } from "../../components/BannerSlidesField";
import {
  BANNER_PLACEMENTS,
  PUBLISH_STATUSES,
} from "../../lib/banner-constants";
import { bannersListScreenVariants } from "./BannersListScreen.styles";
import type { BannersListScreenProps } from "./BannersListScreen.types";

const PAGE_SIZE = 30;

const columnHelper = createColumnHelper<AdminBanner>();

type BannerTableMeta = {
  onEdit: (row: AdminBanner) => void;
  onDelete: (row: AdminBanner) => void;
  actionsClassName: string;
};

/** ISO date-time → value usable by `<input type="datetime-local">`. */
function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromLocalInputValue(value: string) {
  if (!value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function BannersListScreen({ className }: BannersListScreenProps) {
  const t = useTranslations("Admin.Banners");
  const styles = bannersListScreenVariants();

  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">(
    "all",
  );
  const [placementFilter, setPlacementFilter] = useState<
    BannerPlacement | "all"
  >("all");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBanner | null>(null);
  const [title, setTitle] = useState("");
  const [placement, setPlacement] =
    useState<BannerPlacement>("discovery_home");
  const [slides, setSlides] = useState<BannerSlideInput[]>([]);
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("draft");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [order, setOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<AdminBanner | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        statusFilter,
        placementFilter,
        search,
        pageSize: PAGE_SIZE,
      }),
    [statusFilter, placementFilter, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminBanners.list({
        page,
        page_size: pageSize,
        publishStatus: statusFilter === "all" ? undefined : statusFilter,
        placement: placementFilter === "all" ? undefined : placementFilter,
        search: search.trim() || undefined,
      });
    },
    [statusFilter, placementFilter, search],
  );

  const {
    items,
    total,
    loading,
    fetchingMore,
    hasMore,
    error,
    loadMore,
    reload,
  } = useAdminInfiniteQuery<AdminBanner>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setPlacement(placementFilter === "all" ? "discovery_home" : placementFilter);
    setSlides([]);
    setPublishStatus("draft");
    setStartsAt("");
    setEndsAt("");
    setOrder("0");
    setSaveError(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: AdminBanner) => {
    setEditing(row);
    setTitle(row.title);
    setPlacement(row.placement);
    setSlides(
      row.slides.map((slide) => ({
        mediaId: slide.mediaId,
        linkKind: slide.linkKind,
        linkUrl: slide.linkUrl ?? undefined,
        alt: slide.alt ?? undefined,
      })),
    );
    setPublishStatus(row.publishStatus);
    setStartsAt(toLocalInputValue(row.schedule.startsAt));
    setEndsAt(toLocalInputValue(row.schedule.endsAt));
    setOrder(String(row.order));
    setSaveError(null);
    setDrawerOpen(true);
  };

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("title", {
          header: t("columns.title"),
          size: 220,
          enableSorting: false,
          cell: (info) => (
            <span className="block truncate font-medium">
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("placement", {
          header: t("columns.placement"),
          size: 150,
          enableSorting: false,
          cell: (info) => t(`placements.${info.getValue()}`),
        }),
        columnHelper.accessor((row) => row.slides.length, {
          id: "slides",
          header: t("columns.slides"),
          size: 80,
          enableSorting: false,
          cell: (info) => (
            <span className="tabular-nums">{info.getValue()}</span>
          ),
        }),
        columnHelper.accessor("publishStatus", {
          header: t("columns.publishStatus"),
          size: 120,
          enableSorting: false,
          cell: (info) => {
            const status = info.getValue();
            const color =
              status === "published"
                ? "success"
                : status === "draft"
                  ? "warning"
                  : "danger";
            return (
              <Chip color={color} size="sm" variant="soft">
                {t(`publishStatus.${status}`)}
              </Chip>
            );
          },
        }),
        columnHelper.accessor("order", {
          header: t("columns.order"),
          size: 70,
          enableSorting: false,
          cell: (info) => (
            <span className="tabular-nums">{info.getValue()}</span>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: t("columns.actions"),
          size: 160,
          cell: (info) => {
            const meta = info.table.options.meta as
              | BannerTableMeta
              | undefined;
            if (!meta) return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(info.row.original)}
                >
                  {t("actions.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onPress={() => meta.onDelete(info.row.original)}
                >
                  {t("actions.delete")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<AdminBanner, unknown>[],
    [t],
  );

  const meta: BannerTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: openEdit,
    onDelete: (row) => {
      setDeleting(row);
      setDeleteError(null);
    },
  };

  const canSave = title.trim().length >= 2 && slides.length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    const input = {
      title: title.trim(),
      placement,
      slides,
      publishStatus,
      schedule: {
        startsAt: fromLocalInputValue(startsAt),
        endsAt: fromLocalInputValue(endsAt),
      },
      order: Number.parseInt(order, 10) || 0,
    };
    try {
      if (editing) {
        await adminBanners.update(editing.id, input);
      } else {
        await adminBanners.create(input);
      }
      setDrawerOpen(false);
      void reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletePending(true);
    setDeleteError(null);
    try {
      await adminBanners.delete(deleting.id);
      setDeleting(null);
      void reload();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="banners"
      bannersSection={{
        searchValue: search,
        onSearchChange: setSearch,
      }}
      className={className}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("subtitle")}
          </Typography>
          <div className={styles.actions()}>
            {(["all", ...PUBLISH_STATUSES] as const).map((value) => (
              <FilterChip
                key={value}
                onPress={() => setStatusFilter(value)}
                selected={statusFilter === value}
              >
                {value === "all" ? t("filterAll") : t(`publishStatus.${value}`)}
              </FilterChip>
            ))}
            <Button size="sm" variant="primary" onPress={openCreate}>
              {t("actions.create")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
          <div className={styles.actions()}>
            {(["all", ...BANNER_PLACEMENTS] as const).map((value) => (
              <FilterChip
                key={value}
                onPress={() => setPlacementFilter(value)}
                selected={placementFilter === value}
              >
                {value === "all" ? t("filterAll") : t(`placements.${value}`)}
              </FilterChip>
            ))}
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("title")}
          columns={columns}
          data={items}
          emptyLabel={t("empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          summaryLabel={t("infinite.summary", {
            loaded: items.length,
            total,
          })}
          onLoadMore={loadMore}
        />
      </div>

      <AdminFormDrawer
        className="max-w-3xl sm:max-w-3xl"
        isOpen={drawerOpen}
        title={editing ? t("actions.editTitle") : t("actions.createTitle")}
        onOpenChange={setDrawerOpen}
      >
        <div className={styles.form()}>
          <TextField
            className={styles.field()}
            fullWidth
            name="title"
            value={title}
            onChange={setTitle}
          >
            <Label>{t("fields.title")}</Label>
            <Input placeholder={t("fields.titleHint")} />
          </TextField>

          <div className={styles.field()}>
            <Label>{t("fields.placement")}</Label>
            <div className={styles.chips()}>
              {BANNER_PLACEMENTS.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={placement === value ? "primary" : "secondary"}
                  onPress={() => setPlacement(value)}
                >
                  {t(`placements.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          <BannerSlidesField
            disabled={saving}
            labels={{
              label: t("fields.slides"),
              hint: t("fields.slidesHint"),
              empty: t("fields.slidesEmpty"),
              linkKindLabel: t("fields.linkKind"),
              linkKinds: {
                none: t("linkKinds.none"),
                internal: t("linkKinds.internal"),
                external: t("linkKinds.external"),
              },
              linkUrlLabel: t("fields.linkUrl"),
              linkUrlInternalHint: t("fields.linkUrlInternalHint"),
              linkUrlExternalHint: t("fields.linkUrlExternalHint"),
              altLabel: t("fields.alt"),
              remove: t("actions.removeSlide"),
              uploaderTitle: t("uploader.title"),
              uploaderDescription: t("uploader.description"),
              uploaderButtonLabel: t("uploader.button"),
              uploadError: t("uploader.error"),
            }}
            value={slides}
            onChange={setSlides}
          />

          <div className={styles.field()}>
            <Label>{t("fields.publishStatus")}</Label>
            <div className={styles.chips()}>
              {PUBLISH_STATUSES.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={publishStatus === value ? "primary" : "secondary"}
                  onPress={() => setPublishStatus(value)}
                >
                  {t(`publishStatus.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          <div className={styles.scheduleRow()}>
            <TextField
              className={styles.field()}
              fullWidth
              name="startsAt"
              value={startsAt}
              onChange={setStartsAt}
            >
              <Label>{t("fields.startsAt")}</Label>
              <Input dir="ltr" type="datetime-local" />
            </TextField>

            <TextField
              className={styles.field()}
              fullWidth
              name="endsAt"
              value={endsAt}
              onChange={setEndsAt}
            >
              <Label>{t("fields.endsAt")}</Label>
              <Input dir="ltr" type="datetime-local" />
            </TextField>
          </div>

          <TextField
            className={styles.field()}
            fullWidth
            name="order"
            value={order}
            onChange={setOrder}
          >
            <Label>{t("fields.order")}</Label>
            <Input inputMode="numeric" />
          </TextField>

          {saveError ? (
            <p className="text-sm text-danger" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={saving || !canSave}
              variant="primary"
              onPress={() => void handleSave()}
            >
              {t("actions.save")}
            </Button>
            <Button
              isDisabled={saving}
              variant="secondary"
              onPress={() => setDrawerOpen(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminConfirmDialog
        body={
          <>
            <p>{t("actions.deleteBody")}</p>
            {deleteError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {deleteError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("actions.delete")}
        confirmVariant="danger"
        isOpen={Boolean(deleting)}
        isPending={deletePending}
        title={t("actions.deleteTitle")}
        onConfirm={() => void handleDelete()}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </AdminShell>
  );
}
