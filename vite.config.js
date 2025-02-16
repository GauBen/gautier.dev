import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import unocss from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [enhancedImages(), sveltekit(), unocss()],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern",
        additionalData: '@use "/src/variables.scss" as *;',
      },
    },
  },
});
