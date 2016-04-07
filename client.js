var chokidar = require('chokidar');
var jetpack = require('fs-jetpack');
var async = require('async');
var fp = require('path');
var minimatch = require("minimatch");
var io = require('socket.io-client');
var md5file = require('./md5file');
var recursive = require('./recursive');
var ignores = [];

function client(server, password, src, presync) {
	src = src.replace(/\\/g, '/');
	var ignorefile = fp.join(src, '.ignore');
	if (jetpack.exists(ignorefile)) {
		var lines = jetpack.read(ignorefile).split('\r\n');
		ignores = lines.filter(line => line != '');
	}
	ignores.push('.ignore');
	var socket = io.connect('http://' + server);
	console.log('connecting to %s...', server);
	socket.emit('auth', password);
	socket.on('message', function (message) {
		console.log('message from server: %s', message);
	}).on('sendfiles', function (files) {
		async.eachSeries(files, function (file, next) {
			var path = fp.join(src, file);
			console.log('send file', path);
			socket.emit('save', {
				file: file,
				content: jetpack.read(path, 'buf')
			});
			setTimeout(function () {
				next();
			}, 10);
		}, function (err) {
			console.log('files synced');
		});
	});

	chokidar.watch(src, {
		ignoreInitial: true,
	}).on('add', (path) => {
		var file = '.' + path.replace(/\\/g, '/').replace(src.replace(/\\/g, '/'), '');
		console.log('add file %s', file);
		socket.emit('save', {
			file: file,
			content: jetpack.read(path, 'buf')
		});
	}).on('change', (path) => {
		var file = '.' + path.replace(/\\/g, '/').replace(src.replace(/\\/g, '/'), '');
		console.log('change file %s', file);
		socket.emit('save', {
			file: file,
			content: jetpack.read(path, 'buf')
		});
	}).on('unlink', (path) => {
		console.log('unlink %s', path);
		var file = '.' + path.replace(/\\/g, '/').replace(src.replace(/\\/g, '/'), '');
		socket.emit('delete', file);
	});
	if (!presync) return;

	var list = [];
	async.waterfall([
		function (next) {
			recursive(src, function (err, files) {
				files = files.map(function (file) {
					return file.replace(/\\/g, '/').replace(src + '/', '');
				}).filter(function (file) {
					return !ignores.some(function (ignore) {
						return minimatch(file, ignore, {dot: true});
					});
				});
				next(null, files);
			});
		},
		function (files, next) {
			async.eachSeries(files, function (file, next) {
				async.waterfall([
					function (next) {
						md5file(fp.join(src, file), next);
					},
					function (md5, next) {
						list.push({
							file: file,
							md5: md5
						});
						next();
					}
				], next);
			}, next);
		},
	], function (err) {
		if (err) return console.log(err);
		socket.emit('files', list);
	});
}

module.exports = client;