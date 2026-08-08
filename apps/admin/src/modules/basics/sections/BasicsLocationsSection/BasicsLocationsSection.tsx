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
  TextArea,
  TextField,
  Typography,
} from "@heroui/react";
import { ApiError, type LocationNode } from "@repo/api";
import { ArrowRotateClockwise1, Pencil1, Plus, Trash2 } from "@repo/icons";
import { useTranslations } from "next-intl";
import { adminBasics } from "@/shared/lib/api";
import { BasicsFormDrawer } from "../../components/BasicsFormDrawer";
import { BasicsMediaField } from "../../components/BasicsMediaField";
import { LOCATION_PARENT_KIND } from "../../lib/basics-constants";
import { basicsLocationsSectionVariants } from "./BasicsLocationsSection.styles";
import type { BasicsLocationsSectionProps } from "./BasicsLocationsSection.types";

export function BasicsLocationsSection({
  search,
  kind,
}: BasicsLocationsSectionProps) {
  const t = useTranslations("Admin.Basics");
  const styles = basicsLocationsSectionVariants();

  const [parentId, setParentId] = useState<string | "">("");
  const [parents, setParents] = useState<LocationNode[]>([]);
  const [items, setItems] = useState<LocationNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<LocationNode | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [flagSvg, setFlagSvg] = useState("");
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [order, setOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [formParentId, setFormParentId] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const parentKind = LOCATION_PARENT_KIND[kind];
  const showCoordinates = kind !== "country";
  const showIcon = kind === "country";

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

  const parseCoordinates = () => {
    const latValue = lat.trim();
    const lngValue = lng.trim();
    if (!latValue && !lngValue) return null;
    const parsedLat = Number(latValue);
    const parsedLng = Number(lngValue);
    if (
      !Number.isFinite(parsedLat) ||
      !Number.isFinite(parsedLng) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      parsedLng < -180 ||
      parsedLng > 180
    ) {
      throw new Error(t("locations.errorCoordinates"));
    }
    return { lat: parsedLat, lng: parsedLng };
  };

  const resetForm = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setIcon("");
    setFlagSvg("");
    setCoverMediaId(null);
    setLat("");
    setLng("");
    setOrder("0");
    setIsActive(true);
    setFormParentId(parentId);
    setFormError(null);
  };

  const openCreate = () => {
    resetForm();
    setFormParentId(parentId);
    setSheetOpen(true);
  };

  const openEdit = (item: LocationNode) => {
    setEditing(item);
    setName(item.name);
    setSlug(item.slug);
    setDescription(item.description ?? "");
    setIcon(item.icon ?? "");
    setFlagSvg(item.flagSvg ?? "");
    setCoverMediaId(item.coverMediaId);
    setLat(
      item.coordinates != null ? String(item.coordinates.lat) : "",
    );
    setLng(
      item.coordinates != null ? String(item.coordinates.lng) : "",
    );
    setOrder(String(item.order ?? 0));
    setIsActive(item.isActive);
    setFormParentId(item.parentId ?? "");
    setFormError(null);
    setSheetOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError(t("locations.errorName"));
      return;
    }

    let center: { lat: number; lng: number } | null | undefined;
    try {
      center = showCoordinates ? parseCoordinates() : undefined;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("errorSave"));
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await adminBasics.updateLocation(editing.id, {
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          icon: showIcon ? icon.trim() || null : undefined,
          flagSvg: showIcon ? flagSvg.trim() || null : undefined,
          coverMediaId,
          center: showCoordinates ? center : undefined,
          order: Number(order) || 0,
          isActive,
        });
      } else {
        await adminBasics.createLocation({
          kind,
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          icon: showIcon ? icon.trim() || undefined : undefined,
          flagSvg: showIcon ? flagSvg.trim() || undefined : undefined,
          coverMediaId: coverMediaId || undefined,
          center: showCoordinates ? center ?? undefined : undefined,
          parentId: formParentId || undefined,
          order: Number(order) || 0,
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
        title={editing
                    ? t("locations.editTitle")
                    : t("locations.createTitle")}
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
                          <TextField name="slug" value={slug} onChange={setSlug}>
                            <Label>{t("fields.slug")}</Label>
                            <Input />
                          </TextField>
                          <TextField
                            name="description"
                            value={description}
                            onChange={setDescription}
                          >
                            <Label>{t("fields.description")}</Label>
                            <Input />
                          </TextField>
                          {showIcon ? (
                            <>
                              <TextField name="icon" value={icon} onChange={setIcon}>
                                <Label>{t("fields.icon")}</Label>
                                <Input placeholder={t("fields.iconHint")} />
                              </TextField>
                              <TextField
                                name="flagSvg"
                                value={flagSvg}
                                onChange={setFlagSvg}
                              >
                                <Label>{t("fields.flagSvg")}</Label>
                                <TextArea
                                  className="min-h-28 font-mono text-xs"
                                  placeholder={t("fields.flagSvgHint")}
                                />
                              </TextField>
                              {flagSvg.trim() ? (
                                <div
                                  aria-hidden
                                  className="inline-flex overflow-hidden rounded border border-border"
                                  dangerouslySetInnerHTML={{ __html: flagSvg }}
                                />
                              ) : null}
                            </>
                          ) : null}
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
                          {showCoordinates ? (
                            <div className={styles.formRow()}>
                              <TextField name="lat" value={lat} onChange={setLat}>
                                <Label>{t("fields.lat")}</Label>
                                <Input inputMode="decimal" placeholder="35.6892" />
                              </TextField>
                              <TextField name="lng" value={lng} onChange={setLng}>
                                <Label>{t("fields.lng")}</Label>
                                <Input inputMode="decimal" placeholder="51.3890" />
                              </TextField>
                            </div>
                          ) : null}
                          {!editing && parentKind ? (
                            <Select
                              value={formParentId || "none"}
                              onChange={(value: Key | Key[] | null) => {
                                const next = String(value ?? "none");
                                setFormParentId(next === "none" ? "" : next);
                              }}
                            >
                              <Label>{t("fields.parent")}</Label>
                              <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                              </Select.Trigger>
                              <Select.Popover>
                                <ListBox>
                                  <ListBox.Item
                                    id="none"
                                    textValue={t("locations.noParent")}
                                  >
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
                          ) : null}
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
                <AlertDialog.Heading>
                  {t("locations.deleteTitle")}
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>{t("locations.deleteBody")}</p>
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
