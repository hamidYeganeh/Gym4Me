import { useCallback, useMemo, useState } from "react";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Typography } from "@heroui/react/typography";
import type { AdminWallet, RebuildWalletInput } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable, AdminShell } from "@/shared/components";
import { useAdminPaginatedQuery } from "@/shared/hooks";
import { adminFinance } from "@/shared/lib/api";
import { adminListPaginationProps } from "@/shared/lib/admin-list-pagination";
import { formatAdminDate } from "@/shared/lib/user-format";

const PAGE_SIZE = 40;
const ownerTypes = ["user", "club", "coach"] as const;
const columnHelper = createColumnHelper<AdminWallet>();

export function WalletsScreen() {
  const t = useTranslations("Admin.Finance.wallets");
  const tCommon = useTranslations("Admin.Common");
  const [type, setType] = useState<"" | RebuildWalletInput["type"]>("");
  const [ownerId, setOwnerId] = useState("");
  const [applied, setApplied] = useState({ type: "", ownerId: "" });
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const queryKey = JSON.stringify({ applied });

  const fetchPage = useCallback(
    (nextPage: number, pageSize: number) =>
      adminFinance.listWallets({
        page: nextPage,
        page_size: pageSize,
        type: (applied.type || undefined) as RebuildWalletInput["type"] | undefined,
        ownerId: applied.ownerId || undefined,
      }),
    [applied],
  );
  const query = useAdminPaginatedQuery<AdminWallet>({
    queryKey,
    page,
    pageSize: PAGE_SIZE,
    onPageChange: setPage,
    errorFallback: t("error"),
    fetchPage,
  });

  const rebuild = useCallback(async (wallet: AdminWallet) => {
    if (!window.confirm(t("confirm"))) return;
    setBusyId(wallet.id);
    setMessage(null);
    try {
      const result = await adminFinance.rebuildWallet(wallet.owner);
      setMessage(t("success", { previous: result.previousBalance, balance: result.balance }));
      await query.reload();
    } catch {
      setMessage(t("error"));
    } finally {
      setBusyId(null);
    }
  }, [query, t]);

  const columns = useMemo(() => [
    columnHelper.accessor("owner.type", { header: t("columns.type"), cell: ({ getValue }) => t(getValue()) }),
    columnHelper.accessor("owner.id", { header: t("columns.ownerId") }),
    columnHelper.accessor("balance", { header: t("columns.balance"), cell: ({ getValue, row }) => `${new Intl.NumberFormat("fa-IR").format(getValue())} ${row.original.currency}` }),
    columnHelper.accessor("updatedAt", { header: t("columns.updatedAt"), cell: ({ getValue }) => formatAdminDate(getValue()) }),
    columnHelper.display({ id: "action", header: t("columns.action"), cell: ({ row }) => <Button isDisabled={busyId !== null} onPress={() => void rebuild(row.original)} size="sm" variant="outline">{busyId === row.original.id ? t("rebuilding") : t("rebuild")}</Button> }),
  ] as ColumnDef<AdminWallet, unknown>[], [busyId, rebuild, t]);

  return <AdminShell activeNavId="finance" financeSection={{ activeTabId: "wallets" }}>
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
      <header><Typography type="h1" weight="bold">{t("title")}</Typography><Typography className="mt-2 text-muted">{t("subtitle")}</Typography></header>
      <form className="grid gap-4 rounded-2xl border border-border bg-surface p-4 md:grid-cols-[12rem_1fr_auto]" onSubmit={(event) => { event.preventDefault(); setPage(1); setApplied({ type, ownerId: ownerId.trim() }); }}>
        <label className="flex flex-col gap-2"><span>{t("ownerType")}</span><select className="h-10 rounded-xl border border-border bg-background px-3" value={type} onChange={(event) => setType(event.target.value as typeof type)}><option value="">{t("allTypes")}</option>{ownerTypes.map((value) => <option key={value} value={value}>{t(value)}</option>)}</select></label>
        <Input aria-label={t("ownerId")} placeholder={t("ownerIdHint")} value={ownerId} onChange={(event) => setOwnerId(event.target.value)} />
        <Button className="self-end" type="submit">{t("load")}</Button>
      </form>
      {message ? <p aria-live="polite" className="rounded-xl bg-surface-secondary p-4">{message}</p> : null}
      <AdminDataTable ariaLabel={t("title")} columns={columns} data={query.items} emptyLabel={t("empty")} error={query.error} getRowId={(row) => row.id} isLoading={query.loading} loadingLabel={t("rebuilding")} pagination={adminListPaginationProps({ page, totalPages: query.totalPages, previousLabel: tCommon("pagination.previous"), nextLabel: tCommon("pagination.next"), onPageChange: query.setPage })} />
    </div>
  </AdminShell>;
}
