import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertDialog } from "@heroui/react/alert-dialog";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
import { Skeleton } from "@heroui/react/skeleton";
import { Table } from "@heroui/react/table";
import { Typography } from "@heroui/react/typography";
import { ApiError, type RefItem } from "@repo/api";
import { ArrowRotateClockwise1 } from "@repo/icons/ArrowRotateClockwise1";
import { CloudDownload1 } from "@repo/icons/CloudDownload1";
import { Pencil1 } from "@repo/icons/Pencil1";
import { Plus } from "@repo/icons/Plus";
import { Trash2 } from "@repo/icons/Trash2";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { adminBasics } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { basicsRefsSectionVariants } from "./BasicsRefsSection.styles";
import type { BasicsRefsSectionProps } from "./BasicsRefsSection.types";

export function BasicsRefsSection({ search, type }: BasicsRefsSectionProps) {
  const t = useTranslations("Admin.Basics");
  const navigate = useNavigate();
  const styles = basicsRefsSectionVariants();

  const [items, setItems] = useState<RefItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminBasics.listRefs(type);
      setItems(result.result);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message || t("errorLoad")
          : t("errorLoad"),
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [type, t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q),
    );
  }, [items, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminBasics.deleteRef(type, deleteId);
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message || t("errorDelete")
          : t("errorDelete"),
      );
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    setError(null);
    try {
      const result = await adminBasics.seedRefDefaults(type);
      toast.success(
        t("importDefaultsDone", {
          created: result.created.length,
          updated: result.updated.length,
          skipped: result.skipped.length,
        }),
      );
      await load();
    } catch {
      setError(t("importDefaultsError"));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className={styles.root()}>
      <section className={styles.intro()}>
        <div className={styles.introCopy()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("refs.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("refs.subtitle")}
          </Typography>
        </div>
        <div className={styles.introActions()}>
          <Button
            isDisabled={seeding}
            variant="outline"
            onPress={() => void handleSeedDefaults()}
          >
            <CloudDownload1 size={18} />
            {t("importDefaults")}
          </Button>
          <Button variant="outline" onPress={() => void load()}>
            <ArrowRotateClockwise1 size={18} />
            {t("refresh")}
          </Button>
          <Button
            variant="primary"
            onPress={() => navigate(routes.refNew(type))}
          >
            <Plus size={18} />
            {t("create")}
          </Button>
        </div>
      </section>

      <Card className={styles.tableCard()}>
        <Card.Content className={styles.tableContent()}>
          {error ? (
            <Typography className={styles.error()} role="alert">
              {error}
            </Typography>
          ) : null}
          {loading ? (
            <div
              aria-label={t("loading")}
              className="grid gap-3 p-1 md:grid-cols-2 xl:grid-cols-3"
              role="status"
            >
              {Array.from({ length: 6 }, (_, index) => (
                <Card key={index} variant="secondary">
                  <Card.Header className="space-y-3">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-4/5" />
                  </Card.Header>
                  <Card.Footer className="justify-end gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </Card.Footer>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Typography className={styles.empty()}>{t("empty")}</Typography>
          ) : (
            <>
              <div className="grid gap-3 p-1 md:hidden">
                {filtered.map((item) => (
                  <Card key={item.id} variant="secondary">
                    <Card.Header className="flex-row items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Card.Title>{item.name}</Card.Title>
                        {item.description ? (
                          <Card.Description className="line-clamp-2">
                            {item.description}
                          </Card.Description>
                        ) : null}
                      </div>
                      <div className={styles.chips()}>
                        <Chip
                          color={item.isActive ? "success" : "default"}
                          size="sm"
                          variant="soft"
                        >
                          {item.isActive ? t("active") : t("inactive")}
                        </Chip>
                      </div>
                    </Card.Header>
                    <Card.Footer className="justify-end gap-2">
                      <Button
                        size="sm"
                        variant="tertiary"
                        onPress={() => navigate(routes.refEdit(type, item.id))}
                      >
                        <Pencil1 size={16} />
                        {t("edit")}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger-soft"
                        onPress={() => setDeleteId(item.id)}
                      >
                        <Trash2 size={16} />
                        {t("delete")}
                      </Button>
                    </Card.Footer>
                  </Card>
                ))}
              </div>
              <div className="hidden md:block">
                <Table>
                  <Table.ScrollContainer>
                    <Table.Content
                      aria-label={t("refs.title")}
                      className="min-w-[620px]"
                    >
                      <Table.Header>
                        <Table.Column id="name" isRowHeader>
                          {t("columns.name")}
                        </Table.Column>
                        <Table.Column id="status">
                          {t("columns.status")}
                        </Table.Column>
                        <Table.Column id="actions">
                          {t("columns.actions")}
                        </Table.Column>
                      </Table.Header>
                      <Table.Body>
                        {filtered.map((item) => (
                          <Table.Row key={item.id} id={item.id}>
                            <Table.Cell>{item.name}</Table.Cell>
                            <Table.Cell>
                              <div className={styles.chips()}>
                                <Chip
                                  color={
                                    item.status === "approved"
                                      ? "success"
                                      : "warning"
                                  }
                                  size="sm"
                                  variant="soft"
                                >
                                  {t(`refStatuses.${item.status}`)}
                                </Chip>
                                <Chip
                                  color={item.isActive ? "success" : "default"}
                                  size="sm"
                                  variant="soft"
                                >
                                  {item.isActive ? t("active") : t("inactive")}
                                </Chip>
                              </div>
                            </Table.Cell>
                            <Table.Cell>
                              <div className={styles.actionsCell()}>
                                <Button
                                  size="sm"
                                  variant="tertiary"
                                  onPress={() =>
                                    navigate(routes.refEdit(type, item.id))
                                  }
                                >
                                  <Pencil1 size={16} />
                                  {t("edit")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onPress={() => setDeleteId(item.id)}
                                >
                                  <Trash2 size={16} />
                                  {t("delete")}
                                </Button>
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                </Table>
              </div>
            </>
          )}
        </Card.Content>
      </Card>

      <AlertDialog>
        <AlertDialog.Backdrop
          isOpen={deleteId != null}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null);
          }}
        >
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>
                  {t("refs.deleteTitle")}
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <Typography>{t("refs.deleteBody")}</Typography>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">
                  {t("cancel")}
                </Button>
                <Button
                  isPending={deleting}
                  variant="danger"
                  onPress={() => void handleDelete()}
                >
                  {t("delete")}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  );
}
