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
				const removeDependant = (dependant) => dependants.get(dependant).delete(name);
				const addDependant = (dependant) => {
					if (!dependants.has(dependant)) {
						dependants.set(dependant, new Set());
					}
					dependants.get(dependant).add(name);
				};
				renderer.dependencies = dependencies;
				Object.keys(dependants).forEach(removeDependant);
				renderer.dependencies.forEach(addDependant);
				return { type: 'renderer', name, src, code: result.code };
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
