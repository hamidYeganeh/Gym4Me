import { Button, Typography } from "@heroui/react";
import { mediaApi } from "@/shared/lib/api";
import { adminEvidenceGalleryVariants } from "./AdminEvidenceGallery.styles";
import type { AdminEvidenceGalleryProps } from "./AdminEvidenceGallery.types";

export function AdminEvidenceGallery({
  label,
  emptyLabel,
  mediaIds = [],
  openDocumentLabel,
  onOpenDocument,
  documentPending,
  className,
}: AdminEvidenceGalleryProps) {
  const styles = adminEvidenceGalleryVariants();
  const hasMedia = mediaIds.length > 0;
  const hasDocAction = Boolean(onOpenDocument);

  if (!hasMedia && !hasDocAction) {
    return (
      <div className={styles.root({ className })}>
        <Typography className={styles.label()}>{label}</Typography>
        <Typography className={styles.empty()}>{emptyLabel}</Typography>
      </div>
    );
  }

  return (
    <div className={styles.root({ className })}>
      <Typography className={styles.label()}>{label}</Typography>
      {hasMedia ? (
        <div className={styles.grid()}>
          {mediaIds.map((id) => (
            <a
              key={id}
              className={styles.frame()}
              href={mediaApi.fileUrl(id)}
              rel="noreferrer"
              target="_blank"
            >
              <img
                alt=""
                className={styles.image()}
                loading="lazy"
                src={mediaApi.fileUrl(id)}
              />
            </a>
          ))}
        </div>
      ) : null}
      {hasDocAction && openDocumentLabel ? (
        <Button
          isPending={documentPending}
          size="sm"
          variant="secondary"
          onPress={onOpenDocument}
        >
          {openDocumentLabel}
        </Button>
      ) : null}
    </div>
  );
}
