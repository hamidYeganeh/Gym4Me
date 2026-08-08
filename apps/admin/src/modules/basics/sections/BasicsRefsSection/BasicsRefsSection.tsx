import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type Key,
} from "react";
import {
  AlertDialog,
  Button,
  Card,
  Chip,
  Input,
  Label,
  ListBox,
  Select,
  Spinner,
  Switch,
  Table,
  TextField,
  Typography,
} from "@heroui/react";
import { ApiError, type RefItem, type RefStatus } from "@repo/api";
import { ArrowRotateClockwise1, Pencil1, Plus, Trash2 } from "@repo/icons";
import { useTranslations } from "next-intl";
import { adminBasics } from "@/shared/lib/api";
import { BasicsFormDrawer } from "../../components/BasicsFormDrawer";
import { BasicsMediaField } from "../../components/BasicsMediaField";
import { basicsRefsSectionVariants } from "./BasicsRefsSection.styles";
import type { BasicsRefsSectionProps } from "./BasicsRefsSection.types";

const REF_STATUSES: RefStatus[] = ["approved", "pending"];

export function BasicsRefsSection({ search, type }: BasicsRefsSectionProps) {
  const t = useTranslations("Admin.Basics");
  const styles = basicsRefsSectionVariants();

  const [items, setItems] = useState<RefItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<RefItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [order, setOrder] = useState("0");
  const [status, setStatus] = useState<RefStatus>("approved");
  const [isActive, setIsActive] = useState(true);
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

  const resetForm = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setIcon("");
    setCoverMediaId(null);
    setOrder("0");
    setStatus("approved");
    setIsActive(true);
    setFormError(null);
  };

  const openCreate = () => {
    resetForm();
    setSheetOpen(true);
  };

  const openEdit = (item: RefItem) => {
    setEditing(item);
    setName(item.name);
    setSlug(item.slug);
    setDescription(item.description ?? "");
    setIcon(item.icon ?? "");
    setCoverMediaId(item.coverMediaId);
    setOrder(String(item.order ?? 0));
    setStatus(item.status);
    setIsActive(item.isActive);
    setFormError(null);
    setSheetOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError(t("refs.errorName"));
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await adminBasics.updateRef(type, editing.id, {
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          icon: icon.trim() || null,
          coverMediaId,
          order: Number(order) || 0,
          status,
          isActive,
        });
      } else {
        await adminBasics.createRef(type, {
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
          coverMediaId: coverMediaId || undefined,
          order: Number(order) || 0,
          status,
          isActive,
        });
      }
      setSheetOpen(false);
      resetForm();
      await load();
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message || t("errorSave")
          : t("errorSave"),
      );
    } finally {
      setSaving(false);
    }
  };

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
          <Button variant="primary" onPress={openCreate}>
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
                              onPress={() => openEdit(item)}
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
      <BasicsFormDrawer
        isOpen={sheetOpen}
        title={editing ? t("refs.editTitle") : t("refs.createTitle")}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) resetForm();
        }}
      >
        <form className={styles.form()} onSubmit={handleSave}>
                          <TextField isRequired name="name" value={name} onChange={setName}>
                            <Label>{t("fields.name")}</Label>
                            <Input />
                          </TextField>
                          <div className={styles.formRow()}>
                            <TextField name="slug" value={slug} onChange={setSlug}>
                              <Label>{t("fields.slug")}</Label>
                              <Input />
                            </TextField>
                            <TextField name="icon" value={icon} onChange={setIcon}>
                              <Label>{t("fields.icon")}</Label>
                              <Input />
                            </TextField>
                          </div>
                          <TextField
                            name="description"
                            value={description}
                            onChange={setDescription}
                          >
                            <Label>{t("fields.description")}</Label>
                            <Input />
                          </TextField>
                          <BasicsMediaField
                            key={editing?.id ?? "create"}
                            disabled={saving}
                            errorMessage={t("media.error")}
                            hint={t("fields.mediaHint")}
                            label={t("fields.media")}
                            removeLabel={t("media.remove")}
                            retryLabel={t("media.retry")}
                            successMessage={t("media.success")}
                            uploaderButtonLabel={t("media.uploaderButton")}
                            uploaderDescription={t("media.uploaderDescription")}
                            uploaderTitle={t("media.uploaderTitle")}
                            value={coverMediaId}
                            onChange={setCoverMediaId}
                          />
                          <Select
                            value={status}
                            onChange={(value: Key | Key[] | null) => {
                              setStatus(String(value ?? "approved") as RefStatus);
                            }}
                          >
                            <Label>{t("fields.status")}</Label>
                            <Select.Trigger>
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                {REF_STATUSES.map((item) => (
                                  <ListBox.Item
                                    key={item}
                                    id={item}
                                    textValue={t(`refStatuses.${item}`)}
                                  >
                                    {t(`refStatuses.${item}`)}
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                ))}
                              </ListBox>
                            </Select.Popover>
                          </Select>
                          <TextField name="order" value={order} onChange={setOrder}>
                            <Label>{t("fields.order")}</Label>
                            <Input type="number" />
                          </TextField>
                          <Switch isSelected={isActive} onChange={setIsActive}>
                            <Switch.Content>
                              <Switch.Control>
                                <Switch.Thumb />
                              </Switch.Control>
                              {t("fields.isActive")}
                            </Switch.Content>
                          </Switch>
                          {formError ? (
                            <p className={styles.formError()}>{formError}</p>
                          ) : null}
                          <div className={styles.introActions()}>
                            <Button
                              slot="close"
                              type="button"
                              variant="tertiary"
                              onPress={() => {
                                setSheetOpen(false);
                                resetForm();
                              }}
                            >
                              {t("cancel")}
                            </Button>
                            <Button isPending={saving} type="submit" variant="primary">
                              {t("save")}
                            </Button>
                          </div>
                        </form>
      </BasicsFormDrawer>

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
                <p>{t("refs.deleteBody")}</p>
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
