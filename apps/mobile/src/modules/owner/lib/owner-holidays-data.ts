export type OwnerHolidayEntry = {
  id: string;
  title: string;
  jalaliDateLabel: string;
  isOfficial: boolean;
};

export type OwnerSpecialProgram = {
  id: string;
  title: string;
  jalaliDateLabel: string;
  description: string;
};

export type OwnerHolidaysData = {
  holidays: OwnerHolidayEntry[];
  programs: OwnerSpecialProgram[];
};

export const OWNER_HOLIDAYS: OwnerHolidaysData = {
  holidays: [
    {
      id: "h-1",
      title: "روز ملی شدن صنعت نفت",
      jalaliDateLabel: "۱۴۰۳/۱۲/۲۹",
      isOfficial: true,
    },
    {
      id: "h-2",
      title: "عید نوروز",
      jalaliDateLabel: "۱۴۰۳/۰۱/۰۱",
      isOfficial: true,
    },
    {
      id: "h-3",
      title: "تعطیلی تعمیرات سالن",
      jalaliDateLabel: "۱۴۰۳/۰۶/۱۰",
      isOfficial: false,
    },
  ],
  programs: [
    {
      id: "p-1",
      title: "کلاس ویژه یلدا",
      jalaliDateLabel: "۱۴۰۳/۱۰/۳۰",
      description: "جلسه گروهی با تخفیف ۲۰٪",
    },
    {
      id: "p-2",
      title: "چالش ۳۰ روزه رمضان",
      jalaliDateLabel: "۱۴۰۳/۱۲/۰۱",
      description: "برنامه تمرینی ویژه ماه مبارک",
    },
  ],
};
