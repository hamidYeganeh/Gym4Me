"use client";

import { Avatar, Badge, Button, Typography } from "@heroui/react";
import {
  BarbellHorizontal,
  Bell1,
  Calendar1,
  Chat,
  Fire1,
  FootSteps,
  Scan1,
  Ticket,
  Wallet,
} from "@repo/icons";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { MetricCard } from "@repo/ui/cards/MetricCard";
import { QuickActionCard } from "@repo/ui/cards/QuickActionCard";
import { SpotlightCard } from "@repo/ui/cards/SpotlightCard";
import { TodoCard, type TodoCardItem } from "@repo/ui/cards/TodoCard";
import { useTranslations } from "next-intl";
import type { RefObject } from "react";
import { LANDING_ASSETS } from "../../lib/landing-assets";
import { InViewRise } from "../../lib/landing-reveal";
import { landingDownloadSectionStyles } from "./LandingDownloadSection.styles";

const QUICK_ICON_SIZE = 16;

type LandingDownloadPhoneMockupProps = {
  viewportRef: RefObject<HTMLDivElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
};

export function LandingDownloadPhoneMockup({
  viewportRef,
  scrollRef,
}: LandingDownloadPhoneMockupProps) {
  const app = useTranslations("AthleteHome");
  const stats = useTranslations("MarketingLanding.landingStats");
  const slots = landingDownloadSectionStyles();

  const profileName = app("profileName");
  const weekdayLabels = stats.raw("weekdaysShort") as string[];
  const setupItems: TodoCardItem[] = [
    {
      id: "assessment",
      label: app("todoItemAssessment"),
      status: "completed",
    },
    {
      id: "profile",
      label: app("todoItemProfile"),
      status: "completed",
    },
    {
      id: "verify",
      label: app("todoItemVerify"),
      status: "pending",
    },
    {
      id: "first-exercise",
      label: app("todoItemFirstExercise"),
      status: "pending",
    },
  ];
  const setupDone = setupItems.filter((item) => item.status === "completed")
    .length;

  return (
    <InViewRise delayIn={180} fromY={28} className={slots.stage()}>
      <div
        className={`${slots.floatingBadge()} -start-2 top-10 lg:-start-8`}
      >
        <div
          className={`${slots.badgeIcon()} border border-accent/30 bg-accent/15`}
        >
          <Fire1 size={16} className="text-accent" />
        </div>
        <div>
          <Typography
            type="body-sm"
            weight="semibold"
            className="tracking-tight text-foreground"
          >
            {app("activeMinutesValue")} {app("activeMinutesUnit")}
          </Typography>
          <Typography type="body-xs" className="text-muted">
            {app("activeMinutesTitle")}
          </Typography>
        </div>
      </div>

      <div className={slots.bezel()}>
        <div className={slots.screen()}>
          <div className={slots.notch()}>
            <div className={slots.notchDot()} />
          </div>
          <div ref={viewportRef} className={slots.phoneViewport()}>
            <div ref={scrollRef} className={slots.phoneScroll()}>
              <div className={slots.phoneHeader()}>
                <div className={slots.phoneIdentity()}>
                  <Avatar className={slots.phoneAvatar()} color="accent">
                    <Avatar.Image
                      alt={profileName}
                      src={LANDING_ASSETS.coaches[0]?.src}
                    />
                    <Avatar.Fallback>
                      {profileName.slice(0, 1)}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-start">
                    <Typography
                      type="body-sm"
                      weight="bold"
                      className="truncate tracking-tight text-foreground"
                    >
                      {profileName}
                    </Typography>
                    <Typography
                      type="body-xs"
                      className="line-clamp-1 text-muted"
                    >
                      {app("subtitle")}
                    </Typography>
                  </div>
                </div>
                <Badge.Anchor>
                  <Button
                    isIconOnly
                    size="lg"
                    variant="tertiary"
                    aria-label={app("notifications")}
                    className={slots.phoneNotify()}
                  >
                    <Bell1 size={16} />
                  </Button>
                  <Badge
                    aria-label={app("notifications")}
                    color="danger"
                    placement="bottom-right"
                    size="sm"
                  >
                    <Badge.Label>۹+</Badge.Label>
                  </Badge>
                </Badge.Anchor>
              </div>

              <SpotlightCard
                actionAriaLabel={app("heroAction")}
                actionLabel={app("heroAction")}
                className={slots.phoneSpotlight()}
                eyebrow={app("heroEyebrow")}
                progress={72}
                progressLabel={app("heroProgressLabel")}
                title={app("heroTitle")}
                unit={app("heroUnit")}
                value={app("heroValue")}
              />

              <div className={slots.phoneMetrics()}>
                <MetricCard
                  chart={{
                    type: "bars",
                    series: [0.42, 0.58, 0.48, 0.76, 0.64, 0.88, 0.72],
                  }}
                  className={slots.phoneMetric()}
                  color="var(--accent)"
                  dayLabels={weekdayLabels}
                  icon={<FootSteps size={16} />}
                  periodLabel={app("today")}
                  status={app("stepsStatus")}
                  title={app("stepsTitle")}
                  unit={app("stepsUnit")}
                  value={app("stepsValue")}
                  variant="vertical"
                />
                <MetricCard
                  chart={{
                    type: "line",
                    series: [18, 24, 21, 32, 28, 38, 34],
                  }}
                  className={slots.phoneMetric()}
                  color="var(--foreground)"
                  dayLabels={weekdayLabels}
                  icon={<Fire1 size={16} />}
                  periodLabel={app("today")}
                  status={app("activeMinutesStatus")}
                  title={app("activeMinutesTitle")}
                  unit={app("activeMinutesUnit")}
                  value={app("activeMinutesValue")}
                  variant="vertical"
                />
              </div>

              <CallToActionCard
                actionLabel={app("bookingsAction")}
                actionType="icon"
                className={slots.phoneCta()}
                icon={<Calendar1 size={16} />}
                subtitle={app("bookingsDescription")}
                title={app("bookingsTitle")}
                variant="outlined"
              />

              <Typography type="body-xs" className={slots.phoneQuickLabel()}>
                {app("quickLinksTitle")}
              </Typography>
              <div className={slots.phoneQuick()}>
                <QuickActionCard
                  className={slots.phoneQuickItem()}
                  icon={<BarbellHorizontal size={QUICK_ICON_SIZE} />}
                  label={app("workoutsTitle")}
                />
                <QuickActionCard
                  className={slots.phoneQuickItem()}
                  icon={<Calendar1 size={QUICK_ICON_SIZE} />}
                  label={app("bookingsTitle")}
                />
                <QuickActionCard
                  className={slots.phoneQuickItem()}
                  icon={<Wallet size={QUICK_ICON_SIZE} />}
                  label={app("walletTitle")}
                />
                <QuickActionCard
                  className={slots.phoneQuickItem()}
                  icon={<Ticket size={QUICK_ICON_SIZE} />}
                  label={app("membershipsTitle")}
                />
                <QuickActionCard
                  className={slots.phoneQuickItem()}
                  icon={<Scan1 size={QUICK_ICON_SIZE} />}
                  label={app("checkInsTitle")}
                />
                <QuickActionCard
                  className={slots.phoneQuickItem()}
                  icon={<Chat size={QUICK_ICON_SIZE} />}
                  label={app("messagesTitle")}
                />
              </div>

              <TodoCard
                className={slots.phoneTodo()}
                items={setupItems}
                progressLabel={app("todoProgressLabel")}
                stepLabel={app("todoStepLabel", {
                  current: setupDone,
                  total: setupItems.length,
                })}
                title={app("todoTitle")}
              />
            </div>
          </div>
          <div className={slots.homeIndicator()} aria-hidden />
        </div>
      </div>

      <div
        className={`${slots.floatingBadge()} -end-2 bottom-16 lg:-end-8`}
      >
        <div
          className={`${slots.badgeIcon()} border border-border bg-background`}
        >
          <Calendar1 size={16} className="text-foreground" />
        </div>
        <div>
          <Typography
            type="body-sm"
            weight="semibold"
            className="tracking-tight text-foreground"
          >
            {app("bookingsTitle")}
          </Typography>
          <Typography type="body-xs" className="text-muted">
            {app("bookingsAction")}
          </Typography>
        </div>
      </div>
    </InViewRise>
  );
}
