import minimist from 'minimist';
import readme from './README.txt';
import { version } from '../package.json';
import start from '../scripts/start';

const command = minimist(process.argv.slice(2), {
	alias: {
		h: 'help'
	}
});

if (command.help) {
	console.log(`\n${readme.replace('{{version}}', version)}\n`); // eslint-disable-line no-console
} else if (command.version) {
	console.log(`electron-wave version ${version}`); // eslint-disable-line no-console
} else {
	console.log('Running a command...', command._[0]); // eslint-disable-line no-console
	const { _, ...options } = command;
	switch (_[0]) {
		case 'stoptionsart':
			start(options);
			break;
	}
}
