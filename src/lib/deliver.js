import path from 'path';
import fs from 'fs-extra';
import log from './log';
import config from './config';

const INDEX_CSS = config.indexCSS;
const INDEX_JS = config.indexJS;

export default (bundles) => (
	new Promise((resolve, reject) => {
		log.debug('Delivering production files...');
		const renderersPath = config.paths.renderers;
		const renderers = {};
		const mainPath = config.paths.main;
		const buildPath = config.paths.build;

		const logResults = (results) => {
			log.debug('Created sources: ↴\n', results);
			return;
		};

		const linkTag = src => (
			`<link rel="stylesheet" type="text/css" href="${src}">`
		);

		const scriptTag = src => (
			`<script src="${src}" type="text/javascript" charset="utf-8"></script>`
		);

		const ensureBundles = () => (
			Promise.all(bundles.map((bundle) => {
				let src = null;
				if (bundle.context === 'renderer') {
					renderers[bundle.name] = renderers[bundle.main] || {};
					src = bundle.src.replace(renderersPath, buildPath);
				} else if (bundle.context === 'main') {
					src = bundle.src.replace(mainPath, buildPath);
				} else {
					log.debug('Unrecognized bundle:', bundle);
					return null;
				}
				return Promise.resolve()
					.then(() => fs.ensureFile(src))
					.then(() => fs.writeFile(src, bundle.code))
					.then(() => {
						if (bundle.context === 'renderer') {
							const ext = path.extname(src).replace('.', '');
							renderers[bundle.name][ext] = src;
						}
						return src;
					});
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
						return content
							.replace(/<\/head>/gi, `${linkTag(INDEX_CSS)}\n</head>`)
							.replace(/<\/body>/gi, `${scriptTag(INDEX_JS)}\n</body>`);
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
