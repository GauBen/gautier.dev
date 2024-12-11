import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import icons from "unplugin-icons/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    enhancedImages(),
    sveltekit(),
    icons({ compiler: "svelte", scale: 1.25, defaultClass: "icon" }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern",
        additionalData: '@use "/src/variables.scss" as *;',
      },
    },
  },
  // Create an empty "client" environment for
  // https://github.com/vitejs/vite/blob/3400a5e258a597499c0f0808c8fca4d92eeabc17/packages/vite/src/node/plugins/css.ts#L1581
  environments: { client: {} },
});
