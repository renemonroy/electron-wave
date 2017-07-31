import buble from 'rollup-plugin-buble';
import json from 'rollup-plugin-json';
import string from 'rollup-plugin-string';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	entry: 'cli/index.js',
	dest: 'bin/electron-wave',
	format: 'cjs',
	banner: '#!/usr/bin/env node',
	plugins: [
		string({
			include: '**/*.txt'
		}),
		json(),
		buble(),
		commonjs({
			include: 'node_modules/**'
		}),
		nodeResolve({
			main: true
		})
	]
};
