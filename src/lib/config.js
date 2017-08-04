import path from 'path';
import fs from 'fs-extra';
import pathsJSON from '../paths.json';

const config = {
	debug: false,
	cwd: null,
	watch: null
};

const addRenderers = () => (
	new Promise((resolve, reject) => {
		try {
			const rndrs = config.paths.renderers;
			config.renderers = new Map();
			fs
				.readdirSync(rndrs)
				.filter(name => fs.statSync(`${rndrs}/${name}`).isDirectory() && !name.startsWith('_'))
				.forEach(name => {
					const pathname = `${name}Renderer`;
					config.renderers.set(name, { pathname, dependencies: null });
					config.paths[pathname] = path.resolve(rndrs, name);
				});
			resolve();
		} catch (err) {
			return reject();
		}
	})
);

config.set = (options = {}) => (
	new Promise((resolve) => {
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
		config.dependants = new Map();
		config.paths = {};
		
		Object.keys(pathsJSON).forEach((pathname) => {
			config.paths[pathname] = path.resolve(config.cwd, pathsJSON[pathname]);
		});
		
		Promise.resolve()
			.then(addRenderers)
			.then(() => resolve());
	})
);

export default config;
