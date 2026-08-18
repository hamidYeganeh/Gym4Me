import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type PublicUser, type Role } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { adminUsers } from "@/shared/lib/api";
import { userDisplayName } from "@/shared/lib/user-format";
import { useAuth } from "@/shared/providers/AuthProvider";
import type { UsersProfileFormValues } from "../../components/UsersProfileForm";
import type { UsersRolesFormValues } from "../../components/UsersRolesForm";
import { UsersDetailConfirmDialogsSection } from "../../sections/UsersDetailConfirmDialogsSection";
import { UsersDetailHeaderSection } from "../../sections/UsersDetailHeaderSection";
import { UsersDetailProfileSection } from "../../sections/UsersDetailProfileSection";
import { UsersDetailRolesSection } from "../../sections/UsersDetailRolesSection";
import { UsersDetailStatusSection } from "../../sections/UsersDetailStatusSection";
import { userDetailScreenVariants } from "./UserDetailScreen.styles";
import type { UserDetailScreenProps } from "./UserDetailScreen.types";

const PROFILE_FORM_ID = "users-profile-form";

export function UserDetailScreen({ className }: UserDetailScreenProps) {
  const t = useTranslations("Admin.Users");
  const { userId = "" } = useParams<{ userId: string }>();
  const { user: sessionUser } = useAuth();
  const styles = userDetailScreenVariants();

  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reason, setReason] = useState("");

  const applyUser = useCallback((next: PublicUser) => {
    setUser(next);
  }, []);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const next = await adminUsers.get(userId);
      applyUser(next);
    } catch (err) {
      setUser(null);
      setError(
        err instanceof ApiError
          ? err.message || t("detail.errorLoad")
          : t("detail.errorLoad"),
      );
    } finally {
      setLoading(false);
    }
  }, [userId, applyUser, t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const isSelf = sessionUser?.id === userId;
  const canMutateStatus =
    Boolean(user) && !isSelf && user?.status !== "deleted";

  const profileDefaults = useMemo<UsersProfileFormValues>(
    () => ({
      firstName: user?.name.first ?? "",
      lastName: user?.name.last ?? "",
      nationalId: user?.nationalId ?? "",
    }),
    [user],
  );

  const rolesDefaults = useMemo<UsersRolesFormValues>(
    () => ({
      roles: (user?.roles ?? []) as Role[],
    }),
    [user],
  );

  const focusProfileForm = () => {
    document.getElementById(PROFILE_FORM_ID)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleShare = async () => {
    if (!user) return;
    const payload = user.phone;
    try {
      await navigator.clipboard.writeText(payload);
      toast.success(t("detail.shareCopied"));
    } catch {
      toast.error(t("detail.shareFailed"));
    }
  };

  const handleSaveProfile = async (values: UsersProfileFormValues) => {
    if (!user) return;
    setError(null);
    const next = await adminUsers.update(user.id, {
      firstName: values.firstName.trim() || undefined,
      lastName: values.lastName.trim() || undefined,
      nationalId: values.nationalId.trim() || undefined,
    });
    applyUser(next);
    toast.success(t("detail.profileSaved"));
  };

  const handleSaveRoles = async (values: UsersRolesFormValues) => {
    if (!user) return;
    setError(null);
    const next = await adminUsers.updateRoles(user.id, {
      roles: values.roles,
    });
    applyUser(next);
    toast.success(t("detail.rolesSaved"));
  };

  const handleActivate = async () => {
    if (!user) return;
    setActionPending(true);
    setError(null);
    try {
      const next = await adminUsers.activate(user.id);
      applyUser(next);
      setActivateOpen(false);
      toast.success(t("detail.activated"));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message || t("detail.errorAction")
          : t("detail.errorAction"),
      );
    } finally {
      setActionPending(false);
    }
  };

  const handleDeactivate = async () => {
    if (!user) return;
    setActionPending(true);
    setError(null);
    try {
      const next = await adminUsers.deactivate(user.id, {
        reason: reason.trim() || undefined,
      });
      applyUser(next);
      setDeactivateOpen(false);
      setReason("");
      toast.success(t("detail.deactivated"));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message || t("detail.errorAction")
          : t("detail.errorAction"),
      );
    } finally {
      setActionPending(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setActionPending(true);
    setError(null);
    try {
      const next = await adminUsers.remove(user.id);
      applyUser(next);
      setDeleteOpen(false);
      toast.success(t("detail.deleted"));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message || t("detail.errorAction")
          : t("detail.errorAction"),
      );
    } finally {
      setActionPending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="users"
      breadcrumbs={[
        {
          label: user
            ? userDisplayName(user, t("detail.unnamed"))
            : t("detail.title"),
        },
      ]}
      className={className}
    >
      <div className={styles.content()}>
        <UsersDetailHeaderSection
          actionPending={actionPending}
          canMutateStatus={canMutateStatus}
          user={user}
          onActivate={() => setActivateOpen(true)}
          onDeactivate={() => setDeactivateOpen(true)}
          onDelete={() => setDeleteOpen(true)}
          onEdit={focusProfileForm}
          onShare={() => void handleShare()}
        />

        {loading ? (
          <div className={styles.loading()}>
            <Spinner size="sm" />
            {t("loading")}
          </div>
        ) : !user ? (
          <Typography className={styles.error()}>
            {error || t("detail.notFound")}
          </Typography>
        ) : (
          <>
            {error ? (
              <Typography className={styles.error()}>{error}</Typography>
            ) : null}

            <div className={styles.sections()}>
              <UsersDetailProfileSection
                defaultValues={profileDefaults}
                formId={PROFILE_FORM_ID}
                user={user}
                onSubmit={handleSaveProfile}
              />
              <UsersDetailStatusSection
                actionPending={actionPending}
                canMutateStatus={canMutateStatus}
                user={user}
                onActivate={() => setActivateOpen(true)}
                onDeactivate={() => setDeactivateOpen(true)}
              />
              <UsersDetailRolesSection
                defaultValues={rolesDefaults}
                user={user}
                onSubmit={handleSaveRoles}
              />
            </div>
          </>
        )}
      </div>

      <UsersDetailConfirmDialogsSection
        actionPending={actionPending}
        activateOpen={activateOpen}
        deactivateOpen={deactivateOpen}
        deleteOpen={deleteOpen}
        reason={reason}
        onActivateConfirm={handleActivate}
        onActivateOpenChange={setActivateOpen}
        onDeactivateConfirm={handleDeactivate}
        onDeactivateOpenChange={(open) => {
          setDeactivateOpen(open);
          if (!open) setReason("");
        }}
        onDeleteConfirm={handleDelete}
        onDeleteOpenChange={setDeleteOpen}
        onReasonChange={setReason}
      />
    </AdminShell>
  );
}
