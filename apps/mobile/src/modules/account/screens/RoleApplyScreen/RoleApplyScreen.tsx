"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Typography } from "@heroui/react";
import type { Role } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { accountRoles } from "@/shared/lib/api";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { roleApplyScreenVariants } from "./RoleApplyScreen.styles";
import type { RoleApplyScreenProps } from "./RoleApplyScreen.types";

const APPLICABLE: { role: Role; labelKey: "coach" | "owner" }[] = [
  { role: "coach", labelKey: "coach" },
  { role: "club_owner", labelKey: "owner" },
];

export function RoleApplyScreen({
  className,
  roleSegment = "athlete",
}: RoleApplyScreenProps) {
  const t = useTranslations("Mobile.RoleApply");
  const styles = roleApplyScreenVariants();
  const router = useRouter();
  const { user, refreshUser, switchRole } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  const handleApply = async (role: Role) => {
    setError(null);
    setPendingRole(role);
    try {
      if (user?.roles.includes(role)) {
        const session = await switchRole(role);
        router.replace(roleHomePath(session.activeRole));
        return;
      }
      const result = await accountRoles.apply({ role });
      refreshUser(result.user);
      const session = await switchRole(role);
      router.replace(roleHomePath(session.activeRole));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
    } finally {
      setPendingRole(null);
    }
  };

  return (
    <main className={styles.root({ className })}>
      <header className={styles.header()}>
        <Typography className={styles.title()} type="h1" weight="bold">
          {t("title")}
        </Typography>
        <Typography className={styles.subtitle()} color="muted" type="body">
          {t("subtitle")}
        </Typography>
      </header>

      <div className={styles.list()}>
        {APPLICABLE.map((item) => {
          const hasRole = user?.roles.includes(item.role);
          return (
            <Button
              key={item.role}
              fullWidth
              isPending={pendingRole === item.role}
              size="lg"
              variant={hasRole ? "secondary" : "primary"}
              onPress={() => void handleApply(item.role)}
            >
              {hasRole ? `${t(item.labelKey)} — ${t("switch")}` : `${t(item.labelKey)} — ${t("apply")}`}
            </Button>
          );
        })}
      </div>

      {error ? (
        <Typography className={styles.error()} role="alert" type="body-sm">
          {error}
        </Typography>
      ) : null}

      <Button
        size="lg"
        variant="ghost"
        onPress={() => router.push(`/${roleSegment}/profile`)}
      >
        {t("back")}
      </Button>
    </main>
  );
}
