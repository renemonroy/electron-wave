import { readFileSync } from 'fs';
import eslint from 'rollup-plugin-eslint';
import buble from 'rollup-plugin-buble';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import json from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import { dependencies } from './package.json';

const { version } = JSON.parse(readFileSync('package.json', 'utf-8'));

const banner = readFileSync('src/banner.js', 'utf-8')
	.replace('{{-version}}', version);

export default {
	moduleName: 'electronWave',
	entry: 'src/electron-wave.js',
	targets: [
		{ dest: 'dist/electron-wave.js', format: 'cjs' },
		// { dest: 'dist/electron-wave.es.js', format: 'es' }
	],
	banner,
	sourceMap: true,
	plugins: [
		json(),
		eslint({
			exclude: ['node_modules/**', '**/*.html', '**/*.css', '**/*.json'],
			include: 'src/**',
			throwError: true
		}),
		buble({
			include: ['src/**'],
			target: {
				node: '0.12'
			}
		}),
		commonjs({
			include: 'node_modules/**'
		}),
		nodeResolve({
			jsnext: true
		}),
		replace({
			include: 'src/electron-wave.js',
			delimiters: ['{{-','}}'],
			sourceMap: true,
			values: { version: version }
		})
	],
	external: [
		'fs',
		'path',
		'os',
	].concat(Object.keys(dependencies))
};
