import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  Button,
  Card,
  Chip,
  Spinner,
  Table,
  Typography,
} from "@heroui/react";
import { ApiError, type RefItem } from "@repo/api";
import { ArrowRotateClockwise1, Pencil1, Plus, Trash2 } from "@repo/icons";
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
          <Button variant="outline" onPress={() => void load()}>
            <ArrowRotateClockwise1 size={18} />
            {t("refresh")}
          </Button>
          <Button variant="primary" onPress={() => navigate(routes.refNew(type))}>
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
            <div className={styles.loading()}>
              <Spinner size="sm" />
              {t("loading")}
            </div>
          ) : filtered.length === 0 ? (
            <Typography className={styles.empty()}>{t("empty")}</Typography>
          ) : (
            <Table>
              <Table.ScrollContainer>
                <Table.Content
                  aria-label={t("refs.title")}
                  className="min-w-[860px]"
                >
                  <Table.Header>
                    <Table.Column id="name" isRowHeader>
                      {t("columns.name")}
                    </Table.Column>
                    <Table.Column id="slug">{t("columns.slug")}</Table.Column>
                    <Table.Column id="type">{t("columns.type")}</Table.Column>
                    <Table.Column id="status">{t("columns.status")}</Table.Column>
                    <Table.Column id="order">{t("columns.order")}</Table.Column>
                    <Table.Column id="actions">
                      {t("columns.actions")}
                    </Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {filtered.map((item) => (
                      <Table.Row key={item.id} id={item.id}>
                        <Table.Cell>{item.name}</Table.Cell>
                        <Table.Cell>
                          <code className="text-xs">{item.slug}</code>
                        </Table.Cell>
                        <Table.Cell>{t(`refTypes.${item.type}`)}</Table.Cell>
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
                        <Table.Cell>{item.order}</Table.Cell>
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
                <AlertDialog.Heading>{t("refs.deleteTitle")}</AlertDialog.Heading>
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
