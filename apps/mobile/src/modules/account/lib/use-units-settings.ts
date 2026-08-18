"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PublicChoiceGroup } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { accountProfile, basicsChoices } from "@/shared/lib/api";
import {
  resolveUnitValue,
  sortUnitChoiceGroups,
} from "./units-settings";

export function useUnitsSettings() {
  const t = useTranslations("Mobile.UnitsSettings");
  const [groups, setGroups] = useState<PublicChoiceGroup[]>([]);
  const [units, setUnits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const [nextGroups, settings] = await Promise.all([
        basicsChoices.listUnitGroups(),
        accountProfile.getSettings(),
      ]);
      setGroups(sortUnitChoiceGroups(nextGroups));
      setUnits(settings.units ?? {});
    } catch (err) {
      setGroups([]);
      setUnits({});
      setError(err instanceof ApiError ? err.message : t("error"));
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeGroup = useMemo(
    () => groups.find((group) => group.value === activeKey) ?? null,
    [activeKey, groups],
  );

  const openGroup = (group: PublicChoiceGroup) => {
    setSaveError(null);
    setActiveKey(group.value);
    setDraft(resolveUnitValue(units[group.value], group.options));
  };

  const closeSheet = () => {
    if (isPending) return;
    setActiveKey(null);
    setDraft(null);
    setSaveError(null);
  };

  const apply = async () => {
    if (!activeGroup || !draft) return;
    const option = activeGroup.options.find((item) => item.value === draft);
    if (!option || option.isActive === false) return;
    if (units[activeGroup.value] === draft) {
      setActiveKey(null);
      setDraft(null);
      return;
    }

    setIsPending(true);
    setSaveError(null);
    try {
      const next = await accountProfile.updateSettings({
        units: { [activeGroup.value]: draft },
      });
      setUnits(next.units ?? {});
      setActiveKey(null);
      setDraft(null);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t("errorSave"));
    } finally {
      setIsPending(false);
    }
  };

  return {
    groups,
    units,
    loading,
    error,
    saveError,
    activeGroup,
    draft,
    isPending,
    load,
    openGroup,
    closeSheet,
    setDraft,
    apply,
  };
}
