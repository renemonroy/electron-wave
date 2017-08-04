import log from '../lib/log';
import config from '../lib/config';

export default (options) => {
	const hrstart = process.hrtime();

	process.env.NODE_ENV = 'development';

	log.debugging = Boolean(options.debug);
	log.clear();

	options.cwd = process.cwd();

	config
		.set(options)
		// .then(produce)
		// .then(serve)
		// .then(launch)
		// .then(watch)
		.then(() => {
			const hrend = process.hrtime(hrstart);
			log.success(`Server started in ${hrend[0]}s with ${(hrend[1] / 1000000).toFixed(3)}ms`);
		})
		.catch((err) => {
			log.error(`${err.message || err}\n`);
			process.exit(1);
		});
};
