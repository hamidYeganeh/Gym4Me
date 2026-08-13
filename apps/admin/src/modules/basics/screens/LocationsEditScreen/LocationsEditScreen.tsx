import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Spinner, Typography } from "@heroui/react";
import type { LocationNode } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminBasics } from "@/shared/lib/api";
import { isLocationKind } from "@/shared/lib/basics-constants";
import { routes } from "@/shared/lib/routes";
import {
  LocationsForm,
  locationToFormValues,
  parseCoordinates,
  type LocationsFormValues,
} from "../../components/LocationsForm";
import { locationsEditScreenVariants } from "./LocationsEditScreen.styles";
import type { LocationsEditScreenProps } from "./LocationsEditScreen.types";

export function LocationsEditScreen({ className }: LocationsEditScreenProps) {
  const t = useTranslations("Admin.Basics");
  const tForm = useTranslations("Admin.Form");
  const { kind = "country", locationId = "" } = useParams<{
    kind: string;
    locationId: string;
  }>();
  const navigate = useNavigate();
  const styles = locationsEditScreenVariants();
  const [item, setItem] = useState<LocationNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialValues = useMemo(
    () => (item ? locationToFormValues(item) : null),
    [item],
  );

  const load = useCallback(async () => {
    if (!locationId) return;
    setLoading(true);
    setError(null);
    try {
      setItem(await adminBasics.getLocation(locationId));
    } catch (err) {
      setItem(null);
      setError(err instanceof Error ? err.message : t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [locationId, t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  if (!isLocationKind(kind)) {
    return <Navigate replace to={routes.locations()} />;
  }

  const handleEdit = async (
    values: LocationsFormValues,
    _intent: FormSubmitIntent,
  ) => {
    if (!item) return;
    const showCoordinates = kind !== "country";
    const showIcon = kind === "country";
    await adminBasics.updateLocation(item.id, {
      name: values.name.trim(),
      slug: values.slug.trim() || undefined,
      description: values.description.trim() || undefined,
      icon: showIcon ? values.icon.trim() || null : undefined,
      flagSvg: showIcon ? values.flagSvg.trim() || null : undefined,
      coverMediaId: values.coverMediaId,
      center: showCoordinates ? parseCoordinates(values) : undefined,
      order: Number(values.order) || 0,
      isActive: values.isActive,
    });
    toast.success(tForm("saved"));
    navigate(routes.locations(kind));
  };

  return (
    <AdminShell
      activeNavId="locations"
      breadcrumbs={[
        { label: item?.name ?? t("edit") },
        { label: t("edit") },
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
        {item && initialValues ? (
          <AdminFormPage title={t("locations.editTitle")}>
            <LocationsForm
              initialValues={initialValues}
              kind={kind}
              mode="edit"
              onCancel={() => navigate(routes.locations(kind))}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
