import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  vite: {
    plugins: [wasm(), topLevelAwait()],
  },

  modules: ["@nuxt/ui", "@nuxt/scripts"],
  compatibilityDate: "2025-01-31",

  colorMode: {
    preference: "light",
  },
});
