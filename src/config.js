import path from 'path';
import pathsJSON from './paths.json';

const config = {
	debug: false,
	cwd: null,
	watch: null
};

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
		config.paths = {};
		
		Object.keys(pathsJSON).forEach((pathname) => {
			config.paths[pathname] = path.resolve(config.cwd, pathsJSON[pathname]);
		});

		resolve();
	})
);

export default config;
