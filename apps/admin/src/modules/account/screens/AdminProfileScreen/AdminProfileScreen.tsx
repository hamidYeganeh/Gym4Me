import { useCallback, useEffect, useMemo, useState } from "react";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type PublicUser } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import { accountProfile } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import {
  AdminProfileForm,
  type AdminProfileFormValues,
} from "../../components/AdminProfileForm";
import { adminProfileScreenVariants } from "./AdminProfileScreen.styles";
import type { AdminProfileScreenProps } from "./AdminProfileScreen.types";

export function AdminProfileScreen({ className }: AdminProfileScreenProps) {
  const t = useTranslations("Admin.Profile");
  const { refreshUser } = useAuth();
  const styles = adminProfileScreenVariants();

  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await accountProfile.getMe();
      setUser(next);
      await refreshUser(next);
    } catch (err) {
      setUser(null);
      setError(
        err instanceof ApiError
          ? err.message || t("errorLoad")
          : t("errorLoad"),
      );
    } finally {
      setLoading(false);
    }
  }, [refreshUser, t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const defaults = useMemo<AdminProfileFormValues>(
    () => ({
      firstName: user?.name.first ?? "",
      lastName: user?.name.last ?? "",
      avatarMediaId: user?.avatar.mediaId ?? "",
    }),
    [user],
  );

  const handleSubmit = async (values: AdminProfileFormValues) => {
    const next = await accountProfile.updateMe({
      name: {
        first: values.firstName.trim() || undefined,
        last: values.lastName.trim() || undefined,
      },
      avatar: {
        mediaId: values.avatarMediaId.trim() || null,
      },
    });
    setUser(next);
    await refreshUser(next);
    toast.success(t("saved"));
  };

  return (
    <AdminShell activeNavId="profile" className={className}>
      <div className={styles.content()}>
        <AdminFormPage description={t("subtitle")} title={t("title")}>
          {loading ? (
            <div className={styles.loading()}>
              <Spinner color="current" size="lg" />
            </div>
          ) : error ? (
            <Typography className={styles.error()} role="alert">
              {error}
            </Typography>
          ) : user ? (
            <AdminProfileForm
              defaultValues={defaults}
              phone={user.phone}
              onSubmit={handleSubmit}
            />
          ) : null}
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
