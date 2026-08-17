import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner, Typography } from "@heroui/react";
import type { Club, ClubClass, ClubSlot } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { routes } from "@/shared/lib/routes";
import {
  activateClub,
  deactivateClub,
  getClub,
  listClubBranches,
  listClubClasses,
  listClubCoaches,
  listClubSlots,
  removeClub,
} from "../../lib/clubs-repository";
import { ClubDetailConfirmDialogsSection } from "../../sections/ClubDetailConfirmDialogsSection";
import { ClubDetailHeaderSection } from "../../sections/ClubDetailHeaderSection";
import { ClubDetailInfoCardsSection } from "../../sections/ClubDetailInfoCardsSection";
import { clubDetailScreenVariants } from "./ClubDetailScreen.styles";
import type { ClubDetailScreenProps } from "./ClubDetailScreen.types";

export function ClubDetailScreen({ className }: ClubDetailScreenProps) {
  const t = useTranslations("Admin.Clubs");
  const { clubId = "" } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const styles = clubDetailScreenVariants();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [coaches, setCoaches] = useState<Club["coaches"]>([]);
  const [branches, setBranches] = useState<Club[]>([]);
  const [classes, setClasses] = useState<ClubClass[]>([]);
  const [slots, setSlots] = useState<ClubSlot[]>([]);

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
      toast.success(t("detail.saved"));
      setActivateOpen(false);
      setDeactivateOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("detail.errorLoad"));
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="clubs"
      breadcrumbs={[{ label: club?.identity.name ?? t("detail.unnamed") }]}
      className={className}
    >
      <div className={styles.content()}>
        <ClubDetailHeaderSection
          club={club}
          onActivate={() => setActivateOpen(true)}
          onBack={() => navigate(routes.clubs)}
          onDeactivate={() => setDeactivateOpen(true)}
          onDelete={() => setDeleteOpen(true)}
          onEdit={() => club && navigate(routes.clubEdit(club.id))}
        />

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : null}

        {error ? (
          <Typography className={styles.error()} role="alert">
            {error}
          </Typography>
        ) : null}

        {club ? (
          <ClubDetailInfoCardsSection
            branches={branches}
            classes={classes}
            club={club}
            coaches={coaches}
            slots={slots}
            onChanged={() => void load()}
          />
        ) : null}
      </div>

      <ClubDetailConfirmDialogsSection
        activateOpen={activateOpen}
        deactivateOpen={deactivateOpen}
        deleteOpen={deleteOpen}
        pending={pending}
        onActivateConfirm={() => void runAction("activate")}
        onActivateOpenChange={setActivateOpen}
        onDeactivateConfirm={() => void runAction("deactivate")}
        onDeactivateOpenChange={setDeactivateOpen}
        onDeleteConfirm={() => void runAction("delete")}
        onDeleteOpenChange={setDeleteOpen}
      />
    </AdminShell>
  );
}
