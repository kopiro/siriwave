import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";

import pkg from "./package.json";

const devPlugins = [];

if (process.env.NODE_ENV === "development") {
  devPlugins.push(
    serve({
      open: true,
      contentBase: ".",
    }),
  );
  devPlugins.push(
    livereload({
      watch: "dist",
    }),
  );
}

const INPUT = "src/siriwave.js";

export default [
  // browser-friendly UMD build
  {
    input: INPUT,
    output: {
      name: "SiriWave",
      file: pkg.browser,
      format: "umd",
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: ["node_modules/**"],
      }),
    ].concat(devPlugins),
  },
  // browser-friendly UMD minified build
  {
    input: INPUT,
    output: {
      name: "SiriWave",
      file: pkg.browser.replace(".js", ".min.js"),
      format: "umd",
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: ["node_modules/**"],
      }),
      terser(),
    ],
  },

  // ES/CJS builds
  {
    input: INPUT,
    external: [...Object.keys(pkg.dependencies)],
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
  },
];
