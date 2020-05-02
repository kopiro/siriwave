import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";

import pkg from "./package.json";
const INPUT = "src/siriwave.ts";

const plugins = [
  typescript({
    typescript: require("typescript"),
  }),
];

if (process.env.NODE_ENV === "development") {
  plugins.push(
    serve({
      open: 1,
      contentBase: ".",
    }),
  );
  plugins.push(
    livereload({
      watch: "dist",
    }),
  );
}

export default [false, true].reduce(
  (carry, min) =>
    carry.concat([
      {
        input: INPUT,
        output: {
          name: pkg.umdName,
          file: min ? pkg.browser.replace(".js", ".min.js") : pkg.browser,
          format: "umd",
        },
        plugins: [...plugins, ...(min ? [terser()] : [])],
      },
      {
        input: INPUT,
        output: {
          file: min ? pkg.module.replace(".js", ".min.js") : pkg.module,
          format: "es",
        },
        external: [...Object.keys(pkg.dependencies)],
        plugins: [...plugins, ...(min ? [terser()] : [])],
      },
    ]),
  [],
);
