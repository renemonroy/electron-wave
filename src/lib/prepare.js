import log from './log';
import config from './config';
import fs from 'fs-extra';

export default () => (
	new Promise((resolve) => {
		const buildPath = config.paths.build;
		log.debug('Preparing files before producing...');
		Promise.resolve()
			.then(() => fs.ensureDir(buildPath))
			.then(() => fs.emptyDir(buildPath))
			.then(() => resolve());
	})
);
