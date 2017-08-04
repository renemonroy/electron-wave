import log from './log';

export default () => (
	new Promise((resolve) => {
		log.debug('Delivering production files...');
		resolve();
	})
);
