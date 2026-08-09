"use client";

import { useMemo, useState } from "react";
import { Button } from "@heroui/react";
import {
  BarbellHorizontal,
  BookOpen,
  Building2,
  Calendar1,
  ChartBar2,
  Chat,
  Clipboard,
  HeartEcg,
  House1,
  Kettlebell,
  Leaf,
  Megaphone,
  Newspaper1,
  PersonRunning,
  SleepZzz,
  User,
  UsersThree,
  Whistle,
} from "@repo/icons";
import { Logo } from "@repo/ui/common/Logo";
import {
  BottomNavigation,
  type BottomNavQuickAction,
} from "@repo/ui/layout/BottomNav";

type BottomNavRole = "athlete" | "coach" | "owner";

type BottomNavDemoLabels = {
  navLabel: string;
  preview: string;
  home: string;
  analytics: string;
  resources: string;
  profile: string;
  create: string;
  actionsLabel: string;
  roleAthlete: string;
  roleCoach: string;
  roleOwner: string;
  healthMetrics: string;
  activity: string;
  sleep: string;
  nutrition: string;
  workouts: string;
  coachBooking: string;
  community: string;
  clients: string;
  schedule: string;
  programs: string;
  messages: string;
  clubs: string;
  staff: string;
  classes: string;
  equipment: string;
  bookings: string;
  marketing: string;
};

const ICON_SIZE = 22;
const ACTION_ICON_SIZE = 22;

export function BottomNavDemo({ labels }: { labels: BottomNavDemoLabels }) {
  const [active, setActive] = useState("home");
  const [role, setRole] = useState<BottomNavRole>("athlete");

  const roleActions = useMemo((): BottomNavQuickAction[] => {
    const sharedTail: BottomNavQuickAction[] = [
      {
        key: "resources",
        label: labels.resources,
        icon: <BookOpen size={ACTION_ICON_SIZE} />,
      },
    ];

    if (role === "coach") {
      return [
        {
          key: "clients",
          label: labels.clients,
          icon: <UsersThree size={ACTION_ICON_SIZE} />,
        },
        {
          key: "schedule",
          label: labels.schedule,
          icon: <Calendar1 size={ACTION_ICON_SIZE} />,
        },
        {
          key: "workouts",
          label: labels.workouts,
          icon: <BarbellHorizontal size={ACTION_ICON_SIZE} />,
        },
        {
          key: "programs",
          label: labels.programs,
          icon: <Clipboard size={ACTION_ICON_SIZE} />,
        },
        {
          key: "messages",
          label: labels.messages,
          icon: <Chat size={ACTION_ICON_SIZE} />,
        },
        {
          key: "analytics",
          label: labels.analytics,
          icon: <ChartBar2 size={ACTION_ICON_SIZE} />,
        },
        {
          key: "community",
          label: labels.community,
          icon: <UsersThree size={ACTION_ICON_SIZE} />,
        },
        ...sharedTail,
      ];
    }

    if (role === "owner") {
      return [
        {
          key: "clubs",
          label: labels.clubs,
          icon: <Building2 size={ACTION_ICON_SIZE} />,
        },
        {
          key: "staff",
          label: labels.staff,
          icon: <UsersThree size={ACTION_ICON_SIZE} />,
        },
        {
          key: "classes",
          label: labels.classes,
          icon: <Kettlebell size={ACTION_ICON_SIZE} />,
        },
        {
          key: "equipment",
          label: labels.equipment,
          icon: <BarbellHorizontal size={ACTION_ICON_SIZE} />,
        },
        {
          key: "bookings",
          label: labels.bookings,
          icon: <Calendar1 size={ACTION_ICON_SIZE} />,
        },
        {
          key: "analytics",
          label: labels.analytics,
          icon: <ChartBar2 size={ACTION_ICON_SIZE} />,
        },
        {
          key: "marketing",
          label: labels.marketing,
          icon: <Megaphone size={ACTION_ICON_SIZE} />,
        },
        ...sharedTail,
      ];
    }

    return [
      {
        key: "health",
        label: labels.healthMetrics,
        icon: <HeartEcg size={ACTION_ICON_SIZE} />,
      },
      {
        key: "activity",
        label: labels.activity,
        icon: <PersonRunning size={ACTION_ICON_SIZE} />,
      },
      {
        key: "sleep",
        label: labels.sleep,
        icon: <SleepZzz size={ACTION_ICON_SIZE} />,
      },
      {
        key: "nutrition",
        label: labels.nutrition,
        icon: <Leaf size={ACTION_ICON_SIZE} />,
      },
      {
        key: "workouts",
        label: labels.workouts,
        icon: <BarbellHorizontal size={ACTION_ICON_SIZE} />,
      },
      {
        key: "coach-booking",
        label: labels.coachBooking,
        icon: <Whistle size={ACTION_ICON_SIZE} />,
      },
      {
        key: "community",
        label: labels.community,
        icon: <UsersThree size={ACTION_ICON_SIZE} />,
      },
      ...sharedTail,
    ];
  }, [labels, role]);

  const roles: { key: BottomNavRole; label: string }[] = [
    { key: "athlete", label: labels.roleAthlete },
    { key: "coach", label: labels.roleCoach },
    { key: "owner", label: labels.roleOwner },
  ];

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        {roles.map((item) => (
          <Button
            key={item.key}
            onPress={() => {
              setRole(item.key);
              setActive("home");
            }}
            size="sm"
            variant={role === item.key ? "primary" : "secondary"}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <p className="text-center text-sm text-muted">{labels.preview}</p>
      <div className="overflow-hidden rounded-3xl border border-border bg-background">
        <BottomNavigation
          aria-label={labels.navLabel}
          centerAction={{
            label: labels.create,
            icon: (
              <Logo
                color="var(--accent-foreground)"
                gradient={false}
                shadow={false}
                size={48}
              />
            ),
            actionsLabel: labels.actionsLabel,
            actions: roleActions,
          }}
          className="relative inset-x-auto bottom-auto w-full"
          items={[
            {
              key: "home",
              label: labels.home,
              icon: <House1 size={ICON_SIZE} />,
              isActive: active === "home",
              onPress: () => setActive("home"),
            },
            {
              key: "analytics",
              label: labels.analytics,
              icon: <ChartBar2 size={ICON_SIZE} />,
              isActive: active === "analytics",
              onPress: () => setActive("analytics"),
            },
            {
              key: "resources",
              label: labels.resources,
              icon: <Newspaper1 size={ICON_SIZE} />,
              isActive: active === "resources",
              onPress: () => setActive("resources"),
            },
            {
              key: "profile",
              label: labels.profile,
              icon: <User size={ICON_SIZE} />,
              isActive: active === "profile",
              onPress: () => setActive("profile"),
            },
          ]}
        />
      </div>
    </div>
  );
}
