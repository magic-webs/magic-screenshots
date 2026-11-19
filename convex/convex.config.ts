import { defineApp } from "convex/server";
import { v } from "convex/values";
import auth from "@convex-dev/auth/convex.config.js";
import authPasskey from "@convex-dev/auth/components/passkey/convex.config.js";
import authUsername from "@convex-dev/auth/components/username/convex.config.js";

const app = defineApp({
  env: {
    // Origin the web app is served from, e.g. https://screenshots.example.com.
    // Passkeys are bound to this origin's hostname. Defaults to localhost dev.
    SITE_URL: v.optional(v.string()),
  },
});

app.use(auth);
app.use(authPasskey);
app.use(authUsername);

export default app;
