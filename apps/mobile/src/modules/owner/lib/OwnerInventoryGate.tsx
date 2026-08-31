"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type ClubInventoryItem } from "@repo/api";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { accountClubs, accountInventory } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerInventoryScreen } from "../screens/OwnerInventoryScreen";
import type { OwnerInventoryCreateForm } from "../screens/OwnerInventoryScreen/OwnerInventoryScreen.types";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import {
  OWNER_INVENTORY,
  type OwnerInventoryCondition,
  type OwnerInventoryItem,
} from "./owner-inventory-data";

function mapItem(item: ClubInventoryItem): OwnerInventoryItem {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    condition: item.condition,
    locationLabel: item.locationLabel ?? "—",
    version: item.version,
  };
}

export function OwnerInventoryGate() {
  const t = useTranslations("OwnerInventory");
  const { activeRole, isAuthenticated, isReady } = useAuth();
  const [clubId, setClubId] = useState<string | null>(null);
  const [items, setItems] = useState<OwnerInventoryItem[] | null>(
    DEMO_MODE ? OWNER_INVENTORY : null,
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const createAttempt = useRef<{ fingerprint: string; key: string } | null>(
    null,
  );

  const load = useCallback(async () => {
    setError(null);
    const clubs = await accountClubs.list({ page_size: 1 });
    const selectedClubId = clubs.result[0]?.id;
    if (!selectedClubId) {
      setClubId(null);
      setItems([]);
      return;
    }
    const page = await accountInventory.list(selectedClubId, {
      page_size: 100,
    });
    setClubId(selectedClubId);
    setItems(page.result.map(mapItem));
  }, []);

  useEffect(() => {
    if (!isReady || DEMO_MODE) return;
    if (!isAuthenticated || activeRole !== "club_owner") {
      setItems([]);
      setError(t("unauthorized"));
      return;
    }
    void load().catch((cause: unknown) => {
      setItems([]);
      setError(cause instanceof ApiError ? cause.message : t("loadError"));
    });
  }, [activeRole, isAuthenticated, isReady, load, t]);

  const changeCondition = useCallback(
    async (item: OwnerInventoryItem, condition: OwnerInventoryCondition) => {
      if (!clubId || item.version === undefined || item.condition === condition)
        return;
      setPendingId(item.id);
      setError(null);
      try {
        const updated = await accountInventory.update(clubId, item.id, {
          expectedVersion: item.version,
          condition,
        });
        setItems((current) =>
          (current ?? []).map((entry) =>
            entry.id === item.id ? mapItem(updated) : entry,
          ),
        );
      } catch (cause: unknown) {
        setError(
          cause instanceof ApiError ? cause.message : t("updateError"),
        );
        await load().catch(() => undefined);
      } finally {
        setPendingId(null);
      }
    },
    [clubId, load, t],
  );

  const createItem = useCallback(
    async (form: OwnerInventoryCreateForm) => {
      if (!clubId) return;
      setError(null);
      const payload = {
        name: form.name.trim(),
        quantity: form.quantity,
        locationLabel: form.locationLabel.trim() || undefined,
      };
      const fingerprint = JSON.stringify(payload);
      if (createAttempt.current?.fingerprint !== fingerprint) {
        createAttempt.current = {
          fingerprint,
          key: crypto.randomUUID(),
        };
      }
      try {
        await accountInventory.create(clubId, {
          ...payload,
          idempotencyKey: createAttempt.current.key,
        });
        createAttempt.current = null;
        await load();
      } catch (cause: unknown) {
        setError(
          cause instanceof ApiError ? cause.message : t("createError"),
        );
        throw cause;
      }
    },
    [clubId, load, t],
  );

  if (items === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner aria-label={t("loading")} size="lg" />
      </div>
    );
  }

  return (
    <>
      {error ? (
        <div className="flex flex-col items-center gap-2 px-4 pt-3" role="alert">
          <Typography className="text-danger" type="body-sm">
            {error}
          </Typography>
          {clubId ? (
            <Button onPress={() => void load()} size="lg" variant="secondary">
              {t("retry")}
            </Button>
          ) : null}
        </div>
      ) : null}
      <OwnerInventoryScreen
        items={items}
        onCreate={clubId ? createItem : undefined}
        onConditionChange={clubId ? (item, condition) => void changeCondition(item, condition) : undefined}
        pendingId={pendingId}
      />
    </>
  );
}
