import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient, financeApi, organizationsApi } from "@/shared/api";
import { useAuth } from "@/shared/AuthProvider";
import { id, money, profile, record, status, string, type Entity } from "@/shared/entity";
import { Icon } from "@/shared/Icon";
import { routes } from "@/shared/routes";

type DashboardState = {
  organizations: Entity[];
  clubs: Entity[];
  finance: Entity | null;
};

export function DashboardScreen() {
  const { context } = useAuth();
  const organizationId = context?.scope.type === "organization" ? context.scope.id ?? "" : "";
  const [data, setData] = useState<DashboardState>({ organizations: [], clubs: [], finance: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setError("برای داشبورد مالک، محدوده سازمانی معتبر لازم است.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    void Promise.all([
      organizationsApi.list<Entity>(apiClient, { limit: 100 }),
      organizationsApi.listClubs<Entity>(apiClient, organizationId, { limit: 100 }),
      financeApi.summary(apiClient, organizationId),
    ]).then(([organizations, clubs, finance]) => {
      if (!cancelled) setData({ organizations: organizations.items, clubs: clubs.items, finance });
    }).catch((reason) => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : "دریافت داشبورد ناموفق بود.");
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [organizationId]);

  const finance = record(data.finance);
  const bookings = record(finance.bookings);
  const revenue = record(finance.revenue);
  const memberships = record(finance.memberships);

  return <div className="screen-stack">
    <header className="page-heading"><div><span className="eyebrow">مرکز کنترل کسب‌وکار</span><h1>نمای کلی سازمان</h1><p>شاخص‌های زندهٔ رزرو، فروش و شعب از API مرکزی.</p></div><Link className="secondary-button" to={routes.clubs}>مدیریت باشگاه‌ها <Icon name="arrow" /></Link></header>
    {error ? <div className="inline-alert" role="alert"><Icon name="warning" /><span>{error}</span></div> : null}
    <section className="metric-grid" aria-label="شاخص‌های کلیدی">
      <article className="metric-card accent"><span className="metric-icon"><Icon name="clubs" /></span><div><small>باشگاه‌ها</small><strong>{loading ? "—" : data.clubs.length.toLocaleString("fa-IR")}</strong><span>{data.organizations.length.toLocaleString("fa-IR")} سازمان قابل دسترس</span></div></article>
      <article className="metric-card"><span className="metric-icon"><Icon name="calendar" /></span><div><small>رزرو تکمیل‌شده</small><strong>{loading ? "—" : Number(bookings.completed ?? 0).toLocaleString("fa-IR")}</strong><span>از {Number(bookings.total ?? 0).toLocaleString("fa-IR")} رزرو</span></div></article>
      <article className="metric-card"><span className="metric-icon"><Icon name="members" /></span><div><small>عضویت فروخته‌شده</small><strong>{loading ? "—" : Number(memberships.sold ?? 0).toLocaleString("fa-IR")}</strong><span>{Number(memberships.usages ?? 0).toLocaleString("fa-IR")} مصرف ثبت‌شده</span></div></article>
      <article className="metric-card"><span className="metric-icon"><Icon name="finance" /></span><div><small>درآمد ناخالص</small><strong className="money-value">{loading ? "—" : money(revenue.grossMinor, revenue.currency)}</strong><span>بازه گزارش جاری</span></div></article>
    </section>
    <section className="panel-card"><div className="panel-header"><div><span className="eyebrow">وضعیت عرضه</span><h2>باشگاه‌های سازمان</h2></div><Link to={routes.clubs}>مشاهده جزئیات</Link></div><div className="club-snapshot-list">
      {loading ? <div className="skeleton-list" /> : data.clubs.length === 0 ? <div className="empty-state"><span className="empty-icon"><Icon name="clubs" /></span><b>باشگاهی ثبت نشده</b><p>باشگاه و شعبه را بسازید تا رزرو و عضویت فعال شود.</p></div> : data.clubs.slice(0, 6).map((club) => {
        const name = string(profile(club).name, "باشگاه بدون نام");
        return <div className="club-snapshot" key={id(club)}><span className="club-monogram">{name.slice(0, 1)}</span><div><b>{name}</b><small>{string(profile(club).slug, id(club))}</small></div><span className={`status-badge ${status(club)}`}>{status(club)}</span></div>;
      })}
    </div></section>
  </div>;
}
