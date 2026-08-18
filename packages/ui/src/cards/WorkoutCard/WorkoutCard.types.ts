import type { ButtonProps } from "@heroui/react/button";
import type { CardProps } from "@heroui/react/card";
import type { ReactNode } from "react";

export type WorkoutCardProps = Omit<
  CardProps,
  "children" | "title" | "variant"
> & {
  /**
   * Cover image — a URL string or a custom React node (e.g. `next/image`).
   */
  image: string | ReactNode;
  /** Accessible alt text when `image` is a URL string. */
  imageAlt?: string;
  /** Category chip label (e.g. "Upper Body"). */
  category: ReactNode;
  /** Workout title (e.g. "Insane Pullups"). */
  title: ReactNode;
  /** Sets meta line (e.g. "10 sets"). */
  sets: ReactNode;
  /** Duration meta line (e.g. "80min"). */
  duration: ReactNode;
  /** Accessible label for the play button. */
  playLabel: string;
  /** Called when the play control is pressed. */
  onPlay?: ButtonProps["onPress"];
  /** Extra classes for the cover image layer. */
  imageClassName?: string;
};
