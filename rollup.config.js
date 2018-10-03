import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';

import pkg from './package.json';

export default [{
		input: 'src/siriwave.js',
		output: {
			file: pkg.browser,
			name: pkg.library,
			format: 'umd'
		},
		plugins: [
			resolve(),
			commonjs(),
			babel({
				exclude: 'node_modules/**'
			}),
			serve(),
			livereload({
				watch: 'dist'
			}),
		]
	},
	{
		input: 'src/siriwave.js',
		output: [{
				file: pkg.main,
				format: 'cjs'
			},
			{
				file: pkg.module,
				format: 'es'
			}
		]
	}
];