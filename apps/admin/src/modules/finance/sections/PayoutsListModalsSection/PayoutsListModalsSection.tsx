import {
  Button,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminFormDrawer,
} from "@/shared/components";
import { payoutsListModalsSectionVariants } from "./PayoutsListModalsSection.styles";
import type { PayoutsListModalsSectionProps } from "./PayoutsListModalsSection.types";

export function PayoutsListModalsSection({
  draftOpen,
  onDraftOpenChange,
  draftClubId,
  onDraftClubIdChange,
  draftFrom,
  onDraftFromChange,
  draftTo,
  onDraftToChange,
  onDraftConfirm,
  disputing,
  onDisputingOpenChange,
  disputeReason,
  onDisputeReasonChange,
  onDisputeConfirm,
  resolving,
  onResolvingOpenChange,
  resolveNote,
  onResolveNoteChange,
  onResolveAccept,
  onResolveReject,
  settling,
  onSettlingOpenChange,
  onSettleConfirm,
  actionPending,
  actionError,
}: PayoutsListModalsSectionProps) {
  const t = useTranslations("Admin.Finance");
  const styles = payoutsListModalsSectionVariants();

  return (
    <>
      <AdminFormDrawer
        isOpen={draftOpen}
        title={t("payouts.actions.draftTitle")}
        onOpenChange={onDraftOpenChange}
      >
        <div className={styles.form()}>
          <Typography className={styles.subtitle()}>
            {t("payouts.actions.draftBody")}
          </Typography>
          <TextField
            className={styles.field()}
            fullWidth
            name="clubId"
            value={draftClubId}
            onChange={onDraftClubIdChange}
          >
            <Label>{t("payouts.actions.clubIdLabel")}</Label>
            <Input dir="ltr" />
          </TextField>
          <TextField
            className={styles.field()}
            fullWidth
            name="from"
            value={draftFrom}
            onChange={onDraftFromChange}
          >
            <Label>{t("payouts.actions.fromLabel")}</Label>
            <Input
              dir="ltr"
              placeholder={t("payouts.actions.fromPlaceholder")}
            />
          </TextField>
          <TextField
            className={styles.field()}
            fullWidth
            name="to"
            value={draftTo}
            onChange={onDraftToChange}
          >
            <Label>{t("payouts.actions.toLabel")}</Label>
            <Input
              dir="ltr"
              placeholder={t("payouts.actions.toPlaceholder")}
            />
          </TextField>

          {actionError ? (
            <Typography className="text-sm text-danger" role="alert">
              {actionError}
            </Typography>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={
                actionPending ||
                !draftClubId.trim() ||
                !draftFrom.trim() ||
                !draftTo.trim()
              }
              variant="primary"
              onPress={onDraftConfirm}
            >
              {t("payouts.actions.confirm")}
            </Button>
            <Button
              isDisabled={actionPending}
              variant="secondary"
              onPress={() => onDraftOpenChange(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminFormDrawer
        isOpen={Boolean(disputing)}
        title={t("payouts.actions.disputeTitle")}
        onOpenChange={onDisputingOpenChange}
      >
        <div className={styles.form()}>
          <TextField
            className={styles.field()}
            fullWidth
            name="disputeReason"
            value={disputeReason}
            onChange={onDisputeReasonChange}
          >
            <Label>{t("payouts.actions.disputeReasonLabel")}</Label>
            <Input />
          </TextField>

          {actionError ? (
            <Typography className="text-sm text-danger" role="alert">
              {actionError}
            </Typography>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={actionPending || !disputeReason.trim()}
              variant="primary"
              onPress={onDisputeConfirm}
            >
              {t("payouts.actions.confirm")}
            </Button>
            <Button
              isDisabled={actionPending}
              variant="secondary"
              onPress={() => onDisputingOpenChange(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminFormDrawer
        isOpen={Boolean(resolving)}
        title={t("payouts.actions.resolveTitle")}
        onOpenChange={onResolvingOpenChange}
      >
        <div className={styles.form()}>
          <TextField
            className={styles.field()}
            fullWidth
            name="resolveNote"
            value={resolveNote}
            onChange={onResolveNoteChange}
          >
            <Label>{t("payouts.actions.noteLabel")}</Label>
            <Input />
          </TextField>

          {actionError ? (
            <Typography className="text-sm text-danger" role="alert">
              {actionError}
            </Typography>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={actionPending}
              variant="primary"
              onPress={onResolveAccept}
            >
              {t("payouts.actions.resolveAccept")}
            </Button>
            <Button
              isDisabled={actionPending}
              variant="danger"
              onPress={onResolveReject}
            >
              {t("payouts.actions.resolveReject")}
            </Button>
            <Button
              isDisabled={actionPending}
              variant="secondary"
              onPress={() => onResolvingOpenChange(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminConfirmDialog
        body={
          <>
            <Typography>{t("payouts.actions.settleBody")}</Typography>
            {actionError ? (
              <Typography className="mt-2 text-sm text-danger" role="alert">
                {actionError}
              </Typography>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("payouts.actions.settle")}
        confirmVariant="primary"
        isOpen={Boolean(settling)}
        isPending={actionPending}
        title={t("payouts.actions.settleTitle")}
        onConfirm={onSettleConfirm}
        onOpenChange={onSettlingOpenChange}
      />
    </>
  );
}
