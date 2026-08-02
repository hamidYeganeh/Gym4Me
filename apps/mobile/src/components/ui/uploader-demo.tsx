"use client";

import { useState } from "react";
import { FileItem } from "@repo/ui/kit/FileItem";
import {
  FileItemType,
  type FileItemTypeKind,
} from "@repo/ui/kit/FileItemType";
import { Uploader } from "@repo/ui/kit/Uploader";

export type UploaderDemoLabels = {
  uploaderLabel: string;
  fileItemLabel: string;
  fileItemTypeLabel: string;
  fileName: string;
  fileSize: string;
  successMessage: string;
  errorMessage: string;
  retryLabel: string;
};

const FILE_TYPES: FileItemTypeKind[] = [
  "PDF",
  "DOC",
  "XLS",
  "PPT",
  "CSS",
  "JPG",
  "PSD",
  "AI",
  "MP4",
  "MP3",
];

type DemoFile = {
  id: string;
  fileName: string;
  status: "uploading" | "success" | "error";
  progress: number;
  fileSize?: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}b`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}kb`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}mb`;
}

export function UploaderDemo({ labels }: { labels: UploaderDemoLabels }) {
  const [files, setFiles] = useState<DemoFile[]>([
    {
      id: "demo-uploading",
      fileName: labels.fileName,
      status: "uploading",
      progress: 52,
      fileSize: labels.fileSize,
    },
    {
      id: "demo-success",
      fileName: labels.fileName,
      status: "success",
      progress: 100,
    },
    {
      id: "demo-error",
      fileName: labels.fileName,
      status: "error",
      progress: 65,
    },
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full flex-col gap-3">
        <h3 className="text-sm font-medium text-muted">{labels.uploaderLabel}</h3>
        <Uploader
          onDropAccepted={(accepted) => {
            setFiles((prev) => [
              ...accepted.map((file) => ({
                id: `${file.name}-${file.lastModified}-${file.size}`,
                fileName: file.name,
                status: "uploading" as const,
                progress: 35,
                fileSize: formatBytes(file.size),
              })),
              ...prev,
            ]);
          }}
        />
      </div>

      <div className="flex w-full flex-col gap-3">
        <h3 className="text-sm font-medium text-muted">
          {labels.fileItemLabel}
        </h3>
        <div className="flex w-full flex-col gap-3">
          {files.map((file) => (
            <FileItem
              key={file.id}
              fileName={file.fileName}
              status={file.status}
              progress={file.progress}
              fileSize={file.fileSize}
              statusMessage={
                file.status === "success"
                  ? labels.successMessage
                  : file.status === "error"
                    ? labels.errorMessage
                    : undefined
              }
              retryLabel={labels.retryLabel}
              onRemove={() => {
                setFiles((prev) => prev.filter((item) => item.id !== file.id));
              }}
              onRetry={() => {
                setFiles((prev) =>
                  prev.map((item) =>
                    item.id === file.id
                      ? { ...item, status: "uploading", progress: 20 }
                      : item,
                  ),
                );
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <h3 className="text-sm font-medium text-muted">
          {labels.fileItemTypeLabel}
        </h3>
        <div className="flex flex-wrap items-end gap-4">
          {FILE_TYPES.map((type) => (
            <FileItemType key={type} type={type} size="md" />
          ))}
        </div>
      </div>
    </div>
  );
}
