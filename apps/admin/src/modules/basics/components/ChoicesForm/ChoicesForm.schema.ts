import { z } from "zod";
import type { ChoiceGroup } from "@repo/api";

export type ChoicesFormMessages = {
  required: string;
  options: string;
};

export function createChoicesFormSchema(
  messages: ChoicesFormMessages,
  isEdit: boolean,
) {
  return z
    .object({
      key: z.string(),
      name: z.string().trim().min(1, messages.required),
      description: z.string(),
      isActive: z.boolean(),
      options: z.array(
        z.object({
          value: z.string(),
          name: z.string(),
          description: z.string(),
          order: z.number(),
          isActive: z.boolean(),
        }),
      ),
    })
    .superRefine((values, ctx) => {
      if (!isEdit && !values.key.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["key"],
          message: messages.required,
        });
      }
      const normalized = values.options
        .map((option) => ({
          value: option.value.trim(),
          name: option.name.trim(),
        }))
        .filter((option) => option.value || option.name);
      if (
        normalized.length === 0 ||
        normalized.some((option) => !option.value || !option.name)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message: messages.options,
        });
      }
    });
}

export type ChoicesFormValues = z.infer<
  ReturnType<typeof createChoicesFormSchema>
>;

export const emptyChoiceOption = (order: number) => ({
  value: "",
  name: "",
  description: "",
  order,
  isActive: true,
});

export const choicesFormDefaults: ChoicesFormValues = {
  key: "",
  name: "",
  description: "",
  isActive: true,
  options: [emptyChoiceOption(0)],
};

export function choiceToFormValues(item: ChoiceGroup): ChoicesFormValues {
  return {
    key: item.value,
    name: item.name,
    description: item.description ?? "",
    isActive: item.isActive !== false,
    options:
      item.options.length > 0
        ? item.options.map((option, index) => ({
            value: option.value,
            name: option.name,
            description: option.description ?? "",
            order: option.order ?? index,
            isActive: option.isActive !== false,
          }))
        : [emptyChoiceOption(0)],
  };
}

export function normalizedChoiceOptions(values: ChoicesFormValues) {
  return values.options
    .map((option, index) => ({
      value: option.value.trim(),
      name: option.name.trim(),
      ...(option.description.trim()
        ? { description: option.description.trim() }
        : {}),
      order: option.order ?? index,
      isActive: option.isActive,
    }))
    .filter((option) => option.value || option.name);
}
