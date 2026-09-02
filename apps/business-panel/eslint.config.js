import { config } from "@repo/eslint-config/react-internal";

export default [
  ...config,
  {
    rules: {
      "turbo/no-undeclared-env-vars": "off",
    },
  },
];
