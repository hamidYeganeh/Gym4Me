import { LogoMark, resolveLogoSize } from "@repo/ui/logo-mark";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";

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
          background: "#1f1f1f",
        }}
      >
        <LogoMark
          size={size.width}
          instanceId="apple-icon"
          shadow={false}
          title=""
        />
      </div>
    ),
    size,
  );
}
