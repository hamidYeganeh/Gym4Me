import { Typography } from "@heroui/react/typography";
import { headerVariants } from "./Header.styles";
import type { HeaderProps } from "./Header.types";

export function Header({
  title,
  startContent,
  endContent,
  className,
}: HeaderProps) {
  const slots = headerVariants();

  return (
    <header className={slots.root({ className })}>
      <div className={slots.bar()}>
        {startContent ? (
          <div className={slots.start()}>{startContent}</div>
        ) : null}
        {title != null ? (
          <Typography className={slots.title()} type="h4" weight="semibold">
            {title}
          </Typography>
        ) : (
          <div className="min-w-0 flex-1" />
        )}
        {endContent ? <div className={slots.end()}>{endContent}</div> : null}
      </div>
    </header>
  );
}
