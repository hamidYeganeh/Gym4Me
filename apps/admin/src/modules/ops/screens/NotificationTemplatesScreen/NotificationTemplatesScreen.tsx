import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Label,
  TextArea,
  TextField,
  Typography,
} from "@heroui/react";
import type {
  NotificationChannelSetting,
  NotificationSmsSetting,
  NotificationTemplate,
} from "@repo/api";
import { ApiError } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminDataTable,
  AdminFormDrawer,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminNotificationTemplates } from "@/shared/lib/api";
import { notificationTemplatesScreenVariants } from "./NotificationTemplatesScreen.styles";
import type { NotificationTemplatesScreenProps } from "./NotificationTemplatesScreen.types";

const CHANNEL_OPTIONS: NotificationChannelSetting[] = ["enabled", "disabled"];
const SMS_OPTIONS: NotificationSmsSetting[] = [
  "disabled",
  "otp",
  "transactional",
];

const columnHelper = createColumnHelper<NotificationTemplate>();

type TemplateTableMeta = {
  actionsClassName: string;
  onEdit: (row: NotificationTemplate) => void;
};

export function NotificationTemplatesScreen({
  className,
}: NotificationTemplatesScreenProps) {
  const t = useTranslations("Admin.Ops");
  const styles = notificationTemplatesScreenVariants();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [smsTemplateKey, setSmsTemplateKey] = useState("");
  const [push, setPush] = useState<NotificationChannelSetting>("enabled");
  const [inbox, setInbox] = useState<NotificationChannelSetting>("enabled");
  const [sms, setSms] = useState<NotificationSmsSetting>("disabled");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const queryKey = useMemo(() => JSON.stringify({ search }), [search]);

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      const response = await adminNotificationTemplates.list({
        search: search.trim() || undefined,
      });
      return {
        result: response.items,
        pagination: {
          page,
          page_size: pageSize,
          next: null,
          prev: null,
          total: response.items.length,
        },
      };
    },
    [search],
  );

  const { items, loading, error, reload } =
    useAdminInfiniteQuery<NotificationTemplate>({
      queryKey,
      pageSize: 500,
      errorFallback: t("templates.errorLoad"),
      fetchPage,
    });

  const openEdit = (row: NotificationTemplate) => {
    setEditing(row);
    setTitle(row.title);
    setBody(row.body);
    setSmsTemplateKey(row.smsTemplateKey ?? "");
    setPush(row.channels.push);
    setInbox(row.channels.inbox);
    setSms(row.channels.sms);
    setSaveError(null);
  };

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("key", {
          header: t("templates.columns.key"),
          cell: ({ getValue }) => (
            <span className="block max-w-56 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("title", {
          header: t("templates.columns.title"),
          cell: ({ getValue }) => (
            <span className="block max-w-56 truncate">{getValue()}</span>
          ),
        }),
        columnHelper.accessor((row) => row.channels.push, {
          id: "push",
          header: t("templates.columns.push"),
          cell: ({ getValue }) => (
            <Chip
              color={getValue() === "enabled" ? "success" : "warning"}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{getValue()}</Chip.Label>
            </Chip>
          ),
        }),
        columnHelper.accessor((row) => row.channels.sms, {
          id: "sms",
          header: t("templates.columns.sms"),
          cell: ({ getValue }) => (
            <Chip
              color={getValue() === "disabled" ? "warning" : "success"}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{getValue()}</Chip.Label>
            </Chip>
          ),
        }),
        columnHelper.accessor((row) => row.channels.inbox, {
          id: "inbox",
          header: t("templates.columns.inbox"),
          cell: ({ getValue }) => (
            <Chip
              color={getValue() === "enabled" ? "success" : "warning"}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{getValue()}</Chip.Label>
            </Chip>
          ),
        }),
        columnHelper.accessor("status", {
          header: t("templates.columns.status"),
        }),
        columnHelper.display({
          id: "actions",
          header: t("templates.columns.actions"),
          size: 110,
          cell: (info) => {
            const meta = info.table.options.meta as
              | TemplateTableMeta
              | undefined;
            if (!meta) return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(info.row.original)}
                >
                  {t("templates.editTitle")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<NotificationTemplate, unknown>[],
    [t],
  );

  const meta: TemplateTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: openEdit,
  };

  const handleSave = async () => {
    if (!editing || !title.trim() || !body.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await adminNotificationTemplates.update(editing.key, {
        title: title.trim(),
        body: body.trim(),
        smsTemplateKey: smsTemplateKey.trim() || undefined,
        channels: { push, inbox, sms },
      });
      setEditing(null);
      void reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      activeNavId="ops"
      className={className}
      opsSection={{
        activeTabId: "templates",
        searchValue: search,
        onSearchChange: setSearch,
      }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("templates.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("templates.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            <Button onPress={() => void reload()} variant="outline">
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("templates.title")}
          columns={columns}
          data={items}
          emptyLabel={t("templates.empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={false}
          isFetchingMore={false}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          onLoadMore={() => {}}
          summaryLabel={t("templates.summary", {
            loaded: items.length,
          })}
        />
      </div>

      <AdminFormDrawer
        isOpen={Boolean(editing)}
        title={t("templates.editTitle")}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <div className={styles.form()}>
          <TextField
            className={styles.field()}
            fullWidth
            name="title"
            value={title}
            onChange={setTitle}
          >
            <Label>{t("templates.fields.title")}</Label>
            <Input />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="body"
            value={body}
            onChange={setBody}
          >
            <Label>{t("templates.fields.body")}</Label>
            <TextArea className="min-h-28" />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="smsTemplateKey"
            value={smsTemplateKey}
            onChange={setSmsTemplateKey}
          >
            <Label>{t("templates.fields.smsTemplateKey")}</Label>
            <Input dir="ltr" />
          </TextField>

          <div className={styles.field()}>
            <Label>{t("templates.fields.push")}</Label>
            <div className={styles.chips()}>
              {CHANNEL_OPTIONS.map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={push === option ? "primary" : "secondary"}
                  onPress={() => setPush(option)}
                >
                  {t(`templates.channelOptions.${option}`)}
                </Button>
              ))}
            </div>
          </div>

          <div className={styles.field()}>
            <Label>{t("templates.fields.inbox")}</Label>
            <div className={styles.chips()}>
              {CHANNEL_OPTIONS.map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={inbox === option ? "primary" : "secondary"}
                  onPress={() => setInbox(option)}
                >
                  {t(`templates.channelOptions.${option}`)}
                </Button>
              ))}
            </div>
          </div>

          <div className={styles.field()}>
            <Label>{t("templates.fields.sms")}</Label>
            <div className={styles.chips()}>
              {SMS_OPTIONS.map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={sms === option ? "primary" : "secondary"}
                  onPress={() => setSms(option)}
                >
                  {t(`templates.smsOptions.${option}`)}
                </Button>
              ))}
            </div>
          </div>

          {saveError ? (
            <p className="text-sm text-danger" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={saving || !title.trim() || !body.trim()}
              variant="primary"
              onPress={() => void handleSave()}
            >
              {t("save")}
            </Button>
            <Button
              isDisabled={saving}
              variant="secondary"
              onPress={() => setEditing(null)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>
    </AdminShell>
  );
}
