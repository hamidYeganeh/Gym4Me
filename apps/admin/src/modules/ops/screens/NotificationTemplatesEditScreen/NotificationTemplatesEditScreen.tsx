import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { NotificationTemplate } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminNotificationTemplates } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  NotificationTemplatesForm,
  notificationTemplateToFormValues,
  type NotificationTemplatesFormValues,
} from "../../components/NotificationTemplatesForm";
import { notificationTemplatesEditScreenVariants } from "./NotificationTemplatesEditScreen.styles";
import type { NotificationTemplatesEditScreenProps } from "./NotificationTemplatesEditScreen.types";

export function NotificationTemplatesEditScreen({
  className,
}: NotificationTemplatesEditScreenProps) {
  const t = useTranslations("Admin.Ops");
  const tForm = useTranslations("Admin.Form");
  const { templateKey = "" } = useParams<{ templateKey: string }>();
  const key = decodeURIComponent(templateKey);
  const navigate = useNavigate();
  const styles = notificationTemplatesEditScreenVariants();
  const [item, setItem] = useState<NotificationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialValues = useMemo(
    () => (item ? notificationTemplateToFormValues(item) : null),
    [item],
  );

  const load = useCallback(async () => {
    if (!key) return;
    setLoading(true);
    setError(null);
    try {
      setItem(await adminNotificationTemplates.get(key));
    } catch (err) {
      setItem(null);
      setError(err instanceof Error ? err.message : t("templates.errorLoad"));
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
    values: NotificationTemplatesFormValues,
    _intent: FormSubmitIntent,
  ) => {
    if (!item) return;
    await adminNotificationTemplates.update(item.key, {
      title: values.title.trim(),
      body: values.body.trim(),
      smsTemplateKey: values.smsTemplateKey.trim() || undefined,
      channels: {
        push: values.push,
        inbox: values.inbox,
        sms: values.sms,
      },
    });
    toast.success(tForm("saved"));
    navigate(routes.opsTemplates);
  };

  return (
    <AdminShell
      activeNavId="ops"
      breadcrumbs={[
        { label: item?.title ?? item?.key ?? t("templates.editTitle") },
        { label: t("templates.editTitle") },
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
          <AdminFormPage title={t("templates.editTitle")}>
            <NotificationTemplatesForm
              initialValues={initialValues}
              onCancel={() => navigate(routes.opsTemplates)}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
