import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/AuthProvider";
import { Icon, type IconName } from "@/shared/Icon";
import { routes } from "@/shared/routes";

const navItems: { label: string; path: string; icon: IconName }[] = [
  { label: "نمای کلی", path: routes.dashboard, icon: "dashboard" },
  { label: "باشگاه‌ها و شعب", path: routes.clubs, icon: "clubs" },
  { label: "اعضا و عضویت‌ها", path: routes.members, icon: "members" },
  { label: "رزرو و ورود", path: routes.bookings, icon: "calendar" },
  { label: "مالی و صندوق", path: routes.finance, icon: "finance" },
  { label: "پرسنل و دسترسی", path: routes.staff, icon: "staff" },
  { label: "عملیات باشگاه", path: routes.operations, icon: "operations" },
];

export function BusinessShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const fullName = user?.displayName || "کاربر باشگاه";

  const handleLogout = async () => {
    await logout();
    navigate(routes.signIn, { replace: true });
  };

  return (
    <div className="business-layout">
      {menuOpen ? <button aria-label="بستن منو" className="sidebar-backdrop" onClick={() => setMenuOpen(false)} /> : null}
      <aside className={`business-sidebar${menuOpen ? " is-open" : ""}`}>
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">G</span>
          <span><b>Gym4Me</b><small>پنل کسب‌وکار</small></span>
        </div>

        <div className="workspace-card">
          <span className="workspace-avatar">{fullName.slice(0, 1)}</span>
          <span><b>{fullName}</b><small>حساب مالک باشگاه</small></span>
        </div>

        <nav className="primary-nav" aria-label="ناوبری اصلی">
          <span className="nav-eyebrow">مدیریت</span>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              className={({ isActive }) => `nav-item${isActive ? " is-active" : ""}`}
              onClick={() => setMenuOpen(false)}
              to={item.path}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink className={({ isActive }) => `nav-item${isActive ? " is-active" : ""}`} to={routes.settings}>
            <Icon name="settings" /><span>تنظیمات</span>
          </NavLink>
          <button className="nav-item danger" onClick={() => void handleLogout()} type="button">
            <Icon name="logout" /><span>خروج امن</span>
          </button>
        </div>
      </aside>

      <div className="business-main">
        <header className="business-topbar">
          <button className="icon-button mobile-menu" aria-label="باز کردن منو" onClick={() => setMenuOpen(true)} type="button">
            <Icon name="menu" />
          </button>
          <div className="topbar-context"><span className="status-dot" /> دسترسی امن {user?.mobile ?? "سازمانی"}</div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="اعلان‌ها" type="button"><Icon name="bell" /></button>
            <span className="topbar-date">امروز، {new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</span>
          </div>
        </header>
        <main className="business-content"><Outlet /></main>
      </div>
    </div>
  );
}
