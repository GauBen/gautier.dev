import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
  GITHUB_TOKEN: {
    schema: {
      "~standard": {
        version: 1,
        vendor: "",
        validate: (x) => ({ value: x as string | undefined }),
      },
    },
  },
});
