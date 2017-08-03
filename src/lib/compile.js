import { rollup } from 'rollup';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import eslint from 'rollup-plugin-eslint';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import log from './log';
import { filterNulls } from './utils';
import config from './config';

const compileJS = (src) => (
	new Promise((resolve, reject) => {
		log.debug(`Compiling: ${src}`);
		const isProduction = process.env.NODE_ENV === 'production';
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
					module: true,
					jsnext: true
				}),
				replace({
					'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
				}),
				commonjs({
					include: [`${paths.nodeModules}/**`]
				})
			])
		};

		rollup(rollupConfig)
			.then((bundle) => {			
				cache.set(src, bundle);
				resolve(bundle.generate({
					format: 'iife',
					moduleName: src,
					sourceMap: isProduction ? true : 'inline'
				}));
			})
			.catch((err) => {
				reject(err);
			});
	})
);

export default {
	compileJS
};
