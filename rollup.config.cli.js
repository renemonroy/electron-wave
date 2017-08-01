import buble from 'rollup-plugin-buble';
import eslint from 'rollup-plugin-eslint';
import json from 'rollup-plugin-json';
import string from 'rollup-plugin-string';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	entry: 'bin/src/index.js',
	dest: 'bin/electron-wave',
	format: 'cjs',
	banner: '#!/usr/bin/env node',
	plugins: [
		string({
			include: '**/*.txt'
		}),
		json(),
		eslint({
			exclude: ['node_modules/**', '**/*.html', '**/*.css', '**/*.json'],
			include: 'bin/src/**',
			throwError: true
		}),
		buble(),
		commonjs({
			include: 'node_modules/**'
		}),
		nodeResolve({
			main: true
		})
	],
	external: [
		'fs',
		'path',
		'child_process',
		'util',
		'@renemonroy/electron-wave'
	]
};
