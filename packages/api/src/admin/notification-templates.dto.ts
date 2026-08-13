export type NotificationChannelSetting = "enabled" | "disabled";
export type NotificationSmsSetting = "disabled" | "otp" | "transactional";

export type NotificationTemplate = {
  id: string;
  key: string;
  title: string;
  body: string;
  channels: {
    push: NotificationChannelSetting;
    sms: NotificationSmsSetting;
    inbox: NotificationChannelSetting;
  };
  smsTemplateKey: string | null;
  status: "active" | "inactive" | "archived";
  createdAt: string | null;
  updatedAt: string | null;
};

export type NotificationTemplatesResponse = {
  items: NotificationTemplate[];
};

export type ListNotificationTemplatesQuery = {
  status?: "active" | "inactive" | "archived";
  search?: string;
};

export type CreateNotificationTemplateInput = {
  key: string;
  title: string;
  body: string;
  channels?: Partial<NotificationTemplate["channels"]>;
  smsTemplateKey?: string;
};

export type UpdateNotificationTemplateInput = {
  title?: string;
  body?: string;
  channels?: Partial<NotificationTemplate["channels"]>;
  smsTemplateKey?: string;
  status?: "active" | "inactive" | "archived";
};
