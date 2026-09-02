import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/AuthProvider";
import { Icon } from "@/shared/Icon";
import { routes } from "@/shared/routes";

type LoginMode = "password" | "otp";

export function SignInScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithOtp, loginWithPassword, requestOtp } = useAuth();
  const [mode, setMode] = useState<LoginMode>("password");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destination = (location.state as { from?: string } | null)?.from ?? routes.dashboard;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      if (mode === "otp" && !otpSent) {
        await requestOtp(phone);
        setOtpSent(true);
        return;
      }
      if (mode === "otp") await loginWithOtp(phone, code);
      else await loginWithPassword(phone, password);
      navigate(destination, { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ورود انجام نشد. دوباره تلاش کنید.");
    } finally {
      setPending(false);
    }
  };

  const changeMode = (next: LoginMode) => {
    setMode(next);
    setOtpSent(false);
    setCode("");
    setError(null);
  };

  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="معرفی پنل کسب‌وکار">
        <div className="auth-story-content">
          <div className="brand-lockup light"><span className="brand-mark">G</span><span><b>Gym4Me</b><small>Business</small></span></div>
          <p className="auth-kicker">فرماندهی یکپارچه باشگاه</p>
          <h1>کسب‌وکارت را با وضوح بیشتر اداره کن.</h1>
          <p>فروش، اعضا، رزروها و عملیات روزانه باشگاه در یک فضای امن و مستقل از اپ ورزشکار.</p>
          <div className="auth-benefits">
            <span><Icon name="check" /> دسترسی مبتنی بر نقش مالک</span>
            <span><Icon name="check" /> مناسب دسکتاپ، تبلت و موبایل</span>
            <span><Icon name="check" /> اطلاعات زنده از API باشگاه</span>
          </div>
        </div>
        <div className="auth-orb" aria-hidden="true" />
      </section>

      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={(event) => void handleSubmit(event)}>
          <div className="auth-heading"><span className="secure-pill">پنل اختصاصی مالکان</span><h2>ورود به پنل کسب‌وکار</h2><p>با همان حساب Gym4Me وارد شوید.</p></div>
          <div className="auth-tabs" role="tablist" aria-label="روش ورود">
            <button className={mode === "password" ? "is-active" : ""} onClick={() => changeMode("password")} role="tab" type="button">رمز عبور</button>
            <button className={mode === "otp" ? "is-active" : ""} onClick={() => changeMode("otp")} role="tab" type="button">کد یکبار مصرف</button>
          </div>
          <label className="field-label">شماره موبایل<input autoComplete="tel" inputMode="tel" onChange={(event) => setPhone(event.target.value)} placeholder="۰۹۱۲۱۲۳۴۵۶۷" required value={phone} /></label>
          {mode === "password" ? (
            <label className="field-label">رمز عبور<input autoComplete="current-password" minLength={6} onChange={(event) => setPassword(event.target.value)} placeholder="رمز عبور حساب" required type="password" value={password} /></label>
          ) : otpSent ? (
            <label className="field-label">کد تایید<input autoComplete="one-time-code" inputMode="numeric" maxLength={6} onChange={(event) => setCode(event.target.value)} placeholder="کد ۶ رقمی" required value={code} /></label>
          ) : <p className="otp-hint">کد ورود به شماره موبایل حساب مالک ارسال می‌شود.</p>}
          {error ? <div className="form-error" role="alert"><Icon name="warning" />{error}</div> : null}
          <button className="primary-button" disabled={pending} type="submit">{pending ? "لطفاً صبر کنید…" : mode === "otp" && !otpSent ? "ارسال کد ورود" : "ورود به پنل"}<Icon name="arrow" /></button>
          {mode === "otp" && otpSent ? <button className="text-button" onClick={() => setOtpSent(false)} type="button">ویرایش شماره موبایل</button> : null}
          <p className="auth-footnote">این پنل فقط برای مالکان و کاربران دارای دسترسی سازمانی است.</p>
        </form>
      </section>
    </main>
  );
}
