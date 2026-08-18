import { Typography } from "@heroui/react/typography";
import { headerVariants } from "./Header.styles";
import type { HeaderProps } from "./Header.types";

export function Header({
  title,
  startContent,
  endContent,
  appearance = "fade",
  className,
}: HeaderProps) {
  const slots = headerVariants({ appearance });

  return (
    <header className={slots.root({ className })}>
      <div className={slots.bar()}>
        <div className={slots.start()}>{startContent ?? null}</div>
        {title != null ? (
          <Typography
            className={slots.title()}
            truncate
            type="h4"
            weight="semibold"
          >
            {title}
          </Typography>
        ) : (
          <div className="min-w-0" />
        )}
        <div className={slots.end()}>{endContent ?? null}</div>
      </div>
    </header>
  );
}
