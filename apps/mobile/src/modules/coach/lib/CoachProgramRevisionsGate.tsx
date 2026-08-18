"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { useEffect, useState } from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachProgramRevisionsScreen } from "../screens/CoachProgramRevisionsScreen";
import { getCoachProgramEditorDetail } from "./coach-program-editor-data";
import {
  getCoachProgramRevisions,
  type CoachProgramRevision,
} from "./coach-program-revisions-data";

export function CoachProgramRevisionsGate({
  programId,
}: {
  programId: string;
}) {
  const { isReady } = useAuth();
  const [revisions, setRevisions] = useState<CoachProgramRevision[] | null>(
    null,
  );
  const [programTitle, setProgramTitle] = useState<string>("");

  useEffect(() => {
    if (!isReady) return;
    const program = getCoachProgramEditorDetail(programId);
    if (!program) {
      setProgramTitle("");
      setRevisions([]);
      return;
    }
    setProgramTitle(program.title);
    setRevisions(getCoachProgramRevisions(programId));
  }, [isReady, programId]);

  if (!revisions) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!programTitle) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
        <Typography className="text-muted" type="body">
          برنامه پیدا نشد.
        </Typography>
      </div>
    );
  }

  return (
    <CoachProgramRevisionsScreen
      programId={programId}
      programTitle={programTitle}
      revisions={revisions}
    />
  );
}
