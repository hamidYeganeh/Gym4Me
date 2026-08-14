"use client";

import { Spinner } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachVideoFeedbackScreen } from "../screens/CoachVideoFeedbackScreen";
import {
  COACH_VIDEO_SUBMISSIONS,
  type CoachVideoSubmission,
} from "./coach-video-feedback-data";

export function CoachVideoFeedbackGate() {
  const { isReady } = useAuth();
  const [submissions, setSubmissions] = useState<CoachVideoSubmission[] | null>(
    null,
  );
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    setSubmissions(COACH_VIDEO_SUBMISSIONS);
  }, [isReady]);

  const onSubmitReview = useCallback(
    async (submissionId: string, note: string) => {
      setReviewingId(submissionId);
      try {
        setSubmissions((current) =>
          (current ?? []).map((submission) =>
            submission.id === submissionId
              ? {
                  ...submission,
                  status: "reviewed" as const,
                  reviewNote: note,
                }
              : submission,
          ),
        );
      } finally {
        setReviewingId(null);
      }
    },
    [],
  );

  if (!submissions) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <CoachVideoFeedbackScreen
      onSubmitReview={onSubmitReview}
      reviewingId={reviewingId}
      submissions={submissions}
    />
  );
}
