import { defineConfig, presetIcons } from "unocss";

export default defineConfig({
  presets: [
    presetIcons({
      scale: 1.25,
      extraProperties: {
        "display": "inline-block",
        "vertical-align": "text-bottom",
      },
    }),
  ],
});
