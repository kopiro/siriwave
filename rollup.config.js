import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';

import pkg from './package.json';

const plugins = [];

if (process.env.NODE_ENV !== 'production') {
  plugins.push(
    serve({
      open: true,
      contentBase: '.',
    }),
  );
  plugins.push(
    livereload({
      watch: 'dist',
    }),
  );
}

export default [
  {
    input: 'src/siriwave.js',
    output: {
      file: pkg.unpkg,
      name: pkg.amdName,
      format: 'umd',
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
      }),
    ].concat(plugins),
  },
  {
    input: 'src/siriwave.js',
    output: {
      file: pkg.unpkg.replace('.js', '.min.js'),
      name: pkg.amdName,
      format: 'umd',
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
      }),
      uglify(),
    ].concat(plugins),
  },
  {
    input: 'src/siriwave.js',
    output: [
      {
        file: pkg.module,
        format: 'esm',
      },
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**',
      }),
    ],
  },
];
