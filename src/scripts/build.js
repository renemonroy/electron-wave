import fs from 'fs-extra';
import log from '../lib/log';
import config from '../lib/config';
import prepare from '../lib/prepare';
import produce from '../lib/produce';
import deliver from '../lib/deliver';

export default (options) => {
	const hrstart = process.hrtime();

	process.env.NODE_ENV = 'production';

	log.debugging = Boolean(options.debug);
	log.clear();

	options.cwd = process.cwd();

	config
		.set(options)
		.then(() => {
			const { productName } = JSON.parse(fs.readFileSync(config.paths.package, 'utf-8'));
			log.sign(productName, { font: 'Big' });
			return;
		})
		.then(prepare)
		.then(produce)
		.then(deliver)
		.then(() => {
			const hrend = process.hrtime(hrstart);
			log.debug('App config: ↴\n', config);
			log.success(`Building done in ${hrend[0]}s with ${(hrend[1] / 1000000).toFixed(3)}ms`);
		})
		.catch((err) => {
			log.error(`${err.message || err}\n`);
			process.exit(1);
		});
};
