/**
 * App router with page-transition support.
 * Prefer this over `next/navigation` `useRouter` so push/replace/back
 * run through [`next-transition-router`](https://github.com/ismamz/next-transition-router).
 */
export { useTransitionRouter as useRouter } from "next-transition-router";
export { Link as TransitionLink } from "next-transition-router";
