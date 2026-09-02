import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/providers/AuthProvider";

const links = [["/dashboard", "داشبورد"], ["/dashboard/users", "کاربران و دسترسی"], ["/dashboard/organizations", "سازمان‌ها و شعب"], ["/dashboard/catalog", "منابع و خدمات"], ["/dashboard/bookings", "رزروها"], ["/dashboard/memberships", "عضویت‌ها"], ["/dashboard/finance", "مالی و Ledger"], ["/dashboard/verifications", "احراز و تأیید"], ["/dashboard/notifications", "اعلان و پیامک"], ["/dashboard/audit", "گزارش ممیزی"]] as const;

export function AdminP0Shell() {
  const { logout, user } = useAuth(); const navigate = useNavigate();
  const signOut = async () => { await logout(); navigate("/sign-in", { replace: true }); };
  return <div className="p0-admin-shell" dir="rtl"><aside className="p0-admin-sidebar"><div className="p0-admin-brand"><b>Gym4Me</b><span>پنل عملیات P0/P1</span></div><nav aria-label="منوی مدیریت">{links.map(([href, label]) => <NavLink className={({ isActive }) => isActive ? "active" : ""} end={href === "/dashboard"} key={href} to={href}>{label}</NavLink>)}</nav><button className="p0-admin-logout" onClick={() => void signOut()} type="button">خروج</button></aside><main className="p0-admin-main"><header className="p0-admin-topbar"><span>کنترل سراسری پلتفرم</span><small>{[user?.name.first, user?.name.last].filter(Boolean).join(" ") || user?.phone}</small></header><Outlet /></main></div>;
}
