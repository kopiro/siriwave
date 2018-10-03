import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';

import pkg from './package.json';

serve();
livereload({
	watch: 'dist'
});

export default [{
		input: 'src/siriwave.js',
		output: {
			file: pkg.browser,
			name: pkg.library,
			format: 'iife'
		},
		plugins: [
			resolve(),
			commonjs(),
			babel({
				exclude: 'node_modules/**'
			}),
			uglify()
		]
	},
	{
		input: 'src/siriwave.js',
		output: [
			{
				file: pkg.module,
				format: 'es'
			}
		]
	}
];