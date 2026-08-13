import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner, Typography } from "@heroui/react";
import type { AdminBanner } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminBanners } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  bannerToFormValues,
  BannersForm,
  fromLocalInputValue,
  type BannersFormValues,
} from "../../components/BannersForm";
import { bannersEditScreenVariants } from "./BannersEditScreen.styles";
import type { BannersEditScreenProps } from "./BannersEditScreen.types";

export function BannersEditScreen({ className }: BannersEditScreenProps) {
  const t = useTranslations("Admin.Banners");
  const tForm = useTranslations("Admin.Form");
  const { bannerId = "" } = useParams<{ bannerId: string }>();
  const navigate = useNavigate();
  const styles = bannersEditScreenVariants();

  const [banner, setBanner] = useState<AdminBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialValues = useMemo(
    () => (banner ? bannerToFormValues(banner) : null),
    [banner],
  );

  const load = useCallback(async () => {
    if (!bannerId) return;
    setLoading(true);
    setError(null);
    try {
      setBanner(await adminBanners.get(bannerId));
    } catch (err) {
      setBanner(null);
      setError(err instanceof Error ? err.message : t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [bannerId, t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleEdit = async (
    values: BannersFormValues,
    _intent: FormSubmitIntent,
  ) => {
    if (!banner) return;
    await adminBanners.update(banner.id, {
      title: values.title.trim(),
      placement: values.placement,
      slides: values.slides,
      publishStatus: values.publishStatus,
      schedule: {
        startsAt: fromLocalInputValue(values.startsAt),
        endsAt: fromLocalInputValue(values.endsAt),
      },
      order: Number.parseInt(values.order, 10) || 0,
    });
    toast.success(tForm("saved"));
    navigate(routes.banners);
  };

  return (
    <AdminShell
      activeNavId="banners"
      breadcrumbs={[
        { label: banner?.title ?? t("actions.edit") },
        { label: t("actions.edit") },
      ]}
      className={className}
    >
      <div className={styles.content()}>
        {loading ? (
          <div className={styles.status()}>
            <Spinner />
          </div>
        ) : null}
        {error ? (
          <Typography className={styles.error()} role="alert">
            {error}
          </Typography>
        ) : null}
        {banner && initialValues ? (
          <AdminFormPage title={t("actions.editTitle")}>
            <BannersForm
              initialValues={initialValues}
              mode="edit"
              onCancel={() => navigate(routes.banners)}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
