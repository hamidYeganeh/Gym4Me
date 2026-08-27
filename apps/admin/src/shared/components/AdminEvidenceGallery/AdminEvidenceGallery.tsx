import { useEffect, useState } from "react";
import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { File1 } from "@repo/icons/File1";
import { mediaApi } from "@/shared/lib/api";
import { adminEvidenceGalleryVariants } from "./AdminEvidenceGallery.styles";
import type { AdminEvidenceGalleryProps } from "./AdminEvidenceGallery.types";

type EvidencePreview = {
  id: string;
  url: string | null;
  mimeType: string | null;
  status: "loading" | "ready" | "error";
};

function isImageMime(mimeType: string | null) {
  return Boolean(mimeType?.startsWith("image/"));
}

function isPdfMime(mimeType: string | null) {
  return mimeType === "application/pdf";
}

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
  const [previews, setPreviews] = useState<EvidencePreview[]>([]);
  const mediaKey = mediaIds.join("|");

  useEffect(() => {
    if (!mediaKey) {
      setPreviews([]);
      return;
    }

    const ids = mediaKey.split("|").filter(Boolean);
    let cancelled = false;
    const objectUrls: string[] = [];

    setPreviews(
      ids.map((id) => ({
        id,
        url: null,
        mimeType: null,
        status: "loading",
      })),
    );

    void Promise.all(
      ids.map(async (id) => {
        try {
          const blob = await mediaApi.download(id);
          const url = URL.createObjectURL(blob);
          objectUrls.push(url);
          if (cancelled) {
            URL.revokeObjectURL(url);
            return;
          }
          setPreviews((current) =>
            current.map((item) =>
              item.id === id
                ? {
                    id,
                    url,
                    mimeType: blob.type || null,
                    status: "ready",
                  }
                : item,
            ),
          );
        } catch {
          if (cancelled) return;
          setPreviews((current) =>
            current.map((item) =>
              item.id === id
                ? { id, url: null, mimeType: null, status: "error" }
                : item,
            ),
          );
        }
      }),
    );

    return () => {
      cancelled = true;
      for (const url of objectUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [mediaKey]);

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
          {previews.map((preview) => {
            const href = preview.url ?? mediaApi.fileUrl(preview.id);
            const showImage =
              preview.status === "ready" && isImageMime(preview.mimeType);
            const showPdf =
              preview.status === "ready" && isPdfMime(preview.mimeType);
            const openLabel = openDocumentLabel ?? "مشاهده فایل";

            return (
              <div key={preview.id} className={styles.frame()}>
                {preview.status === "loading" ? (
                  <span className={styles.fallback()}>
                    <Spinner size="sm" />
                  </span>
                ) : null}
                {showImage && preview.url ? (
                  <img
                    alt=""
                    className={styles.image()}
                    loading="lazy"
                    src={preview.url}
                  />
                ) : null}
                {showPdf && preview.url ? (
                  <iframe
                    className={styles.embed()}
                    src={`${preview.url}#toolbar=0&navpanes=0&scrollbar=0`}
                    title={openLabel}
                  />
                ) : null}
                {preview.status === "ready" &&
                !showImage &&
                !showPdf ? (
                  <span className={styles.fallback()}>
                    <File1 size={22} />
                    <span>{openLabel}</span>
                  </span>
                ) : null}
                {preview.status === "error" ? (
                  <span className={styles.fallback()}>
                    <File1 size={22} />
                    <span>{openLabel}</span>
                  </span>
                ) : null}
                <a
                  aria-label={openLabel}
                  className={styles.hitTarget()}
                  href={href}
                  rel="noreferrer"
                  target="_blank"
                />
              </div>
            );
          })}
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
