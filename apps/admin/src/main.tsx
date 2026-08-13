import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { defaultLocale, getMessages } from "@repo/i18n";
import { ThemeProvider } from "@repo/theme";
import { Toaster } from "@repo/ui/kit/Toast";
import { NextIntlClientProvider } from "next-intl";
import { AppRouter } from "./app/App";
import "./index.css";

const locale = defaultLocale;
const messages = getMessages(locale);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider defaultTheme="system" enableSystem>
        <Toaster>
          <AppRouter />
        </Toaster>
      </ThemeProvider>
    </NextIntlClientProvider>
  </StrictMode>,
);
