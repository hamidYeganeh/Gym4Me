import { LogoMark, resolveLogoSize } from "@repo/ui/common/LogoMark";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";

/** Theme `--accent` / `--accent-foreground` (oklch → sRGB). */
const ACCENT = "#1fff6f";
const ACCENT_FOREGROUND = "#030f05";

export const size = {
  width: resolveLogoSize("5xl"),
  height: resolveLogoSize("5xl"),
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: ACCENT,
        }}
      >
        <LogoMark
          size={Math.round(size.width * 0.62)}
          color={ACCENT_FOREGROUND}
          instanceId="apple-icon"
          shadow={false}
          gradient={false}
          title=""
        />
      </div>
    ),
    size,
  );
}
