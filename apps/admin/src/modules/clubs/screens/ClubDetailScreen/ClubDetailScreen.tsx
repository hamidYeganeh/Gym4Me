import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Chip, Spinner, Typography } from "@heroui/react";
import type { Club, ClubClass, ClubSlot } from "@repo/api";
import { ArrowLeft, Pencil1 } from "@repo/icons";
import { useTranslations } from "next-intl";
import { AdminConfirmDialog, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { routes } from "@/shared/lib/routes";
import { formatAdminDate } from "@/shared/lib/user-format";
import { ClubsCreateForm } from "../../components/ClubsCreateForm";
import type { ClubsCreateFormValues } from "../../components/ClubsCreateForm";
import {
  categoryLabel,
  ownerLabel,
} from "../../lib/clubs-data";
import {
  activateClub,
  deactivateClub,
  getClub,
  listClubBranches,
  listClubClasses,
  listClubCoaches,
  listClubSlots,
  removeClub,
  updateClub,
} from "../../lib/clubs-repository";
import { ClubSlotsSection } from "../../sections/ClubSlotsSection";
import { ClubCoachesSection } from "../../sections/ClubCoachesSection";
import { clubDetailScreenVariants } from "./ClubDetailScreen.styles";
import type { ClubDetailScreenProps } from "./ClubDetailScreen.types";

function clubToFormValues(club: Club): ClubsCreateFormValues {
  const phone = club.contact.phones[0];
  return {
    ownerId: club.ownerId,
    name: club.identity.name,
    description: club.identity.description ?? "",
    phone: phone?.number ?? "",
    phoneLabel: phone?.label ?? "",
    website: club.contact.website ?? "",
    address: club.location?.address ?? "",
    direction: club.location?.direction ?? "center",
    categoryIds: club.categories.map((c) =>
      "id" in c && typeof (c as { id?: string }).id === "string"
        ? (c as { id: string }).id
        : (c as { categoryId?: string }).categoryId ?? "",
    ).filter(Boolean),
    sportIds: club.sports.map((s) =>
      "id" in s && typeof (s as { id?: string }).id === "string"
        ? (s as { id: string }).id
        : (s as { sportId?: string }).sportId ?? "",
    ).filter(Boolean),
    genderPolicy: club.audience?.genderPolicy ?? "mixed",
    accessibility: club.audience?.accessibility ?? "standard",
    ageGroupKeys: club.audience?.ageGroupKeys ?? [],
    levelKeys: club.audience?.levelKeys ?? [],
  };
}

export function ClubDetailScreen({ className }: ClubDetailScreenProps) {
  const t = useTranslations("Admin.Clubs");
  const { clubId = "" } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const styles = clubDetailScreenVariants();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [coaches, setCoaches] = useState<Club["coaches"]>([]);
  const [branches, setBranches] = useState<Club[]>([]);
  const [classes, setClasses] = useState<ClubClass[]>([]);
  const [slots, setSlots] = useState<ClubSlot[]>([]);

  const editValues = useMemo(
    () => (club ? clubToFormValues(club) : null),
    [club],
  );

  const load = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    try {
      const next = await getClub(clubId);
      setClub(next);
      const [coachRes, branchRes, classRes, slotRes] = await Promise.all([
        listClubCoaches(clubId),
        listClubBranches(clubId),
        listClubClasses(clubId),
        listClubSlots(clubId),
      ]);
      setCoaches(coachRes.result);
      setBranches(branchRes.result);
      setClasses(classRes.result);
      setSlots(slotRes.result);
    } catch (err) {
      setClub(null);
      setError(err instanceof Error ? err.message : t("detail.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [clubId, t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const runAction = async (action: "activate" | "deactivate" | "delete") => {
    if (!club) return;
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      if (action === "delete") {
        await removeClub(club.id);
        navigate(routes.clubs);
        return;
      }
      const next =
        action === "activate"
          ? await activateClub(club.id)
          : await deactivateClub(club.id);
      setClub(next);
      setMessage(t("detail.saved"));
      setActivateOpen(false);
      setDeactivateOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("detail.errorLoad"));
    } finally {
      setPending(false);
    }
  };

  const handleEdit = async (
    values: ClubsCreateFormValues,
    _intent: FormSubmitIntent,
  ) => {
    if (!club) return;
    const next = await updateClub(club.id, {
      identity: {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
      },
      contact: {
        phones: [
          {
            number: values.phone.trim(),
            label: values.phoneLabel.trim() || undefined,
          },
        ],
        website: values.website.trim() || undefined,
      },
      location: {
        address: values.address.trim(),
        direction: values.direction,
        locationId: club.location?.locationId ?? undefined,
      },
      categoryIds: values.categoryIds,
      sportIds: values.sportIds,
      audience: {
        genderPolicy: values.genderPolicy || null,
        accessibility: values.accessibility || "standard",
        ageGroupKeys: values.ageGroupKeys,
        levelKeys: values.levelKeys,
      },
    });
    setClub(next);
    setEditOpen(false);
    setMessage(t("detail.saved"));
  };

  return (
    <AdminShell activeNavId="clubs" className={className}>
      <div className={styles.content()}>
        <div className={styles.header()}>
          <div>
            <Button
              className="mb-3"
              size="sm"
              variant="tertiary"
              onPress={() => navigate(routes.clubs)}
            >
              <ArrowLeft size={16} />
              {t("detail.back")}
            </Button>
            {club ? (
              <>
                <Typography className={styles.title()} type="h1" weight="bold">
                  {club.identity.name}
                </Typography>
                <p className={styles.subtitle()}>
                  {ownerLabel(club.ownerId)} ·{" "}
                  {formatAdminDate(club.createdAt)}
                </p>
              </>
            ) : (
              <Typography className={styles.title()} type="h1" weight="bold">
                {t("title")}
              </Typography>
            )}
          </div>

          {club ? (
            <div className={styles.actions()}>
              <Button variant="outline" onPress={() => setEditOpen(true)}>
                <Pencil1 size={16} />
                {t("actions.edit")}
              </Button>
              {club.operationalStatus === "inactive" ? (
                <Button
                  variant="primary"
                  onPress={() => setActivateOpen(true)}
                >
                  {t("actions.activate")}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onPress={() => setDeactivateOpen(true)}
                >
                  {t("actions.deactivate")}
                </Button>
              )}
              <Button variant="danger" onPress={() => setDeleteOpen(true)}>
                {t("actions.delete")}
              </Button>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : null}

        {error ? (
          <p className={styles.error()} role="alert">
            {error}
          </p>
        ) : null}
        {message ? <p className={styles.message()}>{message}</p> : null}

        {club ? (
          <>
            <section className={styles.card()}>
              <Typography className={styles.cardTitle()}>
                {t("detail.status")}
              </Typography>
              <div className={styles.chips()}>
                <Chip size="sm" variant="soft">
                  {t(`lifecycle.${club.review.status}`)}
                </Chip>
                <Chip
                  color={
                    club.operationalStatus === "active" ? "success" : "danger"
                  }
                  size="sm"
                  variant="soft"
                >
                  {t(`operational.${club.operationalStatus}`)}
                </Chip>
              </div>
            </section>

            <section className={styles.card()}>
              <Typography className={styles.cardTitle()}>
                {t("detail.identity")}
              </Typography>
              <dl className={styles.grid()}>
                <div>
                  <dt className={styles.label()}>{t("createModal.name")}</dt>
                  <dd className={styles.value()}>{club.identity.name}</dd>
                </div>
                <div>
                  <dt className={styles.label()}>{t("createModal.description")}</dt>
                  <dd className={styles.value()}>
                    {club.identity.description || "—"}
                  </dd>
                </div>
              </dl>
              {club.categories.length ? (
                <div className={`mt-4 ${styles.chips()}`}>
                  {club.categories.map((c) => (
                    <Chip key={c.id} size="sm" variant="soft">
                      {c.name ?? categoryLabel(c.id)}
                    </Chip>
                  ))}
                </div>
              ) : null}
            </section>

            <section className={styles.card()}>
              <Typography className={styles.cardTitle()}>
                {t("detail.contact")}
              </Typography>
              <dl className={styles.grid()}>
                <div>
                  <dt className={styles.label()}>{t("createModal.phone")}</dt>
                  <dd className={styles.value()} dir="ltr">
                    {club.contact.phones
                      .map((p) =>
                        p.label ? `${p.number} (${p.label})` : p.number,
                      )
                      .join(" · ") || "—"}
                  </dd>
                </div>
                <div>
                  <dt className={styles.label()}>{t("createModal.website")}</dt>
                  <dd className={styles.value()} dir="ltr">
                    {club.contact.website || "—"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className={styles.card()}>
              <Typography className={styles.cardTitle()}>
                {t("detail.location")}
              </Typography>
              <dl className={styles.grid()}>
                <div>
                  <dt className={styles.label()}>{t("createModal.address")}</dt>
                  <dd className={styles.value()}>
                    {club.location?.address || "—"}
                  </dd>
                </div>
                <div>
                  <dt className={styles.label()}>
                    {t("createModal.direction")}
                  </dt>
                  <dd className={styles.value()}>
                    {club.location?.direction
                      ? t(`direction.${club.location.direction}`)
                      : "—"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className={styles.card()}>
              <Typography className={styles.cardTitle()}>
                {t("detail.reviews")}
              </Typography>
              <p className={styles.value()}>
                {club.reviewsSummary.count
                  ? `${club.reviewsSummary.average.toFixed(1)} / 5 · ${club.reviewsSummary.count}`
                  : "—"}
              </p>
            </section>

            <section className={styles.card()}>
              <ClubCoachesSection
                clubId={club.id}
                coaches={coaches}
                onChanged={() => void load()}
              />
            </section>

            <section className={styles.card()}>
              <Typography className={styles.cardTitle()}>
                {t("detail.branches")}
              </Typography>
              {branches.length ? (
                <ul className="space-y-1 text-sm">
                  {branches.map((b) => (
                    <li key={b.id}>{b.identity.name}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.muted()}>{t("detail.emptyRefs")}</p>
              )}
            </section>

            <section className={styles.card()}>
              <Typography className={styles.cardTitle()}>
                {t("detail.classes")}
              </Typography>
              {classes.length ? (
                <ul className="space-y-1 text-sm">
                  {classes.map((c) => (
                    <li key={c.id}>
                      {c.title}
                      <span className="ms-2 text-muted tabular-nums" dir="ltr">
                        {c.id}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.muted()}>{t("detail.emptyRefs")}</p>
              )}
            </section>

            <section className={styles.card()}>
              <ClubSlotsSection
                classes={classes}
                clubId={club.id}
                slots={slots}
                onChanged={() => void load()}
              />
            </section>
          </>
        ) : null}
      </div>

      <AdminConfirmDialog
        body={<Typography>{t("detail.activateBody")}</Typography>}
        cancelLabel={t("detail.cancel")}
        confirmLabel={t("detail.activateConfirm")}
        confirmVariant="primary"
        isOpen={activateOpen}
        isPending={pending}
        title={t("detail.activateTitle")}
        onConfirm={() => void runAction("activate")}
        onOpenChange={setActivateOpen}
      />

      <AdminConfirmDialog
        body={<Typography>{t("detail.deactivateBody")}</Typography>}
        cancelLabel={t("detail.cancel")}
        confirmLabel={t("detail.deactivateConfirm")}
        isOpen={deactivateOpen}
        isPending={pending}
        title={t("detail.deactivateTitle")}
        onConfirm={() => void runAction("deactivate")}
        onOpenChange={setDeactivateOpen}
      />

      <AdminConfirmDialog
        body={<Typography>{t("detail.deleteBody")}</Typography>}
        cancelLabel={t("detail.cancel")}
        confirmLabel={t("detail.deleteConfirm")}
        isOpen={deleteOpen}
        isPending={pending}
        title={t("detail.deleteTitle")}
        onConfirm={() => void runAction("delete")}
        onOpenChange={setDeleteOpen}
      />

      <ClubsCreateForm
        initialValues={editValues}
        isOpen={editOpen}
        mode="edit"
        onOpenChange={setEditOpen}
        onSubmit={handleEdit}
      />
    </AdminShell>
  );
}
