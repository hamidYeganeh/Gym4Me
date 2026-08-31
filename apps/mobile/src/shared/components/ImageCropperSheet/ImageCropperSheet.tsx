"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Button } from "@heroui/react/button";
import { Drawer } from "@heroui/react/drawer";
import { Typography } from "@heroui/react/typography";
import { Minus } from "@repo/icons/Minus";
import { Plus } from "@repo/icons/Plus";
import { useTranslations } from "next-intl";
import { imageCropperSheetVariants } from "./ImageCropperSheet.styles";
import type { ImageCropperSheetProps } from "./ImageCropperSheet.types";

const CANVAS_WIDTH = 1000;

export function ImageCropperSheet({
  request,
  onCancel,
  onConfirm,
}: ImageCropperSheetProps) {
  const t = useTranslations("Mobile.ImageCropper");
  const styles = imageCropperSheetVariants();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [imageRevision, setImageRevision] = useState(0);
  const aspect = request?.aspect ?? 1;
  const canvasHeight = Math.round(CANVAS_WIDTH / aspect);

  useEffect(() => {
    if (!request) return;
    const url = URL.createObjectURL(request.file);
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setImageRevision((current) => current + 1);
    };
    image.src = url;
    return () => {
      URL.revokeObjectURL(url);
      imageRef.current = null;
    };
  }, [request]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const baseScale = Math.max(
      CANVAS_WIDTH / image.naturalWidth,
      canvasHeight / image.naturalHeight,
    );
    const scale = baseScale * zoom;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const maxX = Math.max(0, (width - CANVAS_WIDTH) / 2);
    const maxY = Math.max(0, (height - canvasHeight) / 2);
    const x =
      (CANVAS_WIDTH - width) / 2 + Math.max(-maxX, Math.min(maxX, pan.x));
    const y =
      (canvasHeight - height) / 2 + Math.max(-maxY, Math.min(maxY, pan.y));
    context.clearRect(0, 0, CANVAS_WIDTH, canvasHeight);
    context.drawImage(image, x, y, width, height);
  }, [canvasHeight, imageRevision, pan, request, zoom]);

  const startDrag = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY };
  };

  const moveDrag = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const previous = dragRef.current;
    if (!previous) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = CANVAS_WIDTH / rect.width;
    setPan((current) => ({
      x: current.x + (event.clientX - previous.x) * ratio,
      y: current.y + (event.clientY - previous.y) * ratio,
    }));
    dragRef.current = { x: event.clientX, y: event.clientY };
  };

  const confirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !request) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const baseName = request.file.name.replace(/\.[^.]+$/, "") || "image";
        onConfirm(
          new File([blob], `${baseName}-cropped.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          }),
        );
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    <Drawer.Backdrop
      isOpen={request != null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <Drawer.Content placement="bottom">
        <Drawer.Dialog className={styles.dialog()}>
          <Drawer.Handle />
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>{t("title")}</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body className={styles.body()}>
            <div
              className={styles.canvasWrap()}
              style={{ aspectRatio: String(aspect) }}
            >
              <canvas
                aria-label={t("canvasLabel")}
                className={styles.canvas()}
                height={canvasHeight}
                ref={canvasRef}
                width={CANVAS_WIDTH}
                onPointerCancel={() => {
                  dragRef.current = null;
                }}
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={() => {
                  dragRef.current = null;
                }}
              />
              <div className={styles.grid()} />
            </div>
            <Typography className={styles.hint()} type="body-sm">
              {t("hint")}
            </Typography>
            <div className={styles.zoomRow()}>
              <Minus aria-hidden size={18} />
              <input
                aria-label={t("zoom")}
                className={styles.range()}
                max="3"
                min="1"
                step="0.01"
                type="range"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
              <Plus aria-hidden size={18} />
            </div>
          </Drawer.Body>
          <Drawer.Footer className={styles.footer()}>
            <Button fullWidth variant="secondary" onPress={onCancel} size="lg">
              {t("cancel")}
            </Button>
            <Button fullWidth variant="primary" onPress={confirm} size="lg">
              {t("apply")}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
