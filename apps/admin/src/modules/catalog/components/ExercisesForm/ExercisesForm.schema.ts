import { z } from "zod";
import type { Exercise } from "@repo/api";

export type ExercisesFormMessages = { required: string };

export function createExercisesFormSchema(messages: ExercisesFormMessages) {
  return z.object({
    name: z.string().trim().min(1, messages.required),
    description: z.string(),
  });
}

export type ExercisesFormValues = z.infer<
  ReturnType<typeof createExercisesFormSchema>
>;

export const exercisesFormDefaults: ExercisesFormValues = {
  name: "",
  description: "",
};

export function exerciseToFormValues(item: Exercise): ExercisesFormValues {
  return { name: item.name, description: item.description ?? "" };
}
