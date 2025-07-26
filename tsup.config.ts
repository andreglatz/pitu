import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  minify: true,
  sourcemap: true,
  clean: true,
  outDir: "lib",
  tsconfig: "tsconfig.json",
  external: ["twilio"],
});
