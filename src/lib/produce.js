import config from './config';
import log from './log';
import compile from './compile';

export default () => (
	new Promise((resolve, reject) => {
		log.debug('Producing distribution folder...');

		const renderersNames = Object.keys(config.renderers);

		const compileScripts = renderersNames.map((name) => {
			const src = config.paths[config.renderers[name].pathname];
			return compile.js(`${src}/index.js`).then((result) => {
				const sources = result.map.sources;
				config.renderers[name].dependencies = sources;
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
