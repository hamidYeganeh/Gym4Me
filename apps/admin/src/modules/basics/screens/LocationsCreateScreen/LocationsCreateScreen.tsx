import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  locationsFormDefaults,
  parseCoordinates,
  type LocationsFormValues,
} from "../../components/LocationsForm";
import { LOCATION_PARENT_KIND } from "../../lib/basics-constants";
import { locationsCreateScreenVariants } from "./LocationsCreateScreen.styles";
import type { LocationsCreateScreenProps } from "./LocationsCreateScreen.types";

export function LocationsCreateScreen({
  className,
}: LocationsCreateScreenProps) {
  const t = useTranslations("Admin.Basics");
  const tForm = useTranslations("Admin.Form");
  const { kind = "country" } = useParams<{ kind: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const styles = locationsCreateScreenVariants();
  const [parents, setParents] = useState<LocationNode[]>([]);

  const parentId = searchParams.get("parentId") ?? "";
  const parentKind = isLocationKind(kind) ? LOCATION_PARENT_KIND[kind] : null;
  const initialValues = useMemo(
    () => ({ ...locationsFormDefaults, parentId }),
    [parentId],
  );

  const loadParents = useCallback(async () => {
    if (!parentKind) {
      setParents([]);
      return;
    }
    try {
      const result = await adminBasics.listLocations({ kind: parentKind });
      setParents(result.result);
    } catch {
      setParents([]);
    }
  }, [parentKind]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void loadParents();
    });
    return () => {
      cancelled = true;
    };
  }, [loadParents]);

  if (!isLocationKind(kind)) {
    return <Navigate replace to={routes.locations()} />;
  }

  const handleCreate = async (
    values: LocationsFormValues,
    intent: FormSubmitIntent,
  ) => {
    const showCoordinates = kind !== "country";
    const showIcon = kind === "country";
    await adminBasics.createLocation({
      kind,
      name: values.name.trim(),
      slug: values.slug.trim() || undefined,
      description: values.description.trim() || undefined,
      icon: showIcon ? values.icon.trim() || undefined : undefined,
      flagSvg: showIcon ? values.flagSvg.trim() || undefined : undefined,
      coverMediaId: values.coverMediaId || undefined,
      center: showCoordinates ? parseCoordinates(values) ?? undefined : undefined,
      parentId: values.parentId || undefined,
      order: Number(values.order) || 0,
      isActive: values.isActive,
    });
    toast.success(tForm("created"));
    if (intent === "saveAndCreateNew") return;
    navigate(routes.locations(kind));
  };

  return (
    <AdminShell
      activeNavId="locations"
      breadcrumbs={[{ label: t("create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage
          description={t("locations.subtitle")}
          title={t("locations.createTitle")}
        >
          <LocationsForm
            initialValues={initialValues}
            kind={kind}
            parents={parents}
            onCancel={() => navigate(routes.locations(kind))}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
