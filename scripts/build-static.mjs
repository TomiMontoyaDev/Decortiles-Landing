// Build estático multiplataforma (Windows/Linux): `npm run build:static` → out/
import { spawnSync } from "node:child_process";

const r = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, STATIC_EXPORT: "1" },
});
process.exit(r.status ?? 1);
