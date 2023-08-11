const esbuild = require("esbuild");
const res = esbuild.build({
  entryPoints: ["./src/"],
  bundle: true,
  minify: true,
  sourcemap: false,
  format: "cjs",
  outfile: "./dist/index.js",
  platform: "node",
});
