import type { CoachProgramEditorDetail } from "../../lib/coach-program-editor-data";

export type CoachProgramEditorScreenProps = {
  program: CoachProgramEditorDetail;
  mode: "view" | "edit";
  publishing?: boolean;
  onPublish?: () => void | Promise<void>;
  onAddExercise?: (sessionId: string) => void | Promise<void>;
};
