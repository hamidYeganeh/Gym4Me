# قالب‌های کاوه‌نگار Gym4Me

این قالب‌ها باید در پنل کاوه‌نگار به‌عنوان «الگوی اعتبارسنجی» ساخته و تأیید شوند. نام‌ها فقط حروف انگلیسی و عدد دارند. زمان‌های `%token10` با تقویم شمسی و منطقه زمانی `Asia/Tehran` به‌شکل `YYYY MM DD HH MM` ارسال می‌شوند.

| متغیر محیطی | نام پیش‌فرض قالب | متن دقیق قالب |
|---|---|---|
| `KAVENEGAR_OTP_TEMPLATE` | `gym4meotp` | `کد ورود Gym4Me: %token` |
| `KAVENEGAR_TEMPLATE_BOOKING_CONFIRMED` | `gym4mebookingconfirmed` | `رزرو Gym4Me با شناسه %token تایید شد.` |
| `KAVENEGAR_TEMPLATE_BOOKING_REMINDER` | `gym4mebookingreminder` | `یادآوری رزرو %token` سپس خط بعد `زمان: %token10` |
| `KAVENEGAR_TEMPLATE_BOOKING_CANCELLED` | `gym4mebookingcancelled` | `رزرو Gym4Me با شناسه %token لغو شد.` |
| `KAVENEGAR_TEMPLATE_BOOKING_RESCHEDULED` | `gym4mebookingrescheduled` | `زمان رزرو %token تغییر کرد.` سپس خط بعد `زمان جدید: %token10` |
| `KAVENEGAR_TEMPLATE_WAITLIST_AVAILABLE` | `gym4mewaitlist` | `%token` سپس خط بعد `برای سانس درخواستی ظرفیت آزاد شد.` سپس خط بعد `مهلت: %token10` |
| `KAVENEGAR_TEMPLATE_PAYMENT_FAILED` | `gym4mepaymentfailed` | `پرداخت Gym4Me با شناسه %token ناموفق یا منقضی شد.` |

برای محیط واقعی، `OTP_PROVIDER=kavenegar`، `NOTIFICATION_PROVIDER=kavenegar` و `KAVENEGAR_API_KEY` باید در secret manager هر دو سرویس API و worker تنظیم شوند. اطلاعیه‌های آزاد سازمانی قالب ثابت ندارند و از مسیر ارسال عادی با `KAVENEGAR_SENDER` می‌روند.
