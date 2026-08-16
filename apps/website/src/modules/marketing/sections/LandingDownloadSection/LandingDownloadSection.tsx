"use client";

import { Avatar, Badge, Button, Typography } from "@heroui/react";
import { Bell1, Calendar1, Fire1 } from "@repo/icons";
import { CallToActionCard } from "@repo/ui/cards/CallToActionCard";
import { SpotlightCard } from "@repo/ui/cards/SpotlightCard";
import { TodoCard, type TodoCardItem } from "@repo/ui/cards/TodoCard";
import { useTranslations } from "next-intl";
import { LANDING_ASSETS } from "../../lib/landing-assets";
import { ClipReveal, InViewRise } from "../../lib/landing-reveal";
import { landingDownloadSectionStyles } from "./LandingDownloadSection.styles";
import type { LandingDownloadSectionProps } from "./LandingDownloadSection.types";

function AppStoreMark({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 384 512"
      aria-hidden
    >
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function PlayStoreMark({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 512 512"
      aria-hidden
    >
      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
    </svg>
  );
}

export function LandingDownloadSection({
  className,
}: LandingDownloadSectionProps) {
  const t = useTranslations("MarketingLanding.download");
  const app = useTranslations("AthleteHome");
  const slots = landingDownloadSectionStyles();
  const profileName = app("profileName");
  const setupItems: TodoCardItem[] = [
    {
      id: "assessment",
      label: app("todoItemAssessment"),
      status: "completed",
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
    <section id="download" className={slots.root({ className })}>
      <div className={slots.inner()}>
        <div className={slots.copy()}>
          <ClipReveal
            id="download-title"
            as="h2"
            mode="lines"
            text={"اپ را نصب کن\nو رزرو را شروع کن"}
            className={slots.title()}
          />
          <p className={slots.hint()}>
            باشگاه، مربی و کلاس را پیدا کن. پرداخت و تمدید عضویت همان‌جا تمام
            می‌شود — درست مثل تجربه اپ.
          </p>
          <InViewRise delayIn={120} fromY={18} className={slots.actions()}>
            <Button
              size="lg"
              aria-label={`${t("appStoreLabel")} ${t("appStoreTitle")}`}
              className={slots.store()}
              onPress={() => window.location.assign("#")}
            >
              <AppStoreMark className={slots.storeIcon()} />
              <span>
                <Typography
                  type="body-xs"
                  weight="bold"
                  className={slots.storeKicker()}
                >
                  {t("appStoreLabel")}
                </Typography>
                <Typography
                  type="body"
                  weight="bold"
                  className={slots.storeTitle()}
                >
                  {t("appStoreTitle")}
                </Typography>
              </span>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              aria-label={`${t("playStoreLabel")} ${t("playStoreTitle")}`}
              className={slots.storeGhost()}
              onPress={() => window.location.assign("#")}
            >
              <PlayStoreMark className={slots.storeIconPlay()} />
              <span>
                <Typography
                  type="body-xs"
                  weight="bold"
                  className={slots.storeKicker()}
                >
                  {t("playStoreLabel")}
                </Typography>
                <Typography
                  type="body"
                  weight="bold"
                  className={slots.storeTitle()}
                >
                  {t("playStoreTitle")}
                </Typography>
              </span>
            </Button>
          </InViewRise>
        </div>

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
              <div className={slots.screenInner()}>
                <div className={slots.phoneHeader()}>
                  <div className={slots.phoneIdentity()}>
                    <Avatar className={slots.phoneAvatar()} color="accent">
                      <Avatar.Image
                        alt={profileName}
                        src={LANDING_ASSETS.coaches[0]?.src}
                      />
                      <Avatar.Fallback>{profileName.slice(0, 1)}</Avatar.Fallback>
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

                <CallToActionCard
                  actionLabel={app("bookingsAction")}
                  actionType="icon"
                  className={slots.phoneCta()}
                  icon={<Calendar1 size={16} />}
                  subtitle={app("bookingsDescription")}
                  title={app("bookingsTitle")}
                  variant="outlined"
                />

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

                <div className={slots.homeIndicator()} />
              </div>
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
      </div>
    </section>
  );
}
