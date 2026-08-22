import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Key,
} from "react";
import { useNavigate } from "react-router-dom";
import { AlertDialog } from "@heroui/react/alert-dialog";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
import { Label } from "@heroui/react/label";
import { ListBox } from "@heroui/react/list-box";
import { Select } from "@heroui/react/select";
import { Spinner } from "@heroui/react/spinner";
import { Table } from "@heroui/react/table";
import { Typography } from "@heroui/react/typography";
import { ApiError, type LocationNode } from "@repo/api";
import { ArrowRotateClockwise1 } from "@repo/icons/ArrowRotateClockwise1";
import { CloudDownload1 } from "@repo/icons/CloudDownload1";
import { Pencil1 } from "@repo/icons/Pencil1";
import { Plus } from "@repo/icons/Plus";
import { Trash2 } from "@repo/icons/Trash2";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { adminBasics } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { LOCATION_PARENT_KIND } from "../../lib/basics-constants";
import { basicsLocationsSectionVariants } from "./BasicsLocationsSection.styles";
import type { BasicsLocationsSectionProps } from "./BasicsLocationsSection.types";

export function BasicsLocationsSection({
  search,
  kind,
}: BasicsLocationsSectionProps) {
  const t = useTranslations("Admin.Basics");
  const navigate = useNavigate();
  const styles = basicsLocationsSectionVariants();

  const [parentId, setParentId] = useState<string | "">("");
  const [parents, setParents] = useState<LocationNode[]>([]);
  const [items, setItems] = useState<LocationNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const parentKind = LOCATION_PARENT_KIND[kind];

  const loadParents = useCallback(async () => {
    if (!parentKind) {
      setParents([]);
      return;
    }
    try {
      const result = await adminBasics.listLocations({ kind: parentKind });
      setParents(result.result);
    } catch {
      setParents([]);
    }
  }, [parentKind]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminBasics.listLocations({
        kind,
        parentId: parentId || undefined,
      });
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
  }, [kind, parentId, t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void loadParents();
    });
    return () => {
      cancelled = true;
    };
  }, [loadParents]);

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
      await adminBasics.deleteLocation(deleteId);
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
      const result = await adminBasics.seedLocationDefaults();
      toast.success(
        t("importDefaultsDone", {
          created: result.created.length,
          updated: result.updated.length,
          skipped: result.skipped.length,
        }),
      );
      await loadParents();
      await load();
    } catch (err) {
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
            {t("locations.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("locations.subtitle")}
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
            onPress={() =>
              navigate(
                `${routes.locationNew(kind)}${parentId ? `?parentId=${parentId}` : ""}`,
              )
            }
          >
            <Plus size={18} />
            {t("create")}
          </Button>
        </div>
      </section>

      {parentKind ? (
        <div className={styles.toolbar()}>
          <div className={styles.filters()}>
            <Select
              className={styles.filter()}
              value={parentId || "all"}
              onChange={(value: Key | Key[] | null) => {
                const next = String(value ?? "all");
                setParentId(next === "all" ? "" : next);
              }}
            >
              <Label>{t("locations.filterParent")}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="all" textValue={t("locations.noParent")}>
                    {t("locations.noParent")}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  {parents.map((item) => (
                    <ListBox.Item
                      key={item.id}
                      id={item.id}
                      textValue={item.name}
                    >
                      {item.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        </div>
      ) : null}

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
                  aria-label={t("locations.title")}
                  className="min-w-[800px]"
                >
                  <Table.Header>
                    <Table.Column id="name" isRowHeader>
                      {t("columns.name")}
                    </Table.Column>
                    <Table.Column id="slug">{t("columns.slug")}</Table.Column>
                    <Table.Column id="kind">{t("columns.kind")}</Table.Column>
                    <Table.Column id="order">{t("columns.order")}</Table.Column>
                    <Table.Column id="status">{t("columns.status")}</Table.Column>
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
                        <Table.Cell>
                          {t(`locationKinds.${item.kind}`)}
                        </Table.Cell>
                        <Table.Cell>{item.order}</Table.Cell>
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
                                navigate(routes.locationEdit(kind, item.id))
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
                <AlertDialog.Heading>
                  {t("locations.deleteTitle")}
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <Typography>{t("locations.deleteBody")}</Typography>
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
