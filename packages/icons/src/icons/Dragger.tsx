"use client";

import { createIcon } from "../create-icon";

export const Dragger = createIcon(
  "Dragger",
  "0 0 24 24",
  <>
    <rect x="2" y="9" width="20" height="6" fill="currentColor" fillOpacity="0.2"/>
    <path d="M22 15.75H2V14.25H22V15.75Z" fill="currentColor"/>
    <path d="M22 9.75H2V8.25H22V9.75Z" fill="currentColor"/>
  </>,
);
