import fs from 'fs-extra';
import postcss from 'postcss';
import csso from 'postcss-csso';
import cssnext from 'postcss-cssnext';
import cssimport from 'postcss-import';
import log from './log';

export default (src) => (
	new Promise((resolve, reject) => {
		log.debug(`Compiling: ${src}`);
		const isProduction = process.env.NODE_ENV === 'production';
		const processor = postcss();
		const options = {
			from: src
		};

		processor
			.use(cssimport())
			.use(cssnext({
				browsers: 'last 8 versions'
			}));

		if (isProduction) {
			processor.use(csso());
		}

		Promise.resolve()
			.then(() => fs.readFile(src, 'utf-8'))
			.then((content) => processor.process(content, options))
			.then((result) => resolve(result))
			.catch(err => reject(err));
	})
);
