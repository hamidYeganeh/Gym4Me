import { flagVariants } from "./Flag.styles";

const FLAG_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
} as const;

type FlagSize = keyof typeof FLAG_SIZES | number;

const IRAN_FLAG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" width="100%" height="100%">
    <path d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z" fill="#F0F0F0"/>
    <path d="M13.2471 7.39127H11.9388C11.9496 7.53506 11.9557 7.68014 11.9557 7.82604C11.9557 8.79338 11.7139 9.731 11.2924 10.3984C11.1624 10.6043 10.9439 10.895 10.6514 11.0911V7.39124H9.34703V11.0911C9.05457 10.895 8.83602 10.6043 8.70598 10.3984C8.28441 9.731 8.04266 8.79338 8.04266 7.82604C8.04266 7.68014 8.04883 7.53502 8.05961 7.39127H6.75125C6.74285 7.53436 6.73828 7.67928 6.73828 7.82604C6.73828 10.5079 8.17062 12.6087 9.99914 12.6087C11.8277 12.6087 13.26 10.5079 13.26 7.82604C13.2601 7.67928 13.2555 7.53436 13.2471 7.39127Z" fill="#D80027"/>
    <path d="M4.13035 4.78261H5.43469V5.65218H6.73902V4.78261H8.04336V5.65218H9.34769V4.78261H10.652V5.65218H11.9564V4.78261H13.2607V5.65218H14.565V4.78261H15.8694V5.65218H19.0075C17.3902 2.30723 13.9645 0 9.99992 0C6.03535 0 2.60969 2.30723 0.992188 5.65218H4.13035V4.78261Z" fill="#6DA544"/>
    <path d="M15.8695 14.3478V15.2173H14.5652V14.3478H13.2608V15.2173H11.9565V14.3478H10.6521V15.2173H9.34781V14.3478H8.04348V15.2173H6.73914V14.3478H5.43469V15.2173H4.13035V14.3478H0.992188C2.60969 17.6927 6.03531 20 9.99992 20C13.9645 20 17.3902 17.6927 19.0077 14.3478H15.8695Z" fill="#D80027"/>
</svg>`;

function resolveSize(size: FlagSize = "lg"): number {
  return typeof size === "number" ? size : FLAG_SIZES[size];
}

/** Iran-only mark so PhoneField does not pull the full country-flag atlas. */
export function IranFlag({
  size = "lg",
  className,
}: {
  size?: FlagSize;
  className?: string;
}) {
  const px = resolveSize(size);
  const { root } = flagVariants({ rounded: true });

  return (
    <span
      aria-label="Iran"
      className={root({ className })}
      dangerouslySetInnerHTML={{ __html: IRAN_FLAG_SVG }}
      role="img"
      style={{ width: px, height: px }}
      title="Iran"
    />
  );
}
