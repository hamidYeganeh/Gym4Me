import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertDialog } from "@heroui/react/alert-dialog";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
import { Spinner } from "@heroui/react/spinner";
import { Table } from "@heroui/react/table";
import { Typography } from "@heroui/react/typography";
import { ApiError, type ChoiceGroup } from "@repo/api";
import { ArrowRotateClockwise1 } from "@repo/icons/ArrowRotateClockwise1";
import { CloudDownload1 } from "@repo/icons/CloudDownload1";
import { Pencil1 } from "@repo/icons/Pencil1";
import { Plus } from "@repo/icons/Plus";
import { Trash2 } from "@repo/icons/Trash2";
import { toast } from "@repo/ui/kit/Toast";
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
  const [seeding, setSeeding] = useState(false);
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

  const handleSeedDefaults = async () => {
    setSeeding(true);
    setError(null);
    try {
      const result = await adminBasics.seedChoiceDefaults();
      toast.success(
        t("importDefaultsDone", {
          created: result.created.length,
          updated: result.updated.length,
          skipped: result.skipped.length,
        }),
      );
      await load();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message || t("importDefaultsError")
          : t("importDefaultsError");
      setError(message);
      toast.error(message);
    } finally {
      setSeeding(false);
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
          <Button variant="primary" onPress={() => navigate(routes.choicesNew)}>
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
                <Typography>{t("choices.deleteBody")}</Typography>
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
