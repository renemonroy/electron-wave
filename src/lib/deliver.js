import fs from 'fs-extra';
import log from './log';
import config from './config';

export default (bundles) => (
	new Promise((resolve, reject) => {
		log.debug('Delivering production files...');
		const renderersPath = config.paths.renderers;
		const buildPath = config.paths.build;

		const ensureBundles = () => (
			Promise.all(bundles.map((bundle) => {
				if (bundle.type === 'renderer') {
					const src = bundle.src.replace(renderersPath, buildPath);
					return Promise.resolve()
						.then(() => fs.ensureFile(src))
						.then(() => fs.writeFile(src, bundle.code))
						.then(() => { return { src, type: bundle.type }; });
				}
			}))
		);

		Promise.resolve()
			.then(ensureBundles)
			.then((results) => {
				log.debug('Created sources: ↴\n', results);
				resolve();
			})
			.catch(err => reject(err));
	})
);
