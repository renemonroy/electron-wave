import fs from 'fs-extra';
import log from './log';
import config from './config';

export default (bundles) => (
	new Promise((resolve, reject) => {
		log.debug('Delivering production files...');
		const renderersPath = config.paths.renderers;
		const buildPath = config.paths.build;
		
		const ensureFiles = bundles.map((bundle) => {
			if (bundle.type === 'renderer') {
				const src = bundle.src.replace(renderersPath, buildPath);
				return fs.ensureFile(src).then(() => {
					fs.writeFileSync(src, bundle.code);
					return src;
				});
			} else {
				return null;
			}
		});

		Promise
			.all(ensureFiles)
			.then((results) => {
				log.debug('Created sources: ↴\n', results);
				resolve();
			})
			.catch((err) => reject(err));
	})
);
