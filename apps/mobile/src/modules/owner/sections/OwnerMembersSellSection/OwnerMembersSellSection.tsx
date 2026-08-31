import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { ownerMembersSellSectionVariants } from "./OwnerMembersSellSection.styles";
import type { OwnerMembersSellSectionProps } from "./OwnerMembersSellSection.types";

export function OwnerMembersSellSection({
  plans,
  pending,
  title,
  planLabel,
  planPriceLabel,
  nameLabel,
  phoneLabel,
  channelLabel,
  channelCash,
  channelPos,
  channelCard,
  channelMixed,
  paidAmountLabel,
  referenceLabel,
  debtDueLabel,
  installmentCountLabel,
  submitLabel,
  sellPlanId,
  setSellPlanId,
  sellName,
  setSellName,
  sellPhone,
  setSellPhone,
  sellChannel,
  setSellChannel,
  sellPaidAmount,
  setSellPaidAmount,
  sellExternalRef,
  setSellExternalRef,
  cashTender,
  setCashTender,
  posTender,
  setPosTender,
  cardTender,
  setCardTender,
  debtDueAt,
  setDebtDueAt,
  installmentCount,
  setInstallmentCount,
  selectedPlan,
  planAmount,
  collectedAmount,
  submitSale,
  sellDisabled,
  className,
}: OwnerMembersSellSectionProps) {
  const styles = ownerMembersSellSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div className={styles.body()}>
        <Typography type="body" weight="semibold">
          {title}
        </Typography>
        <TextField>
          <Label>{planLabel}</Label>
          <select
            className={styles.select()}
            onChange={(event) => setSellPlanId(event.target.value)}
            value={sellPlanId}
          >
            <option value="">—</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </TextField>
        {selectedPlan ? (
          <Typography type="body-sm">
            {planPriceLabel({
              amount: selectedPlan.pricing.amount.toLocaleString("fa-IR"),
            })}
          </Typography>
        ) : null}
        <TextField>
          <Label>{nameLabel}</Label>
          <Input
            onChange={(event) => setSellName(event.target.value)}
            value={sellName}
          />
        </TextField>
        <TextField>
          <Label>{phoneLabel}</Label>
          <Input
            onChange={(event) => setSellPhone(event.target.value)}
            value={sellPhone}
          />
        </TextField>
        <TextField>
          <Label>{channelLabel}</Label>
          <select
            className={styles.select()}
            onChange={(event) =>
              setSellChannel(event.target.value as typeof sellChannel)
            }
            value={sellChannel}
          >
            <option value="cash">{channelCash}</option>
            <option value="pos">{channelPos}</option>
            <option value="card_to_card">{channelCard}</option>
            <option value="mixed">{channelMixed}</option>
          </select>
        </TextField>
        <TextField>
          <Label>{paidAmountLabel}</Label>
          <Input
            inputMode="numeric"
            onChange={(event) => setSellPaidAmount(event.target.value)}
            placeholder={planAmount ? String(planAmount) : undefined}
            value={sellPaidAmount}
          />
        </TextField>
        {sellChannel === "mixed" ? (
          <div className={styles.tenderGrid()}>
            <TextField>
              <Label>{channelCash}</Label>
              <Input
                inputMode="numeric"
                onChange={(event) => setCashTender(event.target.value)}
                value={cashTender}
              />
            </TextField>
            <TextField>
              <Label>{channelPos}</Label>
              <Input
                inputMode="numeric"
                onChange={(event) => setPosTender(event.target.value)}
                value={posTender}
              />
            </TextField>
            <TextField>
              <Label>{channelCard}</Label>
              <Input
                inputMode="numeric"
                onChange={(event) => setCardTender(event.target.value)}
                value={cardTender}
              />
            </TextField>
          </div>
        ) : null}
        <TextField>
          <Label>{referenceLabel}</Label>
          <Input
            onChange={(event) => setSellExternalRef(event.target.value)}
            value={sellExternalRef}
          />
        </TextField>
        {collectedAmount < planAmount ? (
          <div className={styles.debtGrid()}>
            <TextField>
              <Label>{debtDueLabel}</Label>
              <Input
                onChange={(event) => setDebtDueAt(event.target.value)}
                type="date"
                value={debtDueAt}
              />
            </TextField>
            <TextField>
              <Label>{installmentCountLabel}</Label>
              <Input
                inputMode="numeric"
                onChange={(event) => setInstallmentCount(event.target.value)}
                value={installmentCount}
              />
            </TextField>
          </div>
        ) : null}
        <Button size="lg"
          isDisabled={pending || sellDisabled}
          onPress={() => void submitSale()}
          variant="primary"
        >
          {submitLabel}
        </Button>
      </div>
    </section>
  );
}
