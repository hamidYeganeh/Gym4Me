import { useCallback, useEffect, useRef, useState } from "react";
import { Pagination } from "@heroui/react/pagination";
import { Spinner } from "@heroui/react/spinner";
import { Table } from "@heroui/react/table";
import { Typography } from "@heroui/react/typography";
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

function paginationItems(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "start" | "end"> = [1];
  if (page > 3) items.push("start");
  for (
    let value = Math.max(2, page - 1);
    value <= Math.min(totalPages - 1, page + 1);
    value += 1
  ) {
    items.push(value);
  }
  if (page < totalPages - 2) items.push("end");
  items.push(totalPages);
  return items;
}

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
  sort,
  onSortChange,
  pagination,
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
      enableSorting: false,
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

      {error ? (
        <Typography className={styles.error()}>{error}</Typography>
      ) : null}

      {isLoading ? (
        <div className={styles.loading()}>
          <Spinner size="sm" />
          {loadingLabel}
        </div>
      ) : data.length === 0 ? (
        <Typography className={styles.empty()}>{emptyLabel}</Typography>
      ) : (
        <Table>
          <Table.ScrollContainer
            ref={setScrollRef}
            className={styles.scroll()}
          >
            <Table.Content
              aria-label={ariaLabel}
              className={styles.table()}
              sortDescriptor={sort}
              onSortChange={(descriptor) =>
                onSortChange?.({
                  column: String(descriptor.column),
                  direction: descriptor.direction,
                })
              }
            >
              <Table.Header className={styles.header()}>
                {table.getHeaderGroups()[0]?.headers.map((header) => {
                  const size = header.column.getSize();
                  return (
                    <Table.Column
                      key={header.id}
                      allowsSorting={header.column.getCanSort()}
                      id={header.id}
                      isRowHeader={header.index === 0}
                      style={{ width: size, minWidth: size }}
                    >
                      {({ sortDirection }) =>
                        header.column.getCanSort() ? (
                          <Table.SortableColumnHeader
                            sortDirection={sortDirection}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </Table.SortableColumnHeader>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )
                      }
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
          {pagination && pagination.totalPages > 1 ? (
            <Pagination size="sm">
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    isDisabled={pagination.page <= 1}
                    onPress={() =>
                      pagination.onPageChange(pagination.page - 1)
                    }
                  >
                    <Pagination.PreviousIcon />
                    <span>{pagination.previousLabel}</span>
                  </Pagination.Previous>
                </Pagination.Item>
                {paginationItems(
                  pagination.page,
                  pagination.totalPages,
                ).map((item) =>
                  typeof item === "number" ? (
                    <Pagination.Item key={item}>
                      <Pagination.Link
                        isActive={item === pagination.page}
                        onPress={() => pagination.onPageChange(item)}
                      >
                        {item}
                      </Pagination.Link>
                    </Pagination.Item>
                  ) : (
                    <Pagination.Item key={item}>
                      <Pagination.Ellipsis />
                    </Pagination.Item>
                  ),
                )}
                <Pagination.Item>
                  <Pagination.Next
                    isDisabled={pagination.page >= pagination.totalPages}
                    onPress={() =>
                      pagination.onPageChange(pagination.page + 1)
                    }
                  >
                    <span>{pagination.nextLabel}</span>
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          ) : null}
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
