import config from './config';
import log from './log';
import compile from './compile';

export default () => (
	new Promise((resolve, reject) => {
		log.debug('Producing distribution folder...');

		const renderersNames = Object.keys(config.renderers);

		const compileScripts = renderersNames.map((name) => {
			const src = config.paths[config.renderers[name].pathname];
			return compile.compileJS(`${src}/index.js`);
		});
		
		Promise.all(compileScripts)
			.then((data) => {
				log.debug(data);
				resolve();
			})
			.catch((err) => {
				reject(err);
			});
	})
);
