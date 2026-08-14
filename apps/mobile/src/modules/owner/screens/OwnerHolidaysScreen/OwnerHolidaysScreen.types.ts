import type { OwnerHolidaysData } from "../../lib/owner-holidays-data";

export type OwnerHolidayForm = {
  title: string;
  jalaliDate: string;
};

export type OwnerHolidaysScreenProps = {
  data: OwnerHolidaysData;
  form: OwnerHolidayForm;
  pending?: boolean;
  onFormChange: (patch: Partial<OwnerHolidayForm>) => void;
  onAddHoliday?: () => void;
  className?: string;
};
