import type { Metadata } from "next";
import { AudienceLanding } from "@/modules/marketing/screens/AudienceLanding";

export const metadata: Metadata = {
  title: "پیدا کردن باشگاه و مربی ورزشی",
  description:
    "باشگاه و مربی تأییدشده را مقایسه کنید، رزرو کنید و عضویت و حضور خود را ببینید.",
  alternates: { canonical: "/for-athletes" },
};

export default function ForAthletesPage() {
  return (
    <AudienceLanding
      capabilities={[
        {
          title: "کشف قابل‌اعتماد",
          description:
            "اطلاعات باشگاه و مربی تأییدشده، سابقه، امکانات، قیمت و محل فعالیت را ببینید.",
        },
        {
          title: "رزرو مطمئن",
          description:
            "ظرفیت واقعی، تأیید مربی، مهلت پرداخت و وضعیت رزرو شفاف است.",
        },
        {
          title: "لغو شفاف",
          description:
            "پیش از لغو، جریمه و مبلغ بازپرداخت را دقیق مشاهده می‌کنید.",
        },
        {
          title: "عضویت و حضور",
          description:
            "اعتبار عضویت، جلسات باقی‌مانده، فریز و تاریخچه حضور را یکجا دارید.",
        },
        {
          title: "اعلان‌های ضروری",
          description:
            "تأیید، پرداخت، تغییر برنامه و یادآوری‌های مهم را از دست نمی‌دهید.",
        },
        {
          title: "حریم خصوصی سلامت",
          description:
            "اطلاعات سلامت فقط در رابطه مربی–شاگرد و با کنترل دسترسی نمایش داده می‌شود.",
        },
      ]}
      description="قبل از پرداخت اطلاعات لازم را ببینید؛ بعد از رزرو هم وضعیت، حضور، عضویت و بازپرداخت در دسترس شماست."
      eyebrow="برای ورزشکار"
      outcomes={[
        "انتخاب آگاهانه‌تر",
        "رزرو بدون ابهام",
        "بازپرداخت قابل پیش‌بینی",
        "عضویت و اعتبار همیشه در دسترس",
      ]}
      primary={{ label: "پیدا کردن باشگاه", href: "/clubs" }}
      secondary={{ label: "پیدا کردن مربی", href: "/coaches" }}
      title="باشگاه و مربی را با اطلاعات واقعی پیدا و رزرو کنید"
    />
  );
}
