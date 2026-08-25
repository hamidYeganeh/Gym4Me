import { useEffect, useState } from "react";
import type { Key } from "react";
import {
  Autocomplete,
  Description,
  Label,
  ListBox,
  SearchField,
  useFilter,
} from "@heroui/react";
import {
  adminClubs,
  adminFinance,
  adminGamification,
  adminUsers,
} from "@/shared/lib/api";

export type AdminModelKind =
  "user" | "athlete" | "coach" | "club" | "payment" | "pointRule";

type Option = { id: string; label: string; description?: string };

const optionCache = new Map<string, Option[]>();

function supportsServerSearch(kind: AdminModelKind) {
  return ["user", "athlete", "coach", "club"].includes(kind);
}

function cacheKey(kind: AdminModelKind, query = "") {
  const searchableQuery = supportsServerSearch(kind) ? query.trim() : "";
  return `${kind}:${searchableQuery.toLocaleLowerCase("fa")}`;
}

function userLabel(user: {
  name: { first: string | null; last: string | null };
  phone: string;
}) {
  return (
    [user.name.first, user.name.last].filter(Boolean).join(" ") || user.phone
  );
}

async function loadOptions(
  kind: AdminModelKind,
  query = "",
): Promise<Option[]> {
  const key = cacheKey(kind, query);
  const cached = optionCache.get(key);
  if (cached) return cached;

  let options: Option[];
  if (kind === "club") {
    const page = await adminClubs.list({
      page: 1,
      page_size: 100,
      search: query.trim() || undefined,
    });
    options = page.result.map((club) => ({
      id: club.id,
      label: club.identity.name,
      description: club.location?.address || undefined,
    }));
  } else if (kind === "payment") {
    const page = await adminFinance.listPayments({ page: 1, page_size: 100 });
    options = page.result.map((payment) => ({
      id: payment._id,
      label: payment.reference.orderId || "پرداخت",
      description: `${payment.amount.gross.toLocaleString("fa-IR")} · ${payment.status}`,
    }));
  } else if (kind === "pointRule") {
    const page = await adminGamification.listPointRules({
      page: 1,
      page_size: 100,
    });
    options = page.result.map((rule) => ({
      id: rule.id,
      label: rule.title,
      description: rule.description ?? undefined,
    }));
  } else {
    const page = await adminUsers.list({
      page: 1,
      page_size: 100,
      role: kind === "user" ? undefined : kind,
      search: query.trim() || undefined,
    });
    options = page.result.map((user) => ({
      id: user.id,
      label: userLabel(user),
      description: user.phone,
    }));
  }

  optionCache.set(key, options);
  return options;
}

type Props = {
  kind: AdminModelKind;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  description?: string;
  placeholder?: string;
  isDisabled?: boolean;
};

export function AdminModelAutocomplete({
  kind,
  label,
  value,
  onChange,
  className,
  description,
  placeholder = "انتخاب کنید",
  isDisabled,
}: Props) {
  const { contains } = useFilter({ sensitivity: "base" });
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Option[]>(
    () => optionCache.get(cacheKey(kind)) ?? [],
  );
  const [loading, setLoading] = useState(!optionCache.has(cacheKey(kind)));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const key = cacheKey(kind, query);
    const cached = optionCache.get(key);
    setOptions(cached ?? []);
    setLoading(!cached);
    setFailed(false);

    const timeout = window.setTimeout(
      () => {
        void loadOptions(kind, query)
          .then((items) => {
            if (!cancelled) setOptions(items);
          })
          .catch(() => {
            if (!cancelled) {
              setOptions([]);
              setFailed(true);
            }
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      },
      cached ? 0 : 250,
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [kind, query]);

  return (
    <Autocomplete
      allowsEmptyCollection
      className={className}
      fullWidth
      isDisabled={isDisabled}
      placeholder={loading ? "در حال دریافت گزینه‌ها…" : placeholder}
      value={value || null}
      variant="secondary"
      onChange={(key: Key | null) => onChange(key == null ? "" : String(key))}
      onClear={() => onChange("")}
      onOpenChange={(open) => {
        if (!open) setQuery("");
      }}
    >
      <Label>{label}</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      {description || failed ? (
        <Description>
          {failed
            ? "دریافت گزینه‌ها ناموفق بود؛ دوباره تلاش کنید."
            : description}
        </Description>
      ) : null}
      <Autocomplete.Popover>
        <Autocomplete.Filter
          filter={contains}
          inputValue={query}
          onInputChange={setQuery}
        >
          <SearchField autoFocus fullWidth>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="جست‌وجو با نام یا شماره…" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox>
            {options.map((option) => (
              <ListBox.Item
                id={option.id}
                key={option.id}
                textValue={`${option.label} ${option.description ?? ""}`}
              >
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm">
                    {option.label}
                  </strong>
                  {option.description ? (
                    <small className="block truncate text-muted">
                      {option.description}
                    </small>
                  ) : null}
                </span>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}
