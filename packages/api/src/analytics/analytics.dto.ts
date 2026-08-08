export type TouchPoint = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  referrer?: string;
  landingPage?: string;
  referralCode?: string;
  deepLink?: string;
  capturedAt?: string;
};

export type UserAttribution = {
  userId: string;
  firstTouch: TouchPoint | null;
  lastTouch: TouchPoint | null;
};

export type CaptureAttributionInput = {
  touch: TouchPoint;
};
