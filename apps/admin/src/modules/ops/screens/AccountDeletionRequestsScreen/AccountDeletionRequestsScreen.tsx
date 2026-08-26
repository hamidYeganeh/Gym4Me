import { Button } from '@heroui/react/button';
import { Chip } from '@heroui/react/chip';
import { Typography } from '@heroui/react/typography';
import type { AdminAccountDeletionRequest } from '@repo/api/admin';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { AdminDataTable, AdminShell } from '@/shared/components';
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from '@/shared/hooks';
import {
  adminListPaginationProps,
  adminListPaginationSummary,
} from '@/shared/lib/admin-list-pagination';
import { adminDataRights } from '@/shared/lib/api';
import { formatAdminDate } from '@/shared/lib/user-format';

const PAGE_SIZE = 40;
const columnHelper = createColumnHelper<AdminAccountDeletionRequest>();

export function AccountDeletionRequestsScreen() {
  const t = useTranslations('Admin.Ops');
  const tCommon = useTranslations('Admin.Common');
  const { page, pageSize, setPage } =
    useAdminListQueryParams<Record<never, never>>({
      filterKeys: [],
      defaults: { page: 1, page_size: PAGE_SIZE },
    });
  const fetchPage = useCallback(
    (nextPage: number, nextPageSize: number) =>
      adminDataRights.listAccountDeletions({
        page: nextPage,
        page_size: nextPageSize,
      }),
    [],
  );
  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<AdminAccountDeletionRequest>({
    queryKey: 'account-deletion-requests',
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t('deletions.errorLoad'),
    fetchPage,
  });
  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('userId', {
          header: t('deletions.columns.user'),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
        }),
        columnHelper.accessor('status', {
          header: t('deletions.columns.status'),
          cell: ({ getValue }) => (
            <Chip size="sm" variant="soft">
              {t(`deletions.status.${getValue()}`)}
            </Chip>
          ),
        }),
        columnHelper.accessor('requestedAt', {
          header: t('deletions.columns.requestedAt'),
          cell: ({ getValue }) => formatAdminDate(getValue()),
        }),
        columnHelper.accessor('coolingOffUntil', {
          header: t('deletions.columns.coolingOffUntil'),
          cell: ({ getValue }) => formatAdminDate(getValue()),
        }),
        columnHelper.accessor((row) => row.reason ?? '—', {
          id: 'reason',
          header: t('deletions.columns.reason'),
        }),
      ] as ColumnDef<AdminAccountDeletionRequest, unknown>[],
    [t],
  );
  const summary = adminListPaginationSummary(page, pageSize, total);

  return (
    <AdminShell activeNavId="ops" opsSection={{ activeTabId: 'deletions' }}>
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Typography type="h2" weight="bold">
              {t('deletions.title')}
            </Typography>
            <Typography className="text-muted" type="body-sm">
              {t('deletions.subtitle')}
            </Typography>
          </div>
          <Button onPress={() => void reload()} variant="secondary">
            {t('refresh')}
          </Button>
        </div>
        <AdminDataTable
          ariaLabel={t('deletions.title')}
          columns={columns}
          data={items}
          emptyLabel={t('deletions.empty')}
          error={error}
          getRowId={(row) => row.id}
          isLoading={loading}
          loadingLabel={t('loading')}
          pagination={adminListPaginationProps({
            page,
            totalPages,
            previousLabel: tCommon('pagination.previous'),
            nextLabel: tCommon('pagination.next'),
            onPageChange: changePage,
          })}
          summaryLabel={t('deletions.summary', {
            loaded: `${summary.from}–${summary.to}`,
            total: summary.total,
          })}
        />
      </div>
    </AdminShell>
  );
}
