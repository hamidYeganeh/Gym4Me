import type { Metadata } from "next";
import { AudienceLanding } from "@/modules/marketing/screens/AudienceLanding";

export const metadata: Metadata = {
  title: "ابزار رزرو و مدیریت شاگرد برای مربی",
  description:
    "درخواست رزرو، تقویم، پرداخت، شاگرد، برنامه و درآمد مربی در Gym4Me.",
  alternates: { canonical: "/for-coaches" },
};

export default function ForCoachesPage() {
  return (
    <AudienceLanding
      capabilities={[
        {
          title: "درخواست رزرو",
          description:
            "درخواست را تأیید یا رد کنید؛ پس از تأیید، ورزشکار مهلت پرداخت مشخص دارد.",
        },
        {
          title: "تقویم و ظرفیت",
          description:
            "نوبت حضوری یا آنلاین، باشگاه محل فعالیت و زمان‌های مسدود را مدیریت کنید.",
        },
        {
          title: "حضور و جلسه",
          description: "حضور، غیبت و پایان جلسه را روی همان رزرو ثبت کنید.",
        },
        {
          title: "شاگرد و برنامه",
          description:
            "شاگردهای متصل، ارزیابی سلامت و برنامه تمرینی را با حریم خصوصی کنترل کنید.",
        },
        {
          title: "درآمد شفاف",
          description:
            "سهم مربی، وضعیت تسویه و اختلاف تسویه از دفتر کل قابل پیگیری است.",
        },
        {
          title: "پروفایل تأییدشده",
          description:
            "سابقه، تخصص، قیمت و باشگاه‌های همکار در صفحه عمومی شما نمایش داده می‌شود.",
        },
      ]}
      description="یک مسیر روشن از معرفی عمومی تا درخواست رزرو، پرداخت، حضور و تسویه؛ بدون هماهنگی پراکنده در چند پیام‌رسان."
      eyebrow="برای مربی"
      outcomes={[
        "درخواست‌های رزرو قابل کنترل",
        "کاهش نوبت‌های بدون پرداخت",
        "تقویم واحد برای جلسه‌ها",
        "تسویه و سهم درآمد شفاف",
      ]}
      primary={{ label: "مشاهده مربی‌ها", href: "/coaches" }}
      secondary={{ label: "تعرفه", href: "/pricing" }}
      title="رزرو، شاگرد و درآمد مربی را در یک تقویم مدیریت کنید"
    />
  );
}
