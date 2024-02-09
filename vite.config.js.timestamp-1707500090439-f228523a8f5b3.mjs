// vite.config.js
import { enhancedImages } from "file:///home/gautier/gauben/gautier.dev/node_modules/@sveltejs/enhanced-img/src/index.js";
import { sveltekit } from "file:///home/gautier/gauben/gautier.dev/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import icons from "file:///home/gautier/gauben/gautier.dev/node_modules/unplugin-icons/dist/vite.js";
import { defineConfig } from "file:///home/gautier/gauben/gautier.dev/node_modules/vite/dist/node/index.js";
var vite_config_default = defineConfig({
  plugins: [
    enhancedImages(),
    sveltekit(),
    icons({ compiler: "svelte", scale: 1.25, defaultClass: "icon" })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "src/variables.scss" as *;'
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9nYXV0aWVyL2dhdWJlbi9nYXV0aWVyLmRldlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvZ2F1dGllci9nYXViZW4vZ2F1dGllci5kZXYvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvZ2F1dGllci9nYXViZW4vZ2F1dGllci5kZXYvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBlbmhhbmNlZEltYWdlcyB9IGZyb20gXCJAc3ZlbHRlanMvZW5oYW5jZWQtaW1nXCI7XG5pbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tIFwiQHN2ZWx0ZWpzL2tpdC92aXRlXCI7XG5pbXBvcnQgaWNvbnMgZnJvbSBcInVucGx1Z2luLWljb25zL3ZpdGVcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBlbmhhbmNlZEltYWdlcygpLFxuICAgIHN2ZWx0ZWtpdCgpLFxuICAgIGljb25zKHsgY29tcGlsZXI6IFwic3ZlbHRlXCIsIHNjYWxlOiAxLjI1LCBkZWZhdWx0Q2xhc3M6IFwiaWNvblwiIH0pLFxuICBdLFxuICBjc3M6IHtcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICBzY3NzOiB7XG4gICAgICAgIGFkZGl0aW9uYWxEYXRhOiAnQHVzZSBcInNyYy92YXJpYWJsZXMuc2Nzc1wiIGFzICo7JyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrUixTQUFTLHNCQUFzQjtBQUNqVCxTQUFTLGlCQUFpQjtBQUMxQixPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFFN0IsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsTUFBTSxFQUFFLFVBQVUsVUFBVSxPQUFPLE1BQU0sY0FBYyxPQUFPLENBQUM7QUFBQSxFQUNqRTtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gscUJBQXFCO0FBQUEsTUFDbkIsTUFBTTtBQUFBLFFBQ0osZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
