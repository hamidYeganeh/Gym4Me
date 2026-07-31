import { LogoMark, resolveLogoSize, type LogoSizeToken } from "@repo/ui/logo-mark";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";

const ICON_SIZES = ["md", "xl", "3xl", "6xl", "7xl"] as const satisfies LogoSizeToken[];

export function generateImageMetadata() {
  return ICON_SIZES.map((token) => {
    const px = resolveLogoSize(token);

    return {
      id: token,
      alt: "Gym4Me",
      size: { width: px, height: px },
      contentType: "image/png" as const,
    };
  });
}

export default async function Icon({
  id,
}: {
  id: Promise<string | number>;
}) {
  const token = String(await id) as LogoSizeToken;
  const px = resolveLogoSize(token);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <LogoMark
          size={px}
          instanceId={`icon-${token}`}
          shadow={false}
          title=""
        />
      </div>
    ),
    {
      width: px,
      height: px,
    },
  );
}
