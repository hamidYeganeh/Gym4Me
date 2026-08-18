import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { ChoiceGroup } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminBasics } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  ChoicesForm,
  choiceToFormValues,
  normalizedChoiceOptions,
  type ChoicesFormValues,
} from "../../components/ChoicesForm";
import { choicesEditScreenVariants } from "./ChoicesEditScreen.styles";
import type { ChoicesEditScreenProps } from "./ChoicesEditScreen.types";

export function ChoicesEditScreen({ className }: ChoicesEditScreenProps) {
  const t = useTranslations("Admin.Basics");
  const tForm = useTranslations("Admin.Form");
  const { choiceKey = "" } = useParams<{ choiceKey: string }>();
  const key = decodeURIComponent(choiceKey);
  const navigate = useNavigate();
  const styles = choicesEditScreenVariants();
  const [item, setItem] = useState<ChoiceGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialValues = useMemo(
    () => (item ? choiceToFormValues(item) : null),
    [item],
  );

  const load = useCallback(async () => {
    if (!key) return;
    setLoading(true);
    setError(null);
    try {
      const result = await adminBasics.listChoices();
      const found = result.result.find((group) => group.value === key) ?? null;
      setItem(found);
      if (!found) setError(t("errorLoad"));
    } catch (err) {
      setItem(null);
      setError(err instanceof Error ? err.message : t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [key, t]);

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
    values: ChoicesFormValues,
    _intent: FormSubmitIntent,
  ) => {
    if (!item) return;
    await adminBasics.updateChoice(item.value, {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      isActive: values.isActive,
      options: normalizedChoiceOptions(values),
    });
    toast.success(tForm("saved"));
    navigate(routes.choices);
  };

  return (
    <AdminShell
      activeNavId="choices"
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
          <AdminFormPage title={t("choices.editTitle")}>
            <ChoicesForm
              initialValues={initialValues}
              mode="edit"
              onCancel={() => navigate(routes.choices)}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
