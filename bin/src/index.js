import minimist from 'minimist';
import readme from './README.txt';
import { version } from '../../package.json';

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
	console.log('running a command...'); // eslint-disable-line no-console
}
