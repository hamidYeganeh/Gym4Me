import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertDialog,
  Button,
  Card,
  Chip,
  Input,
  Label,
  Spinner,
  Switch,
  Table,
  TextField,
  Typography,
} from "@heroui/react";
import { ApiError, type ChoiceGroup } from "@repo/api";
import { ArrowRotateClockwise1, Pencil1, Plus, Trash2 } from "@repo/icons";
import { useTranslations } from "next-intl";
import { adminBasics } from "@/shared/lib/api";
import { BasicsFormDrawer } from "../../components/BasicsFormDrawer";
import { basicsChoicesSectionVariants } from "./BasicsChoicesSection.styles";
import type {
  BasicsChoicesSectionProps,
  ChoiceOptionDraft,
} from "./BasicsChoicesSection.types";

function emptyOption(order: number): ChoiceOptionDraft {
  return { value: "", name: "", order, isActive: true };
}

export function BasicsChoicesSection({ search }: BasicsChoicesSectionProps) {
  const t = useTranslations("Admin.Basics");
  const styles = basicsChoicesSectionVariants();

  const [items, setItems] = useState<ChoiceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [options, setOptions] = useState<ChoiceOptionDraft[]>([emptyOption(0)]);
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

  const resetForm = () => {
    setEditingKey(null);
    setKey("");
    setName("");
    setDescription("");
    setIsActive(true);
    setOptions([emptyOption(0)]);
    setFormError(null);
  };

  const openCreate = () => {
    resetForm();
    setSheetOpen(true);
  };

  const openEdit = (group: ChoiceGroup) => {
    setEditingKey(group.value);
    setKey(group.value);
    setName(group.name);
    setDescription(group.description ?? "");
    setIsActive(group.isActive);
    setOptions(
      group.options.length > 0
        ? group.options.map((option, index) => ({
            value: option.value,
            name: option.name,
            order: option.order ?? index,
            isActive: option.isActive !== false,
          }))
        : [emptyOption(0)],
    );
    setFormError(null);
    setSheetOpen(true);
  };

  const updateOption = (
    index: number,
    patch: Partial<ChoiceOptionDraft>,
  ) => {
    setOptions((current) =>
      current.map((option, i) =>
        i === index ? { ...option, ...patch } : option,
      ),
    );
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!editingKey && !key.trim()) {
      setFormError(t("choices.errorKey"));
      return;
    }
    if (!name.trim()) {
      setFormError(t("choices.errorName"));
      return;
    }

    const normalizedOptions = options
      .map((option, index) => ({
        value: option.value.trim(),
        name: option.name.trim(),
        order: option.order ?? index,
        isActive: option.isActive,
      }))
      .filter((option) => option.value || option.name);

    if (
      normalizedOptions.length === 0 ||
      normalizedOptions.some((option) => !option.value || !option.name)
    ) {
      setFormError(t("choices.errorOptions"));
      return;
    }

    setSaving(true);
    try {
      if (editingKey) {
        await adminBasics.updateChoice(editingKey, {
          name: name.trim(),
          description: description.trim() || undefined,
          isActive,
          options: normalizedOptions,
        });
      } else {
        await adminBasics.createChoice({
          key: key.trim(),
          name: name.trim(),
          description: description.trim() || undefined,
          isActive,
          options: normalizedOptions,
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
                              onPress={() => openEdit(item)}
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
      <BasicsFormDrawer
        isOpen={sheetOpen}
        title={editingKey
                    ? t("choices.editTitle")
                    : t("choices.createTitle")}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) resetForm();
        }}
      >
        <form className={styles.form()} onSubmit={handleSave}>
                          {!editingKey ? (
                            <TextField isRequired name="key" value={key} onChange={setKey}>
                              <Label>{t("fields.key")}</Label>
                              <Input placeholder="gender" />
                            </TextField>
                          ) : (
                            <div>
                              <Typography type="body-sm" className="text-muted">
                                {t("fields.key")}
                              </Typography>
                              <code className="text-sm">{key}</code>
                            </div>
                          )}

                          <TextField isRequired name="name" value={name} onChange={setName}>
                            <Label>{t("fields.name")}</Label>
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

                          <Switch isSelected={isActive} onChange={setIsActive}>
                            <Switch.Content>
                              <Switch.Control>
                                <Switch.Thumb />
                              </Switch.Control>
                              {t("fields.isActive")}
                            </Switch.Content>
                          </Switch>

                          <div className={styles.optionsList()}>
                            <div className={styles.switchRow()}>
                              <Typography weight="semibold">{t("fields.options")}</Typography>
                              <Button
                                size="sm"
                                variant="outline"
                                onPress={() =>
                                  setOptions((current) => [
                                    ...current,
                                    emptyOption(current.length),
                                  ])
                                }
                              >
                                <Plus size={16} />
                                {t("choices.addOption")}
                              </Button>
                            </div>
                            {options.map((option, index) => (
                              <div key={index} className={styles.optionRow()}>
                                <TextField
                                  value={option.value}
                                  onChange={(value) =>
                                    updateOption(index, { value })
                                  }
                                >
                                  <Label>{t("fields.optionValue")}</Label>
                                  <Input />
                                </TextField>
                                <TextField
                                  value={option.name}
                                  onChange={(value) => updateOption(index, { name: value })}
                                >
                                  <Label>{t("fields.optionName")}</Label>
                                  <Input />
                                </TextField>
                                <div className="flex items-end gap-2">
                                  <Switch
                                    isSelected={option.isActive}
                                    onChange={(value) =>
                                      updateOption(index, { isActive: value })
                                    }
                                  >
                                    <Switch.Control>
                                      <Switch.Thumb />
                                    </Switch.Control>
                                  </Switch>
                                  {options.length > 1 ? (
                                    <Button
                                      isIconOnly
                                      size="lg"
                                      variant="ghost"
                                      aria-label={t("choices.removeOption")}
                                      onPress={() =>
                                        setOptions((current) =>
                                          current.filter((_, i) => i !== index),
                                        )
                                      }
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>

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
