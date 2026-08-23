"use client";

import { useCallback, useState } from "react";
import { AthleteHealthAssessmentScreen } from "../screens/AthleteHealthAssessmentScreen";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import {
  DEFAULT_HEALTH_ASSESSMENT,
  HEALTH_ASSESSMENT_QUESTIONS,
  type HealthAssessmentAnswer,
  type HealthAssessmentState,
} from "./health-assessment-data";

export function AthleteHealthAssessmentGate() {
  const [state, setState] = useState<HealthAssessmentState>(
    DEMO_MODE
      ? DEFAULT_HEALTH_ASSESSMENT
      : {
          status: "unsubmitted",
          answers: Object.fromEntries(
            HEALTH_ASSESSMENT_QUESTIONS.map((question) => [question.id, null]),
          ),
        },
  );
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onAnswer = useCallback(
    (questionId: string, answer: HealthAssessmentAnswer) => {
      setState((current) => ({
        ...current,
        status:
          current.status === "unsubmitted" ? "in_progress" : current.status,
        answers: { ...current.answers, [questionId]: answer },
      }));
    },
    [],
  );

  const onSubmit = useCallback(async () => {
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      if (!DEMO_MODE) {
        setError("ذخیره پرسشنامه هنوز به سرویس حساب متصل نشده است.");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
      const unanswered = HEALTH_ASSESSMENT_QUESTIONS.some(
        (question) => state.answers[question.id] == null,
      );
      if (unanswered) {
        setError("لطفاً به همه سؤالات پاسخ دهید.");
        return;
      }
      setState((current) => ({ ...current, status: "submitted" }));
      setMessage("پرسشنامه با موفقیت ارسال شد.");
    } finally {
      setPending(false);
    }
  }, [state.answers]);

  return (
    <AthleteHealthAssessmentScreen
      answers={state.answers}
      error={error}
      message={message}
      onAnswer={onAnswer}
      onSubmit={onSubmit}
      pending={pending}
      questions={HEALTH_ASSESSMENT_QUESTIONS}
      status={state.status}
    />
  );
}
