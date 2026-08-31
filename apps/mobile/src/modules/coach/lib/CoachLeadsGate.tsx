"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ApiError, type CoachLead as ApiCoachLead } from "@repo/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { accountCoaching } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachLeadsScreen } from "../screens/CoachLeadsScreen";
import {
  type CoachLead,
  type CoachLeadStage,
  type CreateCoachLeadFormInput,
} from "./coach-leads-data";

export function CoachLeadsGate() {
  const t = useTranslations("CoachLeads");
  const { activeRole, isAuthenticated, isReady } = useAuth();
  const [leads, setLeads] = useState<CoachLead[] | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createAttemptKey = useRef<string | null>(null);

  const toView = useCallback(
    (lead: ApiCoachLead): CoachLead => ({
      id: lead.id,
      name: lead.contact.name,
      phoneLabel: lead.contact.phone ?? t("noPhone"),
      sourceLabel: lead.source ?? t("unknownSource"),
      note: lead.notes ?? t("noNote"),
      stage: lead.stage,
      updatedLabel: t("updatedAt", {
        date: new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Tehran",
        }).format(new Date(lead.updatedAt)),
      }),
      athleteUserId: lead.contact.userId ?? undefined,
    }),
    [t],
  );

  const reload = useCallback(async () => {
    setError(null);
    const page = await accountCoaching.listLeads({ page: 1, page_size: 100 });
    setLeads(page.result.map(toView));
  }, [toView]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated || activeRole !== "coach") {
      setLeads([]);
      setError(t("unauthorized"));
      return;
    }
    let cancelled = false;
    reload().catch((cause: unknown) => {
      if (cancelled) return;
      setLeads([]);
      setError(cause instanceof ApiError ? cause.message : t("loadError"));
    });
    return () => {
      cancelled = true;
    };
  }, [activeRole, isAuthenticated, isReady, reload, t]);

  const onChangeStage = useCallback(
    async (leadId: string, stage: CoachLeadStage) => {
      setUpdatingId(leadId);
      setError(null);
      try {
        const current = leads?.find((lead) => lead.id === leadId);
        if (stage === "converted" && !current?.athleteUserId) {
          setError(t("conversionRequiresAccount"));
          return;
        }
        const updated = await accountCoaching.updateLeadStage(leadId, {
          stage,
          athleteUserId:
            stage === "converted" ? current?.athleteUserId : undefined,
        });
        setLeads((items) =>
          (items ?? []).map((lead) =>
            lead.id === leadId ? toView(updated) : lead,
          ),
        );
      } catch (cause) {
        setError(cause instanceof ApiError ? cause.message : t("updateError"));
      } finally {
        setUpdatingId(null);
      }
    },
    [leads, t, toView],
  );

  const onCreate = useCallback(
    async (input: CreateCoachLeadFormInput) => {
      setCreating(true);
      setError(null);
      try {
        const idempotencyKey =
          createAttemptKey.current ??
          `coach-lead:${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
        createAttemptKey.current = idempotencyKey;
        const created = await accountCoaching.createLead({
          idempotencyKey,
          contact: { name: input.name, phone: input.phone },
          source: input.source,
          notes: input.notes,
        });
        setLeads((current) => [
          toView(created),
          ...(current ?? []).filter((lead) => lead.id !== created.id),
        ]);
        createAttemptKey.current = null;
      } catch (cause) {
        setError(cause instanceof ApiError ? cause.message : t("createError"));
        throw cause;
      } finally {
        setCreating(false);
      }
    },
    [t, toView],
  );

  if (!leads) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner aria-label={t("loading")} size="lg" />
      </div>
    );
  }

  if (error && leads.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center" role="alert">
        <Typography type="body">{error}</Typography>
        <Button size="lg" onPress={() => void reload()} variant="secondary">
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <CoachLeadsScreen
      creating={creating}
      error={error}
      leads={leads}
      onCreate={onCreate}
      onChangeStage={onChangeStage}
      updatingId={updatingId}
    />
  );
}
