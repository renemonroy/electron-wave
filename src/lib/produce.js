import path from 'path';
import config from './config';
import log from './log';
import compileCSS from './compileCSS';
import compileJS from './compileJS';

const INDEX_JS = config.indexJS;
const INDEX_CSS = config.indexCSS;

export default () => (
	new Promise((resolve, reject) => {
		log.debug('Producing bundles...');

		const syncDependants = (name, dependencies) => {
			Object.keys(config.dependants).forEach((dependant) => {
				config.removeDependantFromSource(name, dependant);
			});
			dependencies.forEach((dependency) => {
				config.addDependantToSource(name, dependency);
			});
			return;
		};

		const compileRenderersStyles = Array.from(config.renderers.keys()).map((name) => {
			const renderer = config.renderers.get(name);
			const src = path.join(config.paths[renderer.pathname], INDEX_CSS);
			return compileCSS(src).then((result) => {
				const dependencies = [];
				result.messages.forEach((msg) => {
					if (msg.type === 'dependency') dependencies.push(msg.file);
				});
				syncDependants(name, dependencies);
				return { type: 'css', context: 'renderer', name, src, code: result.css };
			});
		});

		const compileRenderersScripts = Array.from(config.renderers.keys()).map((name) => {
			const renderer = config.renderers.get(name);
			const src = path.join(config.paths[renderer.pathname], INDEX_JS);
			return compileJS(src).then((result) => {
				syncDependants(name, result.map.sources);
				return { type: 'js', context: 'renderer', name, src, code: result.code };
			});
		});

		const compileMainScripts = () => {
			const name = 'main';
			const src = path.join(config.paths.main, INDEX_JS);
			return compileJS(src).then((result) => {
				syncDependants('$root', result.map.sources);
				return { type: 'js', context: name, name, src, code: result.code };
			});
		};
		
		Promise.all([...compileRenderersStyles, ...compileRenderersScripts, ...compileMainScripts()])
			.then((result) => {
				log.debug('Bundles: ↴\n', result);
				resolve(result);
			})
			.catch((err) => reject(err));
	})
);
