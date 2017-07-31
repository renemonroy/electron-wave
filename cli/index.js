import minimist from 'minimist';
import readme from './README.txt';
import { version } from '../package.json';
import start from '../scripts/start';

const command = minimist(process.argv.slice(2), {
	boolean: ['debug'],
	default: {
		debug: false
	},
	alias: {
		d: 'debug',
		h: 'help'
	}
});

if (command.help) {
	console.log(`\n${readme.replace('{{version}}', version)}\n`); // eslint-disable-line no-console
} else if (command.version) {
	console.log(`electron-wave version ${version}`); // eslint-disable-line no-console
} else {
	const options = Object.assign({}, command);
	delete options._;
	switch (command._[0]) {
		case 'start':
			start(options);
			break;
	}
}
