#!/usr/bin/env node
/**
 * Rasterize Gym4Me logo sources, then generate Capacitor Android/iOS/PWA assets.
 *
 * Brand:
 *   accent             #1fff6f  (theme --accent)
 *   accent-foreground  #030f05  (theme --accent-foreground)
 *   dark bg            #1f1f1f  (theme --background dark)
 *   light              #f7f7f7  (theme --background light)
 *
 * Icon:   bg-accent + logo in accent-foreground.
 * Splash: bg-accent + logo in background color (text-background).
 */
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "assets");
const LOGO_SVG = path.join(ASSETS, "logo-mark.svg");
const ROBOTO_BOLD = path.resolve(
  ROOT,
  "../../packages/fonts/files/Roboto-Bold.ttf",
);

const BRAND = {
  accent: "#1fff6f",
  accentForeground: "#030f05",
  dark: "#1f1f1f",
  light: "#f7f7f7",
};

async function solidPng(size, color, outPath) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${color}"/></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

/** Recolor logo fill paths (source SVG uses BRAND.accent). */
function tintLogoSvg(svgBuffer, fill) {
  return Buffer.from(
    svgBuffer.toString("utf8").replaceAll(BRAND.accent, fill),
  );
}

async function composeLogo({
  canvas,
  logoSize,
  background,
  outPath,
  transparent = false,
  logoFill,
}) {
  const logoSvgRaw = await readFile(LOGO_SVG);
  const logoSvg = logoFill ? tintLogoSvg(logoSvgRaw, logoFill) : logoSvgRaw;
  const logo = await sharp(logoSvg)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const base = transparent
    ? {
        create: {
          width: canvas,
          height: canvas,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      }
    : {
        create: {
          width: canvas,
          height: canvas,
          channels: 4,
          background: background,
        },
      };

  const left = Math.round((canvas - logoSize) / 2);
  const top = Math.round((canvas - logoSize) / 2);

  await sharp(base)
    .composite([{ input: logo, left, top }])
    .png()
    .toFile(outPath);
}

/**
 * Full-bleed splash matching `/splash`: centered logo (5xl = 180 CSS px) +
 * Roboto Bold "Gym4Me" below (text-5xl / mt-5), no subtitle.
 * Scale assumes CENTER_CROP on a ~844pt-tall phone.
 */
async function composeSplashScreen({
  canvas,
  background,
  logoFill,
  textFill,
  outPath,
}) {
  const REF_VIEWPORT_PT = 844;
  const WEB_LOGO_PX = 180; // LOGO_SIZES["5xl"]
  const WEB_BRAND_PX = 48; // text-5xl
  const WEB_GAP_PX = 20; // mt-5
  const scale = canvas / REF_VIEWPORT_PT;

  const logoSize = Math.round(WEB_LOGO_PX * scale);
  const fontSize = Math.round(WEB_BRAND_PX * scale);
  const gap = Math.round(WEB_GAP_PX * scale);

  const logoSvgRaw = await readFile(LOGO_SVG);
  const logoSvg = tintLogoSvg(logoSvgRaw, logoFill);
  const logo = await sharp(logoSvg)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const logoLeft = Math.round((canvas - logoSize) / 2);
  const logoTop = Math.round((canvas - logoSize) / 2);

  const fontBase64 = (await readFile(ROBOTO_BOLD)).toString("base64");
  // Baseline sits in the lower part of the em box; pad so descenders aren't clipped.
  const textHeight = Math.round(fontSize * 1.35);
  const textTop = logoTop + logoSize + gap;
  const textSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${textHeight}">
  <defs>
    <style>
      @font-face {
        font-family: "Roboto";
        font-weight: 700;
        src: url("data:font/ttf;base64,${fontBase64}") format("truetype");
      }
    </style>
  </defs>
  <text
    x="50%"
    y="${Math.round(fontSize * 0.92)}"
    text-anchor="middle"
    font-family="Roboto"
    font-weight="700"
    font-size="${fontSize}"
    fill="${textFill}"
  >Gym4Me</text>
</svg>`;

  const textPng = await sharp(Buffer.from(textSvg)).png().toBuffer();

  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background,
    },
  })
    .composite([
      { input: logo, left: logoLeft, top: logoTop },
      { input: textPng, left: 0, top: textTop },
    ])
    .png()
    .toFile(outPath);
}

function hexToRgba(hex) {
  const h = hex.replace("#", "");
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
    alpha: 1,
  };
}

async function main() {
  await mkdir(ASSETS, { recursive: true });

  // Adaptive icon layers (1024+) — bg-accent + accent-foreground logo
  await composeLogo({
    canvas: 1024,
    logoSize: 640,
    background: hexToRgba(BRAND.accent),
    logoFill: BRAND.accentForeground,
    outPath: path.join(ASSETS, "icon-only.png"),
  });

  await composeLogo({
    canvas: 1024,
    logoSize: 640,
    background: hexToRgba(BRAND.accent),
    logoFill: BRAND.accentForeground,
    outPath: path.join(ASSETS, "icon-foreground.png"),
    transparent: true,
  });

  await solidPng(1024, BRAND.accent, path.join(ASSETS, "icon-background.png"));

  // Splash: matches `/splash` — bg-accent, 5xl logo + Roboto brand, no subtitle
  await composeSplashScreen({
    canvas: 2732,
    background: hexToRgba(BRAND.accent),
    logoFill: BRAND.light,
    textFill: BRAND.light,
    outPath: path.join(ASSETS, "splash.png"),
  });

  await composeSplashScreen({
    canvas: 2732,
    background: hexToRgba(BRAND.accent),
    logoFill: BRAND.dark,
    textFill: BRAND.dark,
    outPath: path.join(ASSETS, "splash-dark.png"),
  });

  // Also publish web-facing splash preview used by PWA / docs
  await copyFile(
    path.join(ASSETS, "splash.png"),
    path.join(ROOT, "public", "splash.png"),
  );

  // Android 12+ splash icons (logo only in the system icon mask; size synced to 5xl ratio)
  // 180/844 of a 1152 canvas ≈ 246; use ~50% of canvas for readable A12 icon.
  const splashIconLight = path.join(ASSETS, "splash-icon.png");
  const splashIconDark = path.join(ASSETS, "splash-icon-dark.png");
  const a12LogoSize = Math.round(1152 * (180 / 390)); // ~5xl on ~phone width
  await composeLogo({
    canvas: 1152,
    logoSize: a12LogoSize,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    logoFill: BRAND.light,
    transparent: true,
    outPath: splashIconLight,
  });
  await composeLogo({
    canvas: 1152,
    logoSize: a12LogoSize,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    logoFill: BRAND.dark,
    transparent: true,
    outPath: splashIconDark,
  });

  // Keep public logo in sync for web/PWA
  await copyFile(LOGO_SVG, path.join(ROOT, "public", "logo.svg"));

  // Also write a square favicon-friendly PNG into public
  await composeLogo({
    canvas: 512,
    logoSize: 320,
    background: hexToRgba(BRAND.accent),
    logoFill: BRAND.accentForeground,
    outPath: path.join(ROOT, "public", "icon-512.png"),
  });

  console.log("→ Source PNGs ready in assets/");
  // Native icon catalogs are committed and updated by the explicit copies
  // below. The old @capacitor/assets dependency bundled vulnerable archive and
  // image processors, so release asset generation no longer executes it.

  // Align Android launcher + splash colors / Android 12 icons with brand
  const resDir = path.join(ROOT, "android/app/src/main/res");
  await mkdir(path.join(resDir, "drawable"), { recursive: true });
  await mkdir(path.join(resDir, "drawable-night"), { recursive: true });
  await mkdir(path.join(resDir, "values-night"), { recursive: true });

  await copyFile(splashIconLight, path.join(resDir, "drawable/splash_icon.png"));
  await copyFile(splashIconDark, path.join(resDir, "drawable-night/splash_icon.png"));

  await writeFile(
    path.join(resDir, "values/ic_launcher_background.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${BRAND.accent}</color>
</resources>
`,
  );

  const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">${BRAND.accent.toUpperCase()}</color>
    <color name="colorPrimaryDark">${BRAND.dark.toUpperCase()}</color>
    <color name="colorAccent">${BRAND.accent.toUpperCase()}</color>
    <color name="splash_background">${BRAND.accent.toUpperCase()}</color>
</resources>
`;
  await writeFile(path.join(resDir, "values/colors.xml"), colorsXml);
  await writeFile(path.join(resDir, "values-night/colors.xml"), colorsXml);

  await writeFile(
    path.join(resDir, "values/styles.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>

    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <!-- Customize your theme here. -->
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
    </style>


    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/splash_background</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/splash_icon</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
        <!-- Pre-Android 12 full-bleed splash (night via drawable-night) -->
        <item name="android:background">@drawable/splash</item>
    </style>
</resources>
`,
  );

  // iOS LaunchScreen: accent fill so light/dark image variants never flash system bg
  const launchStoryboard = path.join(
    ROOT,
    "ios/App/App/Base.lproj/LaunchScreen.storyboard",
  );
  let storyboard = await readFile(launchStoryboard, "utf8");
  storyboard = storyboard
    .replace(
      /<color key="backgroundColor" systemColor="systemBackgroundColor"\/>/,
      `<color key="backgroundColor" red="0.1215686275" green="1" blue="0.4352941176" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>`,
    )
    .replace(
      /<systemColor name="systemBackgroundColor">[\s\S]*?<\/systemColor>\n?/,
      "",
    )
    .replace(
      /<capability name="System colors in document resources" minToolsVersion="11.0"\/>\n?/,
      "",
    );
  await writeFile(launchStoryboard, storyboard);

  console.log("Done. Regenerated Capacitor icons + splash screens.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
