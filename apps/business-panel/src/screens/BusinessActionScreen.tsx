import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  apiClient,
  commerceApi,
  financeApi,
  notificationsApi,
  organizationsApi,
  supplyApi,
} from "@/shared/api";
import { useAuth } from "@/shared/AuthProvider";
import { id, profile, record, string, type Entity } from "@/shared/entity";
import { routes } from "@/shared/routes";

type Kind =
  | "club"
  | "branch"
  | "staff"
  | "resource"
  | "offering"
  | "announcement"
  | "settlement"
  | "booking"
  | "checkin"
  | "reschedule"
  | "cancel";
type ScopeData = {
  organizationId: string;
  branchId: string;
  clubs: Entity[];
  branches: Entity[];
  roles: Entity[];
  resources: Entity[];
  offerings: Entity[];
  bookings: Entity[];
};
const initial: ScopeData = {
  organizationId: "",
  branchId: "",
  clubs: [],
  branches: [],
  roles: [],
  resources: [],
  offerings: [],
  bookings: [],
};
const copy: Record<
  Kind,
  { eyebrow: string; title: string; description: string; back: string }
> = {
  club: {
    eyebrow: "ساختار کسب‌وکار",
    title: "ساخت باشگاه",
    description: "اطلاعات پایه باشگاه در یک مرحله مستقل ثبت می‌شود.",
    back: routes.clubs,
  },
  branch: {
    eyebrow: "ساختار کسب‌وکار",
    title: "ساخت شعبه",
    description: "هویت، موقعیت و باشگاه مادر شعبه را ثبت کنید.",
    back: routes.clubs,
  },
  staff: {
    eyebrow: "پرسنل",
    title: "دعوت پرسنل",
    description: "نقش و محدوده دسترسی دعوت‌شونده را مشخص کنید.",
    back: routes.staff,
  },
  resource: {
    eyebrow: "عملیات",
    title: "ساخت منبع",
    description: "فضا، سالن، زمین یا ظرفیت رزروی را تعریف کنید.",
    back: routes.operations,
  },
  offering: {
    eyebrow: "عملیات",
    title: "ساخت خدمت",
    description: "خدمت، قیمت، مدت و منبع موردنیاز را در مرحله‌ای جدا ثبت کنید.",
    back: routes.operations,
  },
  announcement: {
    eyebrow: "ارتباط با اعضا",
    title: "ساخت اعلان",
    description: "اعلان هم‌زمان در Inbox، Push و SMS صف می‌شود.",
    back: routes.settings,
  },
  settlement: {
    eyebrow: "مالی",
    title: "ساخت دوره تسویه",
    description: "بازه مالی مستقلی برای محاسبه تسویه ایجاد کنید.",
    back: routes.finance,
  },
  booking: {
    eyebrow: "عملیات روزانه",
    title: "ثبت رزرو حضوری",
    description: "رزرو پرسنلی در صفحه مستقل ساخته می‌شود و پرداخت در باشگاه ثبت می‌گردد.",
    back: routes.bookings,
  },
  checkin: {
    eyebrow: "عملیات روزانه",
    title: "ثبت ورود با کد",
    description: "کد یک‌بارمصرف نمایش‌داده‌شده در اپ ورزشکار را دریافت کنید.",
    back: routes.bookings,
  },
  reschedule: {
    eyebrow: "عملیات روزانه",
    title: "تغییر زمان رزرو",
    description: "رزرو، زمان جدید و دلیل تغییر را در یک مرحله مستقل ثبت کنید.",
    back: routes.bookings,
  },
  cancel: {
    eyebrow: "عملیات روزانه",
    title: "لغو رزرو",
    description: "لغو پرسنلی با ثبت دلیل و اعمال سیاست بازپرداخت انجام می‌شود.",
    back: routes.bookings,
  },
};

async function scopeData(
  context: ReturnType<typeof useAuth>["context"],
): Promise<ScopeData> {
  if (!context?.scope.id) throw new Error("محدوده فعال معتبر نیست.");
  let organizationId =
    context.scope.type === "organization" ? context.scope.id : "";
  const branchId = context.scope.type === "branch" ? context.scope.id : "";
  let scopedClub: Entity | null = null;
  if (branchId) {
    const branch = await organizationsApi.getBranch<Entity>(
      apiClient,
      branchId,
    );
    scopedClub = await organizationsApi.getClub<Entity>(
      apiClient,
      string(branch.clubId, ""),
    );
    organizationId = string(scopedClub.organizationId, "");
  }
  if (!organizationId) throw new Error("سازمان محدوده فعال پیدا نشد.");
  const clubs = scopedClub
    ? [scopedClub]
    : (
      await organizationsApi.listClubs<Entity>(apiClient, organizationId, {
        limit: 100,
      })
    ).items;
  const branches = branchId
    ? [await organizationsApi.getBranch<Entity>(apiClient, branchId)]
    : (
      await Promise.all(
        clubs.map((club) =>
          organizationsApi.listBranches<Entity>(apiClient, id(club), {
            limit: 100,
          }),
        ),
      )
    ).flatMap((page) => page.items);
  const [roles, resourcePages, offeringPages, bookingPages] = await Promise.all([
    organizationsApi
      .staffRoles<Entity[]>(apiClient, organizationId)
      .catch(() => []),
    Promise.all(
      branches.map((branch) =>
        supplyApi
          .resources<Entity>(apiClient, id(branch), { limit: 100 })
          .catch(() => undefined),
      ),
    ),
    Promise.all(
      branches.map((branch) =>
        supplyApi
          .offerings<Entity>(apiClient, id(branch), { limit: 100 })
          .catch(() => undefined),
      ),
    ),
    Promise.all(
      branches.map((branch) =>
        commerceApi
          .branch(apiClient, id(branch), { limit: 100 })
          .catch(() => undefined),
      ),
    ),
  ]);
  return {
    organizationId,
    branchId,
    clubs,
    branches,
    roles,
    resources: resourcePages.flatMap((page) => page?.items ?? []),
    offerings: offeringPages.flatMap((page) => page?.items ?? []),
    bookings: bookingPages.flatMap((page) => page?.items ?? []),
  };
}

export function BusinessActionScreen({ kind }: { kind: Kind }) {
  const page = copy[kind];
  const navigate = useNavigate();
  const { context } = useAuth();
  const [scope, setScope] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    scopeData(context)
      .then((value) => {
        if (!cancelled) {
          setScope(value);
          setForm((current) => ({
            ...current,
            branchId: value.branchId || id(value.branches[0] ?? {}),
            clubId: id(value.clubs[0] ?? {}),
            resourceId: id(value.resources[0] ?? {}),
            roleId: id(value.roles[0] ?? {}),
            offeringId: id(value.offerings[0] ?? {}),
            bookingId: id(value.bookings[0] ?? {}),
          }));
        }
      })
      .catch((reason) => {
        if (!cancelled)
          setError(
            reason instanceof Error
              ? reason.message
              : "بارگذاری اطلاعات ناموفق بود.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [context]);
  const selectedRole = useMemo(
    () => scope.roles.find((role) => id(role) === form.roleId),
    [form.roleId, scope.roles],
  );
  const set = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      if (kind === "club")
        await organizationsApi.createClub(apiClient, {
          organization_id: scope.organizationId,
          profile: {
            name: form.name!,
            slug: form.slug!,
            description: { fa: form.description ?? "" },
          },
        });
      else if (kind === "branch")
        await organizationsApi.createBranch(apiClient, form.clubId!, {
          profile: {
            name: form.name!,
            slug: form.slug!,
            description: { fa: form.description ?? "" },
            gender_policy: "all",
            address: { city: form.city ?? "", formatted: form.address ?? "" },
          },
          location: {
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
          },
        });
      else if (kind === "staff") {
        const scopeType = string(selectedRole?.scopeType, "organization") as
          "organization" | "branch";
        await organizationsApi.invite(apiClient, scope.organizationId, {
          mobile: form.mobile!,
          role_id: form.roleId!,
          scope_type: scopeType,
          scope_id:
            scopeType === "branch" ? form.branchId! : scope.organizationId,
          employment: { title: form.title },
          expires_in_days: 7,
        });
      } else if (kind === "resource")
        await supplyApi.createResource(apiClient, form.branchId!, {
          type: form.type || "space",
          profile: {
            name: form.name!,
            slug: form.slug!,
            description: { fa: form.description ?? "" },
            gender_policy: "all",
          },
          capacity: {
            mode: form.capacityMode === "exclusive" ? "exclusive" : "shared",
            total: Number(form.capacity || 1),
          },
          booking_settings: {
            slot_duration_minutes: Number(form.duration || 60),
            allow_group: true,
            allow_recurring: true,
          },
          status: "active",
        });
      else if (kind === "offering")
        await supplyApi.createOffering(apiClient, scope.organizationId, {
          branch_ids: [form.branchId!],
          resource_requirements: [
            { resource_id: form.resourceId!, quantity: 1, mode: "required" },
          ],
          provider: { type: "organization" },
          profile: {
            name: form.name!,
            slug: form.slug!,
            type: "club_session",
            description: { fa: form.description ?? "" },
            service_mode: "in_person",
          },
          pricing: {
            currency: "IRR",
            base_amount: Number(form.price || 0) * 10,
            pricing_mode: "per_booking",
            tax_included: false,
          },
          capacity: {
            mode: "shared",
            minimum: 1,
            maximum: Number(form.capacity || 1),
          },
          booking_settings: {
            duration_minutes: Number(form.duration || 60),
            allow_group: true,
            allow_recurring: true,
          },
          status: "active",
        });
      else if (kind === "announcement") {
        const item = await notificationsApi.createAnnouncement(
          apiClient,
          scope.organizationId,
          {
            profile: {
              title: form.name!,
              message: form.message!,
              action: form.url ? { label: "مشاهده", url: form.url } : undefined,
            },
            audience: {
              type: form.branchId ? "branch_members" : "all_members",
              branch_ids: form.branchId ? [form.branchId] : [],
            },
            channels: ["in_app", "push", "sms"],
            status: "draft",
          },
        );
        await notificationsApi.publishAnnouncement(
          apiClient,
          scope.organizationId,
          id(item),
        );
      } else if (kind === "booking")
        await commerceApi.staffCreateBooking(
          apiClient,
          form.branchId!,
          {
            customer_user_id: form.customerUserId!,
            offering_id: form.offeringId!,
            starts_at: new Date(form.startsAt!).toISOString(),
            participants: [{ kind: "user", reference_id: form.customerUserId! }],
            payment_mode: form.paymentMode === "complimentary" ? "complimentary" : "pay_at_club",
            note: form.reason,
          },
          crypto.randomUUID(),
        );
      else if (kind === "checkin")
        await commerceApi.checkIn(apiClient, form.branchId!, form.token!.trim());
      else if (kind === "reschedule")
        await commerceApi.staffRescheduleBooking(
          apiClient,
          form.branchId!,
          form.bookingId!,
          new Date(form.startsAt!).toISOString(),
          form.reason!,
          crypto.randomUUID(),
        );
      else if (kind === "cancel")
        await commerceApi.staffCancelBooking(
          apiClient,
          form.branchId!,
          form.bookingId!,
          { reason: form.reason!, policy_mode: "apply" },
          crypto.randomUUID(),
        );
      else
        await financeApi.createSettlement(apiClient, scope.organizationId, {
          starts_at: new Date(form.startsAt!).toISOString(),
          ends_at: new Date(form.endsAt!).toISOString(),
          currency: "IRR",
        });
      navigate(page.back, { replace: true });
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "ثبت اطلاعات ناموفق بود.",
      );
    } finally {
      setPending(false);
    }
  };
  const field = (
    key: string,
    label: string,
    type = "text",
    required = true,
  ) => (
    <label className="field-label">
      {label}
      <input
        dir={type === "text" ? "auto" : "ltr"}
        onChange={(event) => set(key, event.target.value)}
        required={required}
        type={type}
        value={form[key] ?? ""}
      />
    </label>
  );
  const select = (
    key: string,
    label: string,
    items: Entity[],
    display: (item: Entity) => string,
  ) => (
    <label className="field-label">
      {label}
      <select
        onChange={(event) => set(key, event.target.value)}
        required
        value={form[key] ?? ""}
      >
        {items.map((item) => (
          <option key={id(item)} value={id(item)}>
            {display(item)}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div className="screen-stack">
      <header className="page-heading">
        <div>
          <span className="eyebrow">{page.eyebrow}</span>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
        </div>
        <button
          className="secondary-button"
          onClick={() => navigate(page.back)}
          type="button"
        >
          بازگشت
        </button>
      </header>
      {error ? (
        <div className="inline-alert" role="alert">
          {error}
        </div>
      ) : null}
      <form
        className="panel-card process-form"
        onSubmit={(event) => void submit(event)}
      >
        {loading ? (
          <div className="skeleton-list" />
        ) : (
          <>
            {kind === "branch"
              ? select("clubId", "باشگاه مادر", scope.clubs, (item) =>
                string(profile(item).name, "باشگاه"),
              )
              : null}
            {(
              ["staff", "resource", "offering", "announcement", "booking", "checkin", "reschedule", "cancel"] as Kind[]
            ).includes(kind) &&
              (kind !== "staff" || string(selectedRole?.scopeType) === "branch")
              ? select(
                "branchId",
                kind === "announcement" ? "شعبه مخاطب (اختیاری)" : "شعبه",
                scope.branches,
                (item) => string(profile(item).name, "شعبه"),
              )
              : null}
            {kind === "staff"
              ? select("roleId", "نقش دسترسی", scope.roles, (item) =>
                string(record(item.name).fa ?? item.code, "نقش"),
              )
              : null}
            {kind === "offering"
              ? select(
                "resourceId",
                "منبع موردنیاز",
                scope.resources.filter(
                  (item) =>
                    !form.branchId || string(item.branchId) === form.branchId,
                ),
                (item) => string(profile(item).name, "منبع"),
              )
              : null}
            {kind === "booking"
              ? select(
                "offeringId",
                "خدمت",
                scope.offerings.filter((item) =>
                  !form.branchId || (item.branchIds as unknown[] | undefined)?.map(String).includes(form.branchId),
                ),
                (item) => string(profile(item).name, "خدمت"),
              )
              : null}
            {kind === "reschedule" || kind === "cancel"
              ? select(
                "bookingId",
                "رزرو",
                scope.bookings.filter((item) =>
                  !form.branchId || string(item.branchId) === form.branchId,
                ),
                (item) => `${string(profile(record(item.offering)).name, "رزرو")} — ${id(item).slice(-6)}`,
              )
              : null}
            {kind === "staff" ? (
              <>
                {field("mobile", "شماره موبایل", "tel")}
                {field("title", "عنوان شغلی", "text", false)}
              </>
            ) : null}
            {(
              [
                "club",
                "branch",
                "resource",
                "offering",
                "announcement",
              ] as Kind[]
            ).includes(kind)
              ? field("name", kind === "announcement" ? "عنوان اعلان" : "نام")
              : null}
            {(["club", "branch", "resource", "offering"] as Kind[]).includes(
              kind,
            )
              ? field("slug", "شناسه لاتین")
              : null}
            {kind === "branch" ? (
              <>
                {field("city", "شهر")}
                {field("address", "نشانی")}
                {field("latitude", "عرض جغرافیایی", "number")}
                {field("longitude", "طول جغرافیایی", "number")}
              </>
            ) : null}
            {kind === "resource" ? (
              <>
                {field("type", "نوع منبع")}
                {field("capacity", "ظرفیت", "number")}
                {field("duration", "طول اسلات (دقیقه)", "number")}
              </>
            ) : null}
            {kind === "offering" ? (
              <>
                {field("price", "قیمت (تومان)", "number")}
                {field("capacity", "حداکثر نفر", "number")}
                {field("duration", "مدت خدمت (دقیقه)", "number")}
              </>
            ) : null}
            {kind === "announcement" ? (
              <>
                {field("message", "متن پیام")}
                {field("url", "مسیر داخلی اقدام", "text", false)}
              </>
            ) : null}
            {kind === "settlement" ? (
              <>
                {field("startsAt", "شروع بازه", "datetime-local")}
                {field("endsAt", "پایان بازه", "datetime-local")}
              </>
            ) : null}
            {kind === "booking" ? (
              <>
                {field("customerUserId", "شناسه کاربر ورزشکار")}
                {field("startsAt", "زمان شروع", "datetime-local")}
                <label className="field-label">روش تسویه
                  <select onChange={(event) => set("paymentMode", event.target.value)} value={form.paymentMode ?? "pay_at_club"}>
                    <option value="pay_at_club">پرداخت در باشگاه</option>
                    <option value="complimentary">رایگان / مهمان</option>
                  </select>
                </label>
                {field("reason", "یادداشت", "text", false)}
              </>
            ) : null}
            {kind === "checkin" ? field("token", "کد ورود") : null}
            {kind === "reschedule" ? (
              <>{field("startsAt", "زمان جدید", "datetime-local")}{field("reason", "دلیل تغییر")}</>
            ) : null}
            {kind === "cancel" ? field("reason", "دلیل لغو") : null}
            {(["club", "branch", "resource", "offering"] as Kind[]).includes(
              kind,
            )
              ? field("description", "توضیحات", "text", false)
              : null}
            <div className="process-form-actions">
              <button
                className="secondary-button"
                onClick={() => navigate(page.back)}
                type="button"
              >
                انصراف
              </button>
              <button
                className="primary-button"
                disabled={pending}
                type="submit"
              >
                {pending ? "در حال ثبت…" : "ثبت و بازگشت"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
