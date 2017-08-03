import path from 'path';
import fs from 'fs-extra';
import pathsJSON from '../paths.json';

const SOURCE_CONTEXT = '{{sourceContext}}';

const config = {
	debug: false,
	cwd: null,
	watch: null
};

const rendererExists = (rendererPath) => (
	fs.statSync(rendererPath).isDirectory()
);

const buildRenderers = (renderersConfig) => {
	const renderers = {};
	Object.keys(renderersConfig).forEach((key) => {
		const rendrPath = renderersConfig[key];
		const rendererPath = path.normalize(rendrPath.replace(SOURCE_CONTEXT, config.paths.src));
		if (rendererExists(rendererPath)) {
			const pathname = `${key}Renderer`;
			renderers[key] = { pathname };
			config.paths[pathname] = rendererPath;
		} else {
			throw new Error(`No such dir renderer exists with name ${key}.`);
		}
	});
	return renderers;
};

config.set = (options = {}) => (
	new Promise((resolve, reject) => {
		Object.keys(options).forEach(key => {
			if (config.hasOwnProperty(key)) {
				config[key] = typeof options[key] === 'undefined' ?
					config[key] : options[key];
			}
		});

		if (!path.isAbsolute(config.cwd)) {
			config.cwd = path.normalize(path.join(process.cwd(), config.cwd));
		}

		config.cache = new Map();
		config.paths = {};
		
		Object.keys(pathsJSON).forEach((pathname) => {
			config.paths[pathname] = path.resolve(config.cwd, pathsJSON[pathname]);
		});

		if (!fs.existsSync(config.paths.wave)) {
			return reject('No wave.json found at root of project.');
		}

		const { mainJS, renderers } = JSON.parse(fs.readFileSync(config.paths.wave, 'utf-8'));
		
		config.paths.mainJS = path.normalize(mainJS.replace(SOURCE_CONTEXT, config.paths.src));
		config.renderers = buildRenderers(renderers);

		resolve();
	})
);

export default config;
