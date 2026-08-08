import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner, Table, Typography } from "@heroui/react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type TableMeta,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { adminDataTableVariants } from "./AdminDataTable.styles";
import type { AdminDataTableProps } from "./AdminDataTable.types";

const VIRTUALIZE_FROM = 40;

export function AdminDataTable<TData>({
  columns,
  data,
  getRowId,
  ariaLabel,
  emptyLabel,
  loadingLabel,
  loadingMoreLabel,
  summaryLabel,
  error,
  isLoading = false,
  isFetchingMore = false,
  hasMore = false,
  onLoadMore,
  estimateRowHeight = 56,
  meta,
  toolbar,
  className,
}: AdminDataTableProps<TData>) {
  const styles = adminDataTableVariants();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);

  const setScrollRef = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node;
    setScrollEl(node);
  }, []);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => getRowId(row),
    meta: meta as TableMeta<TData> | undefined,
    defaultColumn: {
      size: 140,
      minSize: 96,
      maxSize: 480,
    },
  });

  const rows = table.getRowModel().rows;
  const shouldVirtualize = rows.length >= VIRTUALIZE_FROM;

  const virtualizer = useVirtualizer({
    count: shouldVirtualize && scrollEl ? rows.length : 0,
    getScrollElement: () => scrollEl,
    estimateSize: () => estimateRowHeight,
    overscan: 8,
  });

  const virtualRows = shouldVirtualize ? virtualizer.getVirtualItems() : [];
  const useVirtualRows = shouldVirtualize && virtualRows.length > 0;
  const paddingTop = useVirtualRows ? (virtualRows[0]?.start ?? 0) : 0;
  const paddingBottom = useVirtualRows
    ? virtualizer.getTotalSize() -
      (virtualRows[virtualRows.length - 1]?.end ?? 0)
    : 0;

  const visibleRows = useVirtualRows
    ? virtualRows
        .map((virtualRow) => rows[virtualRow.index])
        .filter((row): row is (typeof rows)[number] => row != null)
    : rows;

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !onLoadMore) return;

    const onScroll = () => {
      const remaining =
        element.scrollHeight - element.scrollTop - element.clientHeight;
      if (remaining < estimateRowHeight * 4 && hasMore && !isFetchingMore) {
        onLoadMore();
      }
    };

    element.addEventListener("scroll", onScroll, { passive: true });
    return () => element.removeEventListener("scroll", onScroll);
  }, [estimateRowHeight, hasMore, isFetchingMore, onLoadMore]);

  return (
    <div className={styles.root({ className })}>
      {toolbar ? <div className={styles.toolbar()}>{toolbar}</div> : null}

      {error ? <p className={styles.error()}>{error}</p> : null}

      {isLoading ? (
        <div className={styles.loading()}>
          <Spinner size="sm" />
          {loadingLabel}
        </div>
      ) : data.length === 0 ? (
        <p className={styles.empty()}>{emptyLabel}</p>
      ) : (
        <Table>
          <Table.ScrollContainer
            ref={setScrollRef}
            className={styles.scroll()}
          >
            <Table.Content aria-label={ariaLabel} className={styles.table()}>
              <Table.Header className={styles.header()}>
                {table.getHeaderGroups()[0]?.headers.map((header) => {
                  const size = header.column.getSize();
                  return (
                    <Table.Column
                      key={header.id}
                      id={header.id}
                      isRowHeader={header.index === 0}
                      style={{ width: size, minWidth: size }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </Table.Column>
                  );
                })}
              </Table.Header>
              <Table.Body>
                {paddingTop > 0 ? (
                  <tr aria-hidden>
                    <td
                      className={styles.spacerCell()}
                      colSpan={Math.max(table.getVisibleLeafColumns().length, 1)}
                      style={{ height: paddingTop }}
                    />
                  </tr>
                ) : null}
                {visibleRows.map((row) => (
                  <Table.Row key={row.id} id={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <Table.Cell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
                {paddingBottom > 0 ? (
                  <tr aria-hidden>
                    <td
                      className={styles.spacerCell()}
                      colSpan={Math.max(table.getVisibleLeafColumns().length, 1)}
                      style={{ height: paddingBottom }}
                    />
                  </tr>
                ) : null}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}

      {!isLoading && data.length > 0 ? (
        <div className={styles.footer()}>
          {summaryLabel ? <Typography>{summaryLabel}</Typography> : <span />}
          {isFetchingMore ? (
            <div className={styles.loadMore()}>
              <Spinner size="sm" />
              {loadingMoreLabel ?? loadingLabel}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
