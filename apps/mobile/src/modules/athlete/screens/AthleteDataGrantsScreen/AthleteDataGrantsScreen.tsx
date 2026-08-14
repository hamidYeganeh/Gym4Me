"use client";

import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import type { AthleteDataGrantScope } from "@repo/api";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DATA_GRANT_SCOPE_OPTIONS,
  labelForScope,
} from "../../lib/data-grants-data";
import { athleteDataGrantsScreenVariants } from "./AthleteDataGrantsScreen.styles";
import type { AthleteDataGrantsScreenProps } from "./AthleteDataGrantsScreen.types";

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function AthleteDataGrantsScreen({
  grants,
  coaches,
  pending = false,
  onCreate,
  onRevoke,
}: AthleteDataGrantsScreenProps) {
  const router = useRouter();
  const styles = athleteDataGrantsScreenVariants();
  const [relationshipId, setRelationshipId] = useState(
    coaches[0]?.relationshipId ?? "",
  );
  const [scopes, setScopes] = useState<AthleteDataGrantScope[]>([
    "metrics.weight",
  ]);
  const [expiresAt, setExpiresAt] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCoach =
    coaches.find((item) => item.relationshipId === relationshipId) ??
    coaches[0];

  function toggleScope(scope: AthleteDataGrantScope) {
    setScopes((current) =>
      current.includes(scope)
        ? current.filter((item) => item !== scope)
        : [...current, scope],
    );
  }

  async function submit() {
    if (!selectedCoach || scopes.length === 0) return;
    setMessage(null);
    setError(null);
    try {
      await onCreate({
        granteeUserId: selectedCoach.coachUserId,
        relationshipId: selectedCoach.relationshipId,
        scopes,
        expiresAt: expiresAt
          ? new Date(expiresAt).toISOString()
          : undefined,
      });
      setMessage("دسترسی با موفقیت ایجاد شد.");
      setExpiresAt("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "ایجاد دسترسی ناموفق بود.",
      );
    }
  }

  return (
    <AppLayout
      className={styles.root()}
      header={
        <Header
          startContent={
            <Button
              aria-label="بازگشت"
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography type="h1" weight="bold">
            اشتراک‌گذاری داده با مربی
          </Typography>
          <Typography className={styles.subtitle()} type="body">
            مشخص کن کدام متریک‌ها و لاگ‌ها برای مربی فعال قابل مشاهده باشد.
            لغو دسترسی فوری است.
          </Typography>
        </section>

        <section className={styles.card()}>
          <Typography type="h3" weight="semibold">
            ایجاد دسترسی جدید
          </Typography>
          {coaches.length === 0 ? (
            <div className={styles.empty()}>
              مربی فعالی برای ایجاد دسترسی ندارید.
            </div>
          ) : (
            <div className={styles.form()}>
              <label className="flex flex-col gap-1.5">
                <span className={styles.meta()}>مربی</span>
                <select
                  className={styles.nativeSelect()}
                  onChange={(event) => setRelationshipId(event.target.value)}
                  value={selectedCoach?.relationshipId ?? ""}
                >
                  {coaches.map((coach) => (
                    <option
                      key={coach.relationshipId}
                      value={coach.relationshipId}
                    >
                      {coach.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.scopes()}>
                <Typography className={styles.meta()} type="body-sm">
                  محدوده‌های دسترسی
                </Typography>
                {DATA_GRANT_SCOPE_OPTIONS.map((option) => (
                  <label className={styles.scopeRow()} key={option.key}>
                    <input
                      checked={scopes.includes(option.key)}
                      onChange={() => toggleScope(option.key)}
                      type="checkbox"
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              <TextField>
                <Label>انقضا (اختیاری)</Label>
                <Input
                  onChange={(event) => setExpiresAt(event.target.value)}
                  type="datetime-local"
                  value={expiresAt}
                />
              </TextField>

              <Button
                fullWidth
                isDisabled={pending || scopes.length === 0 || !selectedCoach}
                onPress={() => void submit()}
                variant="primary"
              >
                ایجاد دسترسی
              </Button>
              {message ? <p className={styles.feedback()}>{message}</p> : null}
              {error ? <p className={styles.error()}>{error}</p> : null}
            </div>
          )}
        </section>

        <section className={styles.card()}>
          <Typography type="h3" weight="semibold">
            دسترسی‌های موجود
          </Typography>
          {grants.length === 0 ? (
            <div className={styles.empty()}>هنوز دسترسی‌ای ثبت نشده است.</div>
          ) : (
            <div className={styles.list()}>
              {grants.map((grant) => (
                <article className={styles.grantRow()} key={grant.id}>
                  <div className={styles.grantTop()}>
                    <div>
                      <Typography type="body" weight="semibold">
                        مربی {grant.grantee.userId.slice(-6)}
                      </Typography>
                      <Typography className={styles.meta()} type="body-sm">
                        از {formatDate(grant.effective.grantedAt)}
                        {grant.effective.expiresAt
                          ? ` تا ${formatDate(grant.effective.expiresAt)}`
                          : ""}
                      </Typography>
                    </div>
                    <Chip
                      color={
                        grant.status === "active"
                          ? "success"
                          : grant.status === "expired"
                            ? "warning"
                            : "default"
                      }
                      size="sm"
                      variant="soft"
                    >
                      <Chip.Label>
                        {grant.status === "active"
                          ? "فعال"
                          : grant.status === "expired"
                            ? "منقضی"
                            : "لغو شده"}
                      </Chip.Label>
                    </Chip>
                  </div>
                  <Typography className={styles.meta()} type="body-sm">
                    {grant.scopes.map(labelForScope).join(" · ")}
                  </Typography>
                  {grant.status === "active" ? (
                    <Button
                      isDisabled={pending}
                      onPress={() => void onRevoke(grant.id)}
                      size="sm"
                      variant="danger"
                    >
                      لغو دسترسی
                    </Button>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
