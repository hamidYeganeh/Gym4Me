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
import { ApiError, type ChoiceGroup } from "@repo/api";
import { ArrowRotateClockwise1, Pencil1, Plus, Trash2 } from "@repo/icons";
import { useTranslations } from "next-intl";
import { adminBasics } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { basicsChoicesSectionVariants } from "./BasicsChoicesSection.styles";
import type { BasicsChoicesSectionProps } from "./BasicsChoicesSection.types";

export function BasicsChoicesSection({ search }: BasicsChoicesSectionProps) {
  const t = useTranslations("Admin.Basics");
  const navigate = useNavigate();
  const styles = basicsChoicesSectionVariants();

  const [items, setItems] = useState<ChoiceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminBasics.listChoices();
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
  }, [t]);

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
        item.value.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q),
    );
  }, [items, search]);

  const handleDelete = async () => {
    if (!deleteKey) return;
    setDeleting(true);
    try {
      await adminBasics.deleteChoice(deleteKey);
      setDeleteKey(null);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message || t("errorDelete")
          : t("errorDelete"),
      );
      setDeleteKey(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.root()}>
      <section className={styles.intro()}>
        <div className={styles.introCopy()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("choices.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("choices.subtitle")}
          </Typography>
        </div>
        <div className={styles.introActions()}>
          <Button variant="outline" onPress={() => void load()}>
            <ArrowRotateClockwise1 size={18} />
            {t("refresh")}
          </Button>
          <Button variant="primary" onPress={() => navigate(routes.choicesNew)}>
            <Plus size={18} />
            {t("create")}
          </Button>
        </div>
      </section>

      <Card className={styles.tableCard()}>
        <Card.Content className={styles.tableContent()}>
          {error ? <p className={styles.error()}>{error}</p> : null}

          {loading ? (
            <div className={styles.loading()}>
              <Spinner size="sm" />
              {t("loading")}
            </div>
          ) : filtered.length === 0 ? (
            <p className={styles.empty()}>{t("empty")}</p>
          ) : (
            <Table>
              <Table.ScrollContainer>
                <Table.Content
                  aria-label={t("choices.title")}
                  className="min-w-[800px]"
                >
                  <Table.Header>
                    <Table.Column id="name" isRowHeader>
                      {t("columns.name")}
                    </Table.Column>
                    <Table.Column id="key">{t("columns.key")}</Table.Column>
                    <Table.Column id="options">
                      {t("columns.options")}
                    </Table.Column>
                    <Table.Column id="status">{t("columns.status")}</Table.Column>
                    <Table.Column id="actions">
                      {t("columns.actions")}
                    </Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {filtered.map((item) => (
                      <Table.Row key={item.value} id={item.value}>
                        <Table.Cell>
                          <div className="flex flex-col gap-1">
                            <span>{item.name}</span>
                            {item.isSystem ? (
                              <Chip size="sm" variant="soft">
                                {t("system")}
                              </Chip>
                            ) : null}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <code className="text-xs">{item.value}</code>
                        </Table.Cell>
                        <Table.Cell>{item.options.length}</Table.Cell>
                        <Table.Cell>
                          <Chip
                            color={item.isActive ? "success" : "default"}
                            size="sm"
                            variant="soft"
                          >
                            {item.isActive ? t("active") : t("inactive")}
                          </Chip>
                        </Table.Cell>
                        <Table.Cell>
                          <div className={styles.actionsCell()}>
                            <Button
                              size="sm"
                              variant="tertiary"
                              onPress={() =>
                                navigate(routes.choiceEdit(item.value))
                              }
                            >
                              <Pencil1 size={16} />
                              {t("edit")}
                            </Button>
                            {!item.isSystem ? (
                              <Button
                                size="sm"
                                variant="danger"
                                onPress={() => setDeleteKey(item.value)}
                              >
                                <Trash2 size={16} />
                                {t("delete")}
                              </Button>
                            ) : null}
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
          isOpen={deleteKey != null}
          onOpenChange={(open) => {
            if (!open) setDeleteKey(null);
          }}
        >
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>
                  {t("choices.deleteTitle")}
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>{t("choices.deleteBody")}</p>
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
