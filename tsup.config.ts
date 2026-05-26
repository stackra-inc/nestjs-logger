import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  target: "es2022",
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: [
    "@nestjs/common",
    "@nestjs/core",
    "pino-pretty",
    "react",
    "@vivtel/metadata",
    "reflect-metadata",
  ],
});
