import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient, organizationsApi } from "@/shared/api";
import { useAuth } from "@/shared/AuthProvider";
import { id, profile, status, string, type Entity } from "@/shared/entity";
import { Icon } from "@/shared/Icon";
import { routes } from "@/shared/routes";

export function ClubsScreen() {
  const navigate = useNavigate();
  const { context } = useAuth();
  const organizationId = context?.scope.type === "organization" ? context.scope.id ?? "" : "";
  const [clubs, setClubs] = useState<Entity[]>([]);
  const [branches, setBranches] = useState<Record<string, Entity[]>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organizationId) throw new Error("محدوده سازمانی معتبر نیست.");
    const clubPage = await organizationsApi.listClubs<Entity>(apiClient, organizationId, { limit: 100 });
    const branchPairs = await Promise.all(clubPage.items.map(async (club) => [
      id(club),
      (await organizationsApi.listBranches<Entity>(apiClient, id(club), { limit: 100 })).items,
    ] as const));
    setClubs(clubPage.items);
    setBranches(Object.fromEntries(branchPairs));
  }, [organizationId]);

  useEffect(() => {
    let cancelled = false;
    void load().catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "دریافت باشگاه‌ها ناموفق بود."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [load]);

  const filtered = useMemo(() => clubs.filter((club) => {
    const value = `${string(profile(club).name, "")} ${string(profile(club).slug, "")}`.toLowerCase();
    return value.includes(query.trim().toLowerCase());
  }), [clubs, query]);

  return <div className="screen-stack">
    <header className="page-heading"><div><span className="eyebrow">ساختار کسب‌وکار</span><h1>باشگاه‌ها و شعب</h1><p>باشگاه‌های واقعی سازمان و شعب متصل به آن‌ها.</p></div><div className="heading-actions"><button className="secondary-button compact" onClick={() => navigate(routes.branchCreate)} type="button">افزودن شعبه</button><button className="primary-button compact" onClick={() => navigate(routes.clubCreate)} type="button">افزودن باشگاه</button></div></header>
    {error ? <div className="inline-alert" role="alert"><Icon name="warning" /><span>{error}</span></div> : null}
    <section className="panel-card table-card"><div className="table-toolbar"><div><h2>فهرست باشگاه‌ها</h2><span>{filtered.length.toLocaleString("fa-IR")} مورد</span></div><label className="search-field"><span className="sr-only">جست‌وجو</span><input onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجو در نام…" value={query} /></label></div><div className="responsive-table"><table><thead><tr><th>باشگاه</th><th>شناسه</th><th>وضعیت</th><th>تعداد شعب</th><th>شناسه سیستم</th></tr></thead><tbody>
      {loading ? <tr><td colSpan={5}><div className="skeleton-list" /></td></tr> : filtered.length === 0 ? <tr><td colSpan={5}><div className="empty-state"><span className="empty-icon"><Icon name="clubs" /></span><b>باشگاهی پیدا نشد</b><p>باشگاه جدید را از همین صفحه ثبت کنید.</p></div></td></tr> : filtered.map((club) => {
        const clubId = id(club); const nameValue = string(profile(club).name, "باشگاه بدون نام");
        return <tr key={clubId}><td><div className="table-identity"><span>{nameValue.slice(0, 1)}</span><div><b>{nameValue}</b><small>{string(profile(club).description, "اطلاعات هویتی باشگاه")}</small></div></div></td><td dir="ltr">{string(profile(club).slug)}</td><td><span className={`status-badge ${status(club)}`}>{status(club)}</span></td><td>{(branches[clubId]?.length ?? 0).toLocaleString("fa-IR")}</td><td dir="ltr">{clubId}</td></tr>;
      })}
    </tbody></table></div></section>
  </div>;
}
