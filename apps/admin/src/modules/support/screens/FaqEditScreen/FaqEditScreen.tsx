import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner, Typography } from "@heroui/react";
import type { AdminFaqItem } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminSupport } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  FaqForm,
  faqToFormValues,
  type FaqFormValues,
} from "../../components/FaqForm";
import { faqEditScreenVariants } from "./FaqEditScreen.styles";
import type { FaqEditScreenProps } from "./FaqEditScreen.types";

export function FaqEditScreen({ className }: FaqEditScreenProps) {
  const t = useTranslations("Admin.Support");
  const tForm = useTranslations("Admin.Form");
  const { faqId = "" } = useParams<{ faqId: string }>();
  const navigate = useNavigate();
  const styles = faqEditScreenVariants();

  const [item, setItem] = useState<AdminFaqItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialValues = useMemo(
    () => (item ? faqToFormValues(item) : null),
    [item],
  );

  const load = useCallback(async () => {
    if (!faqId) return;
    setLoading(true);
    setError(null);
    try {
      setItem(await adminSupport.getFaq(faqId));
    } catch (err) {
      setItem(null);
      setError(err instanceof Error ? err.message : t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [faqId, t]);

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
    values: FaqFormValues,
    _intent: FormSubmitIntent,
  ) => {
    if (!item) return;
    await adminSupport.updateFaq(item.id, {
      question: values.question.trim(),
      answer: values.answer.trim(),
      audience: values.audience,
      publishStatus: values.publishStatus,
      order: Number.parseInt(values.order, 10) || 0,
    });
    toast.success(tForm("saved"));
    navigate(routes.supportFaq);
  };

  return (
    <AdminShell
      activeNavId="support"
      breadcrumbs={[
        { label: item?.question ?? t("faqActions.edit") },
        { label: t("faqActions.edit") },
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
          <AdminFormPage title={t("faqActions.editTitle")}>
            <FaqForm
              initialValues={initialValues}
              mode="edit"
              onCancel={() => navigate(routes.supportFaq)}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
