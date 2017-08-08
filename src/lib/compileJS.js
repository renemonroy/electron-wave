import path from 'path';
import fs from 'fs-extra';
import { rollup } from 'rollup';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import eslint from 'rollup-plugin-eslint';
import json from 'rollup-plugin-json';
import nodeGlobals from 'rollup-plugin-node-globals';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import log from './log';
import { filterNulls } from './utils';
import config from './config';

const nodeExternals = () => {
	const { dependencies } = JSON.parse(fs.readFileSync(config.paths.package, 'utf-8'));
	return Object.keys(dependencies);
};

export default (src) => (
	new Promise((resolve, reject) => {
		log.debug(`Compiling: ${src}`);
		const isProduction = process.env.NODE_ENV === 'production';
		const isMain = path.dirname(src) === config.paths.main;
		const { paths, cache } = config;

		const rollupConfig = {
			entry: src,
			cache: cache.get(src),
			plugins: filterNulls([
				json(),
				paths.eslintrc ?
					eslint({
						configFile: paths.eslintrc,
						exclude: [`${paths.nodeModules}/**`],
						include: [`${paths.src}/**`],
						useEslintrc: false,
						throwError: isProduction
					}) : null,
				buble({
					exclude: [`${paths.nodeModules}/**`]
				}),
				nodeResolve({
					extensions: ['.js'],
					browser: !isMain
				}),
				nodeGlobals(),
				replace({
					'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
				}),
				commonjs({
					include: [`${paths.nodeModules}/**`]
				}),
				isProduction ? uglify() : null
			]),
			external: isMain ? nodeExternals() : [],
		};

		rollup(rollupConfig)
			.then((bundle) => {			
				cache.set(src, bundle);
				resolve(bundle.generate({
					format: isMain ? 'cjs' : 'iife',
					moduleName: src,
					sourceMap: 'inline'
				}));
			})
			.catch((err) => {
				reject(err);
			});
	})
);
