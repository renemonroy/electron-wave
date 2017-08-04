import config from './config';
import log from './log';
import compile from './compile';

export default () => (
	new Promise((resolve, reject) => {
		log.debug('Producing bundles...');

		const compileScripts = Array.from(config.renderers.keys()).map((name) => {
			const renderer = config.renderers.get(name);
			const src = config.paths[renderer.pathname];
			return compile.js(`${src}/index.js`).then((result) => {
				const dependencies = result.map.sources;
				const dependants = config.dependants;
				renderer.dependencies = dependencies;
				Object.keys(dependants).forEach((dependant) => {
					dependants.get(dependant).delete(name);
				});
				dependencies.forEach((dependency) => {
					if (!dependants.has(dependency)) {
						dependants.set(dependency, new Set());
					}
					dependants.get(dependency).add(name);
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
