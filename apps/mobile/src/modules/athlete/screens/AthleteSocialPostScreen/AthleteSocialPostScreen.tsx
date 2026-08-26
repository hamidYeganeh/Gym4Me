"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { Label } from "@heroui/react/label";
import { TextArea } from "@heroui/react/textarea";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { Bookmark } from "@repo/icons/Bookmark";
import { Flag1 } from "@repo/icons/Flag1";
import { Heart } from "@repo/icons/Heart";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import { athleteSocialPostScreenVariants } from "./AthleteSocialPostScreen.styles";
import type { AthleteSocialPostScreenProps } from "./AthleteSocialPostScreen.types";

export function AthleteSocialPostScreen({
  detail,
  pending = false,
  commentPending = false,
  onLike,
  onSave,
  onComment,
  onReport,
  className,
}: AthleteSocialPostScreenProps) {
  const t = useTranslations("AthleteSocial");
  const styles = athleteSocialPostScreenVariants();
  const router = useRouter();
  const [draft, setDraft] = useState("");

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.author()} type="h1" weight="bold">
            {detail.authorLabel}
          </Typography>
          <Typography className={styles.meta()} type="body-sm">
            {detail.createdLabel}
          </Typography>
          <Typography className={styles.body()} type="body">
            {detail.body}
          </Typography>
          {detail.mediaUrls.length > 0 ? (
            <div className={styles.mediaGrid()}>
              {detail.mediaUrls.map((url, index) => (
                <img
                  alt={t("postMediaAlt", { index: index + 1 })}
                  className={styles.mediaImage()}
                  key={url}
                  loading="lazy"
                  src={url}
                />
              ))}
            </div>
          ) : null}
          <div className={styles.actions()}>
            <Button
              isDisabled={pending}
              isIconOnly
              onPress={() => void onLike()}
              size="lg"
              variant="ghost"
            >
              <Heart
                className={detail.liked ? "text-danger" : "text-foreground"}
                size={20}
              />
            </Button>
            <Typography className={styles.meta()} type="body-sm">
              {toPersianDigits(detail.likeCount)}
            </Typography>
            <Button
              isDisabled={pending}
              isIconOnly
              onPress={() => void onSave()}
              size="lg"
              variant="ghost"
            >
              <Bookmark
                className={detail.saved ? "text-accent" : "text-foreground"}
                size={20}
              />
            </Button>
            {onReport ? (
              <Button
                isIconOnly
                onPress={() => void onReport()}
                size="lg"
                variant="ghost"
              >
                <Flag1 className="text-muted" size={18} />
              </Button>
            ) : null}
          </div>
        </section>

        <section className={styles.compose()}>
          <TextField>
            <Label>{t("commentLabel")}</Label>
            <TextArea
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t("commentPlaceholder")}
              rows={3}
              value={draft}
            />
          </TextField>
          <Button
            fullWidth
            isDisabled={commentPending || draft.trim().length === 0}
            onPress={() => {
              const body = draft.trim();
              if (!body) return;
              void onComment(body);
              setDraft("");
            }}
            variant="primary"
          >
            {t("sendComment")}
          </Button>
        </section>

        <section className="flex flex-col gap-3">
          <Typography className={styles.sectionTitle()} type="body-sm">
            {t("commentsTitle", {
              count: toPersianDigits(detail.comments.length),
            })}
          </Typography>
          {detail.comments.length === 0 ? (
            <div className={styles.empty()}>
              <Typography type="body" weight="semibold">
                {t("commentsEmptyTitle")}
              </Typography>
              <Typography className={styles.meta()} type="body-sm">
                {t("commentsEmptyBody")}
              </Typography>
            </div>
          ) : (
            <div className={styles.list()}>
              {detail.comments.map((comment) => (
                <article className={styles.commentCard()} key={comment.id}>
                  <Typography type="body" weight="semibold">
                    {comment.authorLabel}
                  </Typography>
                  <Typography type="body">{comment.body}</Typography>
                  <Typography className={styles.meta()} type="body-sm">
                    {comment.createdLabel}
                  </Typography>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
