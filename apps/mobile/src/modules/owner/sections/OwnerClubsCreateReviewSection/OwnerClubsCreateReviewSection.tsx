"use client";

import { useState } from "react";
import { Button, Typography } from "@heroui/react";
import { FileItem, type FileItemStatus } from "@repo/ui/kit/FileItem";
import { Uploader } from "@repo/ui/kit/Uploader";
import { useTranslations } from "next-intl";
import { mediaFileUrl } from "@/shared/lib/api";
import { ownerClubsCreateReviewSectionVariants } from "./OwnerClubsCreateReviewSection.styles";
import type { OwnerClubsCreateReviewSectionProps } from "./OwnerClubsCreateReviewSection.types";

const DOC_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
} as const;

type DocUploadState = {
  fileName: string;
  fileSize: string;
  status: FileItemStatus;
  progress: number;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function OwnerClubsCreateReviewSection({
  sections,
  clubStatus,
  canSubmitDocuments,
  isPending,
  isSubmitting,
  onSaveDraft,
  onSubmitDocument,
  className,
}: OwnerClubsCreateReviewSectionProps) {
  const t = useTranslations("Mobile.ClubCreate");
  const styles = ownerClubsCreateReviewSectionVariants();
  const [docUpload, setDocUpload] = useState<DocUploadState | null>(null);

  return (
    <section className={styles.root({ className })}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="bold">
          {t("stepReview")}
        </Typography>
        <Typography className={styles.hint()} type="body-sm">
          {t("stepReviewHint")}
        </Typography>
      </div>

      {clubStatus ? (
        <div className={styles.status()} role="status">
          {clubStatus}
        </div>
      ) : null}

      <div className={styles.sections()}>
        {sections.map((section) => {
          const hasFields = Boolean(section.fields?.length);
          const hasChips = Boolean(section.chips?.length);
          const hasList = Boolean(section.list?.length);
          const hasMedia = Boolean(section.media?.length);
          const hasHours = Boolean(section.hourGroups?.length);
          const isEmpty =
            !hasFields && !hasChips && !hasList && !hasMedia && !hasHours;

          return (
            <div className={styles.block()} key={section.key}>
              <Typography
                className={styles.blockTitle()}
                type="body"
                weight="semibold"
              >
                {section.title}
              </Typography>

              {isEmpty ? (
                <Typography className={styles.empty()} type="body-sm">
                  {section.emptyLabel ?? t("notProvided")}
                </Typography>
              ) : null}

              {hasFields ? (
                <div className={styles.fields()}>
                  {section.fields!.map((field, index) => (
                    <div key={field.key}>
                      <div className={styles.reviewRow()}>
                        <span className={styles.reviewLabel()}>
                          {field.label}
                        </span>
                        <span className={styles.reviewValue()}>
                          {field.value || t("notProvided")}
                        </span>
                      </div>
                      {index < section.fields!.length - 1 ? (
                        <div aria-hidden className={styles.reviewDivider()} />
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {hasChips ? (
                <div className={styles.chips()}>
                  {section.chips!.map((chip) => (
                    <span className={styles.chip()} key={chip}>
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}

              {hasList ? (
                <div className={styles.list()}>
                  {section.list!.map((item) => (
                    <div className={styles.listItem()} key={item.key}>
                      <span className={styles.listPrimary()}>
                        {item.primary}
                      </span>
                      {item.secondary ? (
                        <span className={styles.listSecondary()} dir="ltr">
                          {item.secondary}
                        </span>
                      ) : null}
                      {item.meta ? (
                        <span className={styles.listMeta()}>{item.meta}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {hasMedia ? (
                <div className={styles.mediaGrid()}>
                  {section.media!.map((item) => {
                    const url = mediaFileUrl(item.mediaId);
                    return (
                      <div className={styles.mediaCard()} key={item.key}>
                        {url ? (
                          <img
                            alt={item.label || item.fileName}
                            className={styles.mediaImage()}
                            src={url}
                          />
                        ) : null}
                        <p className={styles.mediaCaption()}>
                          {item.label
                            ? `${item.label}: ${item.fileName}`
                            : item.fileName}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {hasHours
                ? section.hourGroups!.map((group) => (
                    <div className={styles.hourGroup()} key={group.key}>
                      <Typography
                        className={styles.hourGroupTitle()}
                        type="body-sm"
                        weight="semibold"
                      >
                        {group.title}
                      </Typography>
                      <div className={styles.fields()}>
                        {group.rows.map((row, index) => (
                          <div key={row.key}>
                            <div className={styles.reviewRow()}>
                              <span className={styles.reviewLabel()}>
                                {row.day}
                              </span>
                              <span className={styles.reviewValue()} dir="ltr">
                                {row.value}
                              </span>
                            </div>
                            {index < group.rows.length - 1 ? (
                              <div
                                aria-hidden
                                className={styles.reviewDivider()}
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                : null}
            </div>
          );
        })}
      </div>

      <Button
        fullWidth
        isPending={isPending}
        size="lg"
        variant="primary"
        onPress={onSaveDraft}
      >
        {t("save")}
      </Button>

      {canSubmitDocuments ? (
        <div className={styles.upload()}>
          <Typography type="body" weight="semibold">
            {t("submit")}
          </Typography>
          <Typography className={styles.hint()} type="body-sm">
            {t("uploadHint")}
          </Typography>
          {!docUpload || docUpload.status === "error" ? (
            <Uploader
              accept={DOC_ACCEPT}
              buttonLabel={t("uploaderButton")}
              description={t("uploaderDescription")}
              disabled={isSubmitting}
              maxFiles={1}
              multiple={false}
              title={t("uploaderTitle")}
              onDropAccepted={(files) => {
                const file = files[0];
                if (!file) return;
                setDocUpload({
                  fileName: file.name,
                  fileSize: formatBytes(file.size),
                  status: "uploading",
                  progress: 40,
                });
                onSubmitDocument(file);
              }}
            />
          ) : null}
          {docUpload ? (
            <FileItem
              fileName={docUpload.fileName}
              fileSize={docUpload.fileSize}
              progress={isSubmitting ? 60 : 100}
              status={isSubmitting ? "uploading" : "success"}
              statusMessage={isSubmitting ? undefined : t("uploadSuccess")}
              onRemove={() => setDocUpload(null)}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
