import Link from "next/link";
import {
  publicSiteFooterVariants,
  publicSiteHeaderVariants,
} from "./PublicSiteHeader.styles";

const header = publicSiteHeaderVariants();
const footer = publicSiteFooterVariants();

export function PublicSiteHeader() {
  return (
    <header className={header.root()}>
      <div className={header.inner()}>
        <Link className={header.brand()} href="/">
          Gym4Me
        </Link>
        <nav aria-label="ناوبری اصلی" className={header.nav()}>
          <Link className={header.link()} href="/clubs">
            باشگاه‌ها
          </Link>
          <Link className={header.link()} href="/coaches">
            مربی‌ها
          </Link>
          <Link className={header.link()} href="/for-clubs">
            برای باشگاه‌دار
          </Link>
          <Link className={header.link()} href="/pricing">
            تعرفه
          </Link>
          <Link className={header.link()} href="/articles">
            مقالات
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicSiteFooter() {
  return (
    <footer className={footer.root()}>
      <div className={footer.inner()}>
        <span>© ۲۰۲۶ Gym4Me</span>
        <span>مدیریت باشگاه، رزرو مربی و عضویت در یک جریان یکپارچه</span>
      </div>
    </footer>
  );
}
