import config from './config';
import log from './log';
import compile from './compile';

export default () => (
	new Promise((resolve, reject) => {
		log.debug('Producing bundles...');

		const compileScripts = Array.from(config.renderers.keys()).map((name) => {
			const src = config.paths[config.renderers.get(name).pathname];
			return compile.js(`${src}/index.js`).then((result) => {
				const sources = result.map.sources;
				config.renderers.get(name).dependencies = sources;
				log(config.renderers.get(name).dependencies);
				Object.keys(config.dependants).forEach((dependant) => {
					config.dependants.get(dependant).delete(name);
				});
				sources.forEach((dependency) => {
					if (!config.dependants.has(dependency)) {
						config.dependants.set(dependency, new Set());
					}
					config.dependants.get(dependency).add(name);
				});
				return result;
			});
		});
		
		Promise.all(compileScripts)
			.then(() => {
				resolve();
			})
			.catch((err) => {
				reject(err);
			});
	})
);
