"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "@teispace/next-themes";

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={["class", "data-theme"]}
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      // Match previous next-themes localStorage-only behavior.
      storage="local"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
