var remotefilesync = require('../');
var program = require('commander');

program.version('1.0.0')
	.option('-m, --mode <mode>', 'mode (server|client)', /^(server|client)$/i, 'server')
	.option('-h, --host <host>', 'host (client mode)')
	.option('-p, --port <n>', 'port (server mode)', parseInt, 3000)
	.option('-d, --password <password>', 'password (client|server mode)')
	.option('-t, --target <target>', 'target path (client|server mode)')
	.option('-s, --sync', 'sync files at startup (client mode)')
	.parse(process.argv);

var mode = program.mode || 'server';

if (mode == 'client') {
	var host = program.host || 'localhost:3000';
	var password = program.password || 'password';
	var sync = (program.sync) ? true : false;
	if (!program.target) {
		console.log('error - target needs to be set');
		program.help();
		process.exit();
	}
	var target = program.target;
	remotefilesync.client(host, password, target, sync);
} else if (mode == 'server') {
	var port = program.port || 3000;
	var password = program.password || 'password';
	if (!program.target) {
		console.log('error - target needs to be set');
		program.help();
		process.exit();
	}
	var target = program.target;
	remotefilesync.server(port, password, target);
} else {
	program.help();
}