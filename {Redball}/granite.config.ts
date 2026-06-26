import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "redball",
  brand: {
    displayName: "레드볼",
    primaryColor: "#E4002B",
    icon: "https://static.toss.im/appsintoss/43107/99616e79-3aa8-4e7f-aa45-bb91f63fe071.png",
  },
  web: {
    host: "0.0.0.0",
    port: 5175,
    commands: {
      dev: "vite --host",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
