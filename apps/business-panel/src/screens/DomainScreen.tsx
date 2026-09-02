import { useCallback, useEffect, useMemo, useState } from "react";
import {
  accountApi,
  apiClient,
  commerceApi,
  financeApi,
  membershipsApi,
  notificationsApi,
  organizationsApi,
  supplyApi,
} from "@/shared/api";
import { useAuth } from "@/shared/AuthProvider";
import { id, jalali, money, profile, record, status, string, type Entity } from "@/shared/entity";
import { Icon, type IconName } from "@/shared/Icon";
import { useNavigate } from "react-router-dom";
import { routes } from "@/shared/routes";

type Domain = "members" | "bookings" | "finance" | "staff" | "operations" | "settings";
type Row = { id: string; title: string; detail: string; value: string; state: string };
type DomainResult = { rows: Row[]; metrics: Array<{ label: string; value: string }> };

const content: Record<Domain, { eyebrow: string; title: string; description: string; icon: IconName }> = {
  members: { eyebrow: "چرخه عمر مشتری", title: "اعضا و عضویت‌ها", description: "محصول‌ها، قراردادها و مصرف عضویت سازمان.", icon: "members" },
  bookings: { eyebrow: "عملیات روزانه", title: "رزرو و ورود", description: "صف رزروهای شعبه و وضعیت حضور.", icon: "calendar" },
  finance: { eyebrow: "کنترل مالی", title: "مالی و تسویه", description: "درآمد، تسویه، فاکتور و مغایرت Ledger.", icon: "finance" },
  staff: { eyebrow: "تیم باشگاه", title: "پرسنل و دسترسی", description: "عضویت سازمانی و دعوت‌های فعال پرسنل.", icon: "staff" },
  operations: { eyebrow: "مدیریت عملیات", title: "منابع و خدمات", description: "منابع، Offeringها و ظرفیت قابل رزرو شعبه.", icon: "operations" },
  settings: { eyebrow: "امنیت و اعلان", title: "تنظیمات حساب", description: "نشست‌های فعال و ترجیحات اعلان حساب.", icon: "settings" },
};

function entityRow(entity: Entity, fallback: string): Row {
  const data = profile(entity);
  const amount = record(entity.amount);
  return {
    id: id(entity) || crypto.randomUUID(),
    title: string(data.name ?? data.title ?? entity.name, fallback),
    detail: string(data.slug ?? entity.type ?? entity.scopeType ?? entity.createdAt, "بدون توضیح"),
    value: amount.amountMinor ? money(amount.amountMinor, amount.currency) : jalali(entity.updatedAt ?? entity.createdAt),
    state: status(entity),
  };
}

async function organizationBranches(organizationId: string): Promise<Entity[]> {
  const clubs = await organizationsApi.listClubs<Entity>(apiClient, organizationId, { limit: 100 });
  const pages = await Promise.all(clubs.items.map((club) => organizationsApi.listBranches<Entity>(apiClient, id(club), { limit: 100 })));
  return pages.flatMap((page) => page.items);
}

async function loadDomain(domain: Domain, organizationId: string, scopedBranchId: string): Promise<DomainResult> {
  if (domain === "settings") {
    const [sessions, preferences] = await Promise.all([
      accountApi.sessions(apiClient), notificationsApi.preferences(apiClient),
    ]);
    return {
      rows: sessions.map((session) => ({ id: session.id, title: session.current ? "نشست فعلی" : "نشست فعال", detail: session.client.userAgent ?? session.client.ipAddress ?? "دستگاه ناشناس", value: jalali(session.expires_at), state: session.status })),
      metrics: [{ label: "نشست فعال", value: sessions.length.toLocaleString("fa-IR") }, { label: "تنظیم اعلان", value: Object.keys(preferences).length.toLocaleString("fa-IR") }],
    };
  }
  if (!organizationId && !scopedBranchId) throw new Error("Scope سازمان یا شعبه برای این بخش مشخص نیست.");
  const branches = scopedBranchId ? [] : await organizationBranches(organizationId);
  const branchId = scopedBranchId || id(branches[0] ?? {});

  if (domain === "members") {
    const [products, contracts] = await Promise.all([
      membershipsApi.managed(apiClient, organizationId, { limit: 100 }),
      membershipsApi.contracts(apiClient, organizationId, { limit: 100 }),
    ]);
    return { rows: [...contracts.items.map((item) => entityRow(item, "قرارداد عضویت")), ...products.items.map((item) => entityRow(item, "محصول عضویت"))], metrics: [{ label: "قرارداد", value: contracts.items.length.toLocaleString("fa-IR") }, { label: "محصول عضویت", value: products.items.length.toLocaleString("fa-IR") }] };
  }
  if (domain === "bookings") {
    if (!branchId) return { rows: [], metrics: [{ label: "رزرو", value: "۰" }] };
    const bookings = await commerceApi.branch(apiClient, branchId, { limit: 100 });
    return { rows: bookings.items.map((item) => ({ id: id(item), title: string(record(item.offering).profile ? record(record(item.offering).profile).name : undefined, "رزرو باشگاه"), detail: `${jalali(item.allocations[0]?.startAt)} • ${item.participants.length.toLocaleString("fa-IR")} نفر`, value: money(item.pricing.totalMinor, item.pricing.currency), state: item.status })), metrics: [{ label: "کل رزروها", value: bookings.pagination.total.toLocaleString("fa-IR") }, { label: "شعبه فعال", value: branchId ? "۱" : "۰" }] };
  }
  if (domain === "finance") {
    const [summary, settlements, reconciliation] = await Promise.all([
      financeApi.summary(apiClient, organizationId), financeApi.settlements(apiClient, organizationId, { limit: 100 }), financeApi.reconciliation(apiClient, organizationId),
    ]);
    return { rows: settlements.items.map((item) => entityRow(item, "دوره تسویه")), metrics: [{ label: "درآمد ناخالص", value: money(summary.revenue.grossMinor, summary.revenue.currency) }, { label: "تسویه‌ها", value: settlements.items.length.toLocaleString("fa-IR") }, { label: "تطبیق مالی", value: reconciliation.status === "balanced" ? "تراز" : "نیازمند بررسی" }] };
  }
  if (domain === "staff") {
    const [members, invitations] = await Promise.all([organizationsApi.members<Entity[]>(apiClient, organizationId), organizationsApi.invitations<Entity[]>(apiClient, organizationId)]);
    return { rows: [...members.map((item) => entityRow(item, "عضو سازمان")), ...invitations.map((item) => entityRow(item, "دعوت پرسنل"))], metrics: [{ label: "پرسنل", value: members.length.toLocaleString("fa-IR") }, { label: "دعوت‌ها", value: invitations.length.toLocaleString("fa-IR") }] };
  }
  if (!branchId) return { rows: [], metrics: [{ label: "منابع", value: "۰" }, { label: "خدمات", value: "۰" }] };
  const [resources, offerings] = await Promise.all([supplyApi.resources<Entity>(apiClient, branchId, { limit: 100 }), supplyApi.offerings<Entity>(apiClient, branchId, { limit: 100 })]);
  return { rows: [...resources.items.map((item) => entityRow(item, "منبع")), ...offerings.items.map((item) => entityRow(item, "خدمت"))], metrics: [{ label: "منابع", value: resources.items.length.toLocaleString("fa-IR") }, { label: "خدمات", value: offerings.items.length.toLocaleString("fa-IR") }, { label: "شعب", value: (branches.length || 1).toLocaleString("fa-IR") }] };
}

export function DomainScreen({ domain }: { domain: Domain }) {
  const navigate = useNavigate();
  const page = content[domain];
  const { context } = useAuth();
  const organizationId = context?.scope.type === "organization" ? context.scope.id ?? "" : "";
  const branchId = context?.scope.type === "branch" ? context.scope.id ?? "" : "";
  const [result, setResult] = useState<DomainResult>({ rows: [], metrics: [] });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try { setResult(await loadDomain(domain, organizationId, branchId)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "دریافت اطلاعات ناموفق بود."); }
    finally { setLoading(false); }
  }, [branchId, domain, organizationId]);
  useEffect(() => { void reload(); }, [reload]);
  const rows = useMemo(() => result.rows.filter((row) => `${row.title} ${row.detail} ${row.state}`.toLowerCase().includes(query.trim().toLowerCase())), [query, result.rows]);

  const actions = domain === "staff" ? [{ label: "دعوت پرسنل", path: routes.staffInvite }] : domain === "operations" ? [{ label: "منبع جدید", path: routes.resourceCreate }, { label: "خدمت جدید", path: routes.offeringCreate }] : domain === "bookings" ? [{ label: "رزرو حضوری", path: routes.bookingCreate }, { label: "ثبت ورود", path: routes.bookingCheckIn }, { label: "تغییر زمان", path: routes.bookingReschedule }, { label: "لغو رزرو", path: routes.bookingCancel }] : domain === "finance" ? [{ label: "دوره تسویه", path: routes.settlementCreate }] : domain === "settings" ? [{ label: "ارسال اعلان", path: routes.announcementCreate }] : [];
  return <div className="screen-stack">
    <header className="page-heading"><div><span className="eyebrow">{page.eyebrow}</span><h1>{page.title}</h1><p>{page.description}</p></div><div className="heading-actions">{actions.map(action => <button className="primary-button compact" key={action.path} onClick={() => navigate(action.path)} type="button">{action.label}</button>)}<button className="secondary-button" disabled={loading} onClick={() => void reload()} type="button">به‌روزرسانی</button></div></header>
    {error ? <div className="inline-alert" role="alert"><Icon name="warning" /><span>{error}</span></div> : null}
    <section className="compact-metrics">{result.metrics.map((metric) => <article key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong></article>)}</section>
    <section className="panel-card table-card"><div className="table-toolbar"><div><span className="migration-icon small"><Icon name={page.icon} /></span><h2>{page.title}</h2><span>{rows.length.toLocaleString("fa-IR")} ردیف</span></div><label className="search-field"><span className="sr-only">جست‌وجو</span><input onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجو…" value={query} /></label></div><div className="responsive-table"><table><thead><tr><th>عنوان</th><th>جزئیات</th><th>مقدار/تاریخ</th><th>وضعیت</th></tr></thead><tbody>
      {loading ? <tr><td colSpan={4}><div className="skeleton-list" /></td></tr> : rows.length === 0 ? <tr><td colSpan={4}><div className="empty-state"><span className="empty-icon"><Icon name={page.icon} /></span><b>داده‌ای ثبت نشده</b><p>این بخش به API واقعی متصل است و داده آزمایشی نمایش نمی‌دهد.</p></div></td></tr> : rows.map((row) => <tr key={row.id}><td><b>{row.title}</b></td><td>{row.detail}</td><td>{row.value}</td><td><span className={`status-badge ${row.state}`}>{row.state}</span></td></tr>)}
    </tbody></table></div></section>
  </div>;
}
