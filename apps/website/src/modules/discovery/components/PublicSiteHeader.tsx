import Link from "next/link";

export function PublicSiteHeader() {
  return (
    <header className="border-b border-border bg-background/95 px-6 py-4 text-foreground backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Link className="text-lg font-bold tracking-tight" href="/">
          Gym4Me
        </Link>
        <nav aria-label="ناوبری اصلی" className="flex flex-wrap gap-5 text-sm">
          <Link className="hover:text-accent" href="/clubs">
            باشگاه‌ها
          </Link>
          <Link className="hover:text-accent" href="/coaches">
            مربی‌ها
          </Link>
          <Link className="hover:text-accent" href="/for-clubs">
            برای باشگاه‌دار
          </Link>
          <Link className="hover:text-accent" href="/pricing">
            تعرفه
          </Link>
          <Link className="hover:text-accent" href="/articles">
            مقالات
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicSiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-8 text-sm text-muted">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3">
        <span>© ۲۰۲۶ Gym4Me</span>
        <span>مدیریت باشگاه، رزرو مربی و عضویت در یک جریان یکپارچه</span>
      </div>
    </footer>
  );
}
