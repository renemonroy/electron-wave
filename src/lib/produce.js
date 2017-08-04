import path from 'path';
import config from './config';
import log from './log';
import compileJS from './compileJS';

const INDEX_JS = 'index.js';

export default () => (
	new Promise((resolve, reject) => {
		log.debug('Producing bundles...');

		const compileScripts = Array.from(config.renderers.keys()).map((name) => {
			const renderer = config.renderers.get(name);
			const src = path.join(config.paths[renderer.pathname], INDEX_JS);
			return compileJS(src).then((result) => {
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
				return { renderer: name, entry: src, code: result.code };
			});
		});
		
		Promise.all(compileScripts)
			.then((result) => {
				log.debug('Bundles: ↴\n', result);
				resolve(result);
			})
			.catch((err) => reject(err));
	})
);
