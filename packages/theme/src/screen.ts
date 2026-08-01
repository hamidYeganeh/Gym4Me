/** Design screen grid — frame 375×812, 3 columns, 24px margins, 16px gutters. */
export const screen = {
  width: 375,
  height: 812,
  margin: 24,
  gutter: 16,
  columns: 3,
} as const;

export type ScreenTokens = typeof screen;
