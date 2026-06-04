import { defineEnvVars } from "@sveltejs/kit/hooks";

export const variables = defineEnvVars({
  GITHUB_TOKEN: {},
});
