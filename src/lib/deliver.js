import path from 'path';
import fs from 'fs-extra';
import log from './log';
import config from './config';

const RENDERER_JS = 'index.js';

export default (bundles) => (
	new Promise((resolve, reject) => {
		log.debug('Delivering production files...');
		const renderersPath = config.paths.renderers;
		const buildPath = config.paths.build;
		const renderers = {};

		const logResults = (results) => {
			log.debug('Created sources: ↴\n', results);
			return;
		};

		// const linkTag = src => (
		// 	`<link rel="stylesheet" type="text(css> href="${src}"`
		// );

		const scriptTag = src => (
			`<script src="${src}" type="text/javascript" charset="utf-8"></script>`
		);

		const ensureBundles = () => (
			Promise.all(bundles.map((bundle) => {
				if (bundle.type === 'renderer') {
					const src = bundle.src.replace(renderersPath, buildPath);
					renderers[bundle.name] = renderers[bundle.name] || {};
					return Promise.resolve()
						.then(() => fs.ensureFile(src))
						.then(() => fs.writeFile(src, bundle.code))
						.then(() => {
							const ext = path.extname(src).replace('.', '');
							renderers[bundle.name][ext] = src;
							return src;
						});
				}
			}))
		);

		const injectResults = () => (
			Promise.all(Object.keys(renderers).map((name) => {
				const indexHtml = path.join(name, 'index.html');
				const indexHtmlSrc = path.resolve(renderersPath, indexHtml);
				const indexHtmlBuild = path.resolve(buildPath, indexHtml);
				return Promise.resolve()
					.then(() => fs.copy(indexHtmlSrc, indexHtmlBuild))
					.then(() => fs.readFile(indexHtmlBuild, 'utf-8'))
					.then((content) => {
						return content.replace(/<\/body>/gi, `${scriptTag(RENDERER_JS)}\n</body>`);
					})
					.then((result) => fs.writeFile(indexHtmlBuild, result));
			}))
		);

		Promise.resolve()
			.then(ensureBundles)
			.then(logResults)
			.then(injectResults)
			.then(() => resolve())
			.catch(err => reject(err));
	})
);
